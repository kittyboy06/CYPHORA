import json
import base64
from io import BytesIO
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

import os
from pathlib import Path
from PIL import Image

from ..config import BASE_DIR
from ..database import get_db
from ..models import Team, TaskSubmission
from ..websocket_manager import ws_manager
from ..auth_utils import decode_access_token

_clip_model = None
_clip_processor = None
_clip_attempted = False
_device = None

def get_clip_model():
    global _clip_model, _clip_processor, _clip_attempted, _device
    if _clip_attempted:
        return _clip_model, _clip_processor

    _clip_attempted = True
    try:
        import torch
        from transformers import CLIPProcessor, CLIPModel
        if _device is None:
            _device = "cuda" if torch.cuda.is_available() else "cpu"
        model_id = "openai/clip-vit-base-patch32"
        
        # 1. Try local cache first (instant, 100% offline, zero network requests or DNS lookups)
        try:
            _clip_processor = CLIPProcessor.from_pretrained(model_id, local_files_only=True)
            _clip_model = CLIPModel.from_pretrained(model_id, local_files_only=True).to(_device)
            print("[Stage 2] Successfully loaded CLIP model from local cache.")
            return _clip_model, _clip_processor
        except Exception:
            pass

        # 2. Try online download if local cache was missing
        try:
            _clip_processor = CLIPProcessor.from_pretrained(model_id)
            _clip_model = CLIPModel.from_pretrained(model_id).to(_device)
            print("[Stage 2] Successfully downloaded and loaded CLIP model.")
            return _clip_model, _clip_processor
        except Exception as net_err:
            print(f"[Stage 2] Note: CLIP model not found locally and network unavailable ({net_err}). Using visual pixel fallback.")
            _clip_model = None
            _clip_processor = None
    except Exception as e:
        print(f"[Stage 2] Torch/Transformers initialization error ({e}). Using visual pixel fallback.")
        _clip_model = None
        _clip_processor = None

    return _clip_model, _clip_processor

def compute_fallback_visual_similarity(user_image: Image.Image, target_image: Image.Image) -> float:
    """Reliable pixel and color histogram similarity when CLIP is unavailable."""
    try:
        import numpy as np
        u_thumb = user_image.resize((128, 128)).convert("RGB")
        t_thumb = target_image.resize((128, 128)).convert("RGB")
        u_arr = np.array(u_thumb, dtype=np.float32) / 255.0
        t_arr = np.array(t_thumb, dtype=np.float32) / 255.0
        
        # Color distribution similarity
        u_mean, t_mean = u_arr.mean(axis=(0, 1)), t_arr.mean(axis=(0, 1))
        u_std, t_std = u_arr.std(axis=(0, 1)), t_arr.std(axis=(0, 1))
        color_diff = float(np.abs(u_mean - t_mean).mean() + np.abs(u_std - t_std).mean())
        color_sim = max(0.0, min(1.0, 1.0 - 0.5 * color_diff))

        # Pixel MSE similarity
        mse = float(np.mean((u_arr - t_arr) ** 2))
        pixel_sim = float(np.exp(-3.5 * mse))

        if mse < 0.0001:
            return 100.0

        score = 0.55 * (color_sim * 100.0) + 0.45 * (pixel_sim * 100.0)
        return round(min(100.0, max(5.0, score)), 1)
    except Exception as e:
        print(f"[Stage 2] Fallback similarity error: {e}")
        return 75.0

def compute_cosine_similarity(image_base64: Optional[str], target_image_path: str) -> float:
    if not image_base64 or not image_base64.strip():
        return 0.0
    
    target_path = Path(target_image_path)
    if not target_path.is_absolute():
        target_path = BASE_DIR / target_path

    if not target_path.exists():
        print(f"[Stage 2] Target image not found at {target_path}")
        return 50.0

    try:
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        user_img_data = base64.b64decode(image_base64)
        user_image = Image.open(BytesIO(user_img_data)).convert("RGB")
        target_image = Image.open(target_path).convert("RGB")
    except Exception as e:
        print(f"[Stage 2] Error decoding user image: {e}")
        return 0.0

    try:
        import torch
        import numpy as np
        global _device
        if _device is None:
            _device = "cuda" if torch.cuda.is_available() else "cpu"
        
        model, processor = get_clip_model()
        if model is None or processor is None:
            return compute_fallback_visual_similarity(user_image, target_image)

        inputs = processor(images=[user_image, target_image], return_tensors="pt").to(_device)
        
        with torch.no_grad():
            res = model.get_image_features(**inputs)
            # Correctly extract 2D embedding tensor from transformers BaseModelOutputWithPooling
            if hasattr(res, "pooler_output") and res.pooler_output is not None:
                feats = res.pooler_output
            elif hasattr(res, "image_embeds") and res.image_embeds is not None:
                feats = res.image_embeds
            elif isinstance(res, torch.Tensor):
                feats = res
            else:
                feats = res[0]
            
            feats = feats / feats.norm(p=2, dim=-1, keepdim=True)
            raw_cos = float(torch.nn.functional.cosine_similarity(feats[0:1], feats[1:2]).item())

        # Check for identical image
        u_thumb = user_image.resize((128, 128))
        t_thumb = target_image.resize((128, 128))
        u_arr = np.array(u_thumb, dtype=np.float32) / 255.0
        t_arr = np.array(t_thumb, dtype=np.float32) / 255.0
        mse = float(np.mean((u_arr - t_arr) ** 2))

        if raw_cos >= 0.999 and mse < 0.001:
            return 100.0

        # Color distribution similarity
        u_mean, t_mean = u_arr.mean(axis=(0, 1)), t_arr.mean(axis=(0, 1))
        u_std, t_std = u_arr.std(axis=(0, 1)), t_arr.std(axis=(0, 1))
        color_diff = float(np.abs(u_mean - t_mean).mean() + np.abs(u_std - t_std).mean())
        color_sim = max(0.0, min(1.0, 1.0 - 0.5 * color_diff))
        pixel_sim = float(np.exp(-3.0 * mse))

        # Calibrate CLIP cosine (unrelated baseline ~0.50, high recreation ~0.88-0.98)
        clip_scaled = max(0.0, (raw_cos - 0.50) / 0.50)
        clip_score = (clip_scaled ** 1.35) * 100.0

        # Blended score: 70% CLIP semantic, 20% color distribution, 10% pixel structural
        final_score = 0.70 * clip_score + 0.20 * (color_sim * 100.0) + 0.10 * (pixel_sim * 100.0)
        return round(min(100.0, max(5.0, final_score)), 1)
    except Exception as e:
        print(f"[Stage 2] CLIP evaluation exception, using visual pixel fallback: {e}")
        return compute_fallback_visual_similarity(user_image, target_image)

router = APIRouter(prefix="/api/stage2", tags=["Stage 2 - Image Navigation"])

async def resolve_team(
    db: AsyncSession,
    authorization: Optional[str] = None,
    x_team_id: Optional[str] = None,
    x_team_name: Optional[str] = None,
    team_name: Optional[str] = None
) -> Optional[Team]:
    from sqlalchemy import func
    # 1. Bearer token
    if isinstance(authorization, str) and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload:
            sub = str(payload.get("sub", ""))
            if sub.isdigit():
                res = await db.execute(select(Team).filter(Team.id == int(sub)))
                t = res.scalar_one_or_none()
                if t:
                    return t
            elif sub:
                res = await db.execute(select(Team).filter(func.lower(Team.name) == sub.lower()))
                t = res.scalar_one_or_none()
                if t:
                    return t
            team_claim = payload.get("team")
            if team_claim:
                res = await db.execute(select(Team).filter(func.lower(Team.name) == str(team_claim).lower()))
                t = res.scalar_one_or_none()
                if t:
                    return t

    # 2. X-Team-Id header
    if isinstance(x_team_id, (str, int)):
        try:
            res = await db.execute(select(Team).filter(Team.id == int(x_team_id)))
            t = res.scalar_one_or_none()
            if t:
                return t
        except Exception:
            pass

    # 3. X-Team-Name header
    if isinstance(x_team_name, str) and x_team_name.strip():
        clean = x_team_name.strip().lower()
        res = await db.execute(select(Team).filter(func.lower(Team.name) == clean))
        t = res.scalar_one_or_none()
        if t:
            return t

    # 4. Request body team_name
    if isinstance(team_name, str) and team_name.strip() and team_name.lower() != "wandering nomad":
        clean = team_name.strip().lower()
        res = await db.execute(select(Team).filter(func.lower(Team.name) == clean))
        t = res.scalar_one_or_none()
        if t:
            return t

    # 5. Fallback if single team exists in DB
    res_all = await db.execute(select(Team))
    all_teams = res_all.scalars().all()
    if len(all_teams) == 1:
        return all_teams[0]

    return None

@router.get("/access-status")
async def get_stage2_access_status(
    authorization: Optional[str] = Header(None),
    x_team_id: Optional[str] = Header(None),
    x_team_name: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    team = await resolve_team(db, authorization, x_team_id, x_team_name)
    if not team:
        return {"unlocked": False, "authenticated": False, "message": "No registered team session found."}

    is_unlocked = bool(getattr(team, "round2_unlocked", 0))
    return {
        "unlocked": is_unlocked,
        "authenticated": True,
        "team_id": team.id,
        "team_name": team.name,
        "current_stage": team.current_stage,
        "message": "Round 2 access authorized by administrator." if is_unlocked else "Awaiting administrator clearance for Round 2."
    }

class Stage2Image1Request(BaseModel):
    team_name: Optional[str] = "Wandering Nomad"
    prompt: str
    image1_filename: str
    image1_base64: Optional[str] = None

@router.post("/evaluate-image1")
async def evaluate_stage2_image1(
    req: Stage2Image1Request,
    authorization: Optional[str] = Header(None),
    x_team_id: Optional[str] = Header(None),
    x_team_name: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    similarity = compute_cosine_similarity(req.image1_base64, "public/assets/round2/targets/target1.jpg")
    
    # 50 points for 100% Accuracy, reduced proportionally by accuracy percentage
    phase1_points = round(50 * (similarity / 100.0))

    team = await resolve_team(db, authorization, x_team_id, x_team_name, req.team_name)

    if team:
        # Check if image 1 submission already exists for this team
        stmt = select(TaskSubmission).filter(
            TaskSubmission.team_id == team.id,
            TaskSubmission.stage == 2,
            TaskSubmission.task_key == "r2_image_1"
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if not existing:
            team.round2_score = (getattr(team, 'round2_score', 0) or 0) + phase1_points
            team.score = (getattr(team, 'round1_score', 0) or 0) + (getattr(team, 'round2_score', 0) or 0) + (getattr(team, 'round3_score', 0) or 0)
            if team.current_stage < 2:
                team.current_stage = 2
            team.status = "active"

            submission = TaskSubmission(
                team_id=team.id,
                stage=2,
                task_key="r2_image_1",
                points_awarded=phase1_points,
                metadata_json=json.dumps({
                    "prompt": req.prompt,
                    "filename": req.image1_filename,
                    "similarity": similarity,
                    "accuracy": similarity,
                    "points_awarded": phase1_points,
                    "max_points": 50
                })
            )
            db.add(submission)
            await db.commit()
            await db.refresh(team)

            # Real-time leaderboard broadcast to Admin Portal and all workstations
            await ws_manager.broadcast_leaderboard(db)
        else:
            # Re-sync if team.round2_score is out of sync with stored submission
            stmt_sum = select(func.coalesce(func.sum(TaskSubmission.points_awarded), 0)).filter(
                TaskSubmission.team_id == team.id,
                TaskSubmission.stage == 2
            )
            r2_actual = (await db.execute(stmt_sum)).scalar() or 0
            if (team.round2_score or 0) != r2_actual:
                team.round2_score = r2_actual
                team.score = (getattr(team, 'round1_score', 0) or 0) + (team.round2_score or 0) + (getattr(team, 'round3_score', 0) or 0)
                await db.commit()
                await ws_manager.broadcast_leaderboard(db)

        return {
            "success": True,
            "phase": 1,
            "similarity": f"{similarity}%",
            "accuracy": similarity,
            "points": phase1_points,
            "new_total_score": team.score,
            "message": f"Image 1 evaluated! {similarity}% accuracy ({phase1_points}/50 PTS). Synced to database & admin."
        }

    return {
        "success": True,
        "phase": 1,
        "similarity": f"{similarity}%",
        "accuracy": similarity,
        "points": phase1_points,
        "new_total_score": phase1_points,
        "message": f"Image 1 evaluated! {similarity}% accuracy ({phase1_points}/50 PTS)."
    }

class Stage2SubmitRequest(BaseModel):
    team_name: Optional[str] = "Wandering Nomad"
    prompt: str
    slot2_filename: str
    slot3_filename: str
    slot3_base64: Optional[str] = None
    elapsed_seconds: int = 0
    remaining_seconds: int = 900
    calculated_points: Optional[int] = None

@router.post("/submit")
async def submit_stage2(
    req: Stage2SubmitRequest,
    authorization: Optional[str] = Header(None),
    x_team_id: Optional[str] = Header(None),
    x_team_name: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    image2_sim_value = compute_cosine_similarity(req.slot3_base64, "public/assets/round2/targets/target2.jpg")
    
    image2_similarity_str = f"{image2_sim_value}%"
    
    # 50 points for 100% Accuracy, reduced proportionally by accuracy percentage
    image2_points = round(50 * (image2_sim_value / 100.0))

    team = await resolve_team(db, authorization, x_team_id, x_team_name, req.team_name)

    if team:
        # Check if stage 2 image 2 submission already exists for this team
        stmt = select(TaskSubmission).filter(
            TaskSubmission.team_id == team.id,
            TaskSubmission.stage == 2,
            TaskSubmission.task_key == "r2_image_2"
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if not existing:
            team.round2_score = (getattr(team, 'round2_score', 0) or 0) + image2_points
            team.score = (getattr(team, 'round1_score', 0) or 0) + (getattr(team, 'round2_score', 0) or 0) + (getattr(team, 'round3_score', 0) or 0)
            if team.current_stage < 2:
                team.current_stage = 2
            team.status = "active"

            # Create TaskSubmission entry for Image 2
            submission = TaskSubmission(
                team_id=team.id,
                stage=2,
                task_key="r2_image_2",
                points_awarded=image2_points,
                metadata_json=json.dumps({
                    "prompt": req.prompt,
                    "slot2_file": req.slot2_filename,
                    "slot3_file": req.slot3_filename,
                    "elapsed_seconds": req.elapsed_seconds,
                    "remaining_seconds": req.remaining_seconds,
                    "similarity": image2_sim_value,
                    "accuracy": image2_sim_value,
                    "points_awarded": image2_points,
                    "max_points": 50
                })
            )
            db.add(submission)
            await db.commit()
            await db.refresh(team)

            # Broadcast new standings across all 100 workstations
            await ws_manager.broadcast_leaderboard(db)
        else:
            # Re-sync if team.round2_score is out of sync with stored submission
            stmt_sum = select(func.coalesce(func.sum(TaskSubmission.points_awarded), 0)).filter(
                TaskSubmission.team_id == team.id,
                TaskSubmission.stage == 2
            )
            r2_actual = (await db.execute(stmt_sum)).scalar() or 0
            if (team.round2_score or 0) != r2_actual:
                team.round2_score = r2_actual
                team.score = (getattr(team, 'round1_score', 0) or 0) + (team.round2_score or 0) + (getattr(team, 'round3_score', 0) or 0)
                await db.commit()
                await ws_manager.broadcast_leaderboard(db)

        return {
            "success": True,
            "points_awarded": image2_points,
            "image2_points": image2_points,
            "image2_similarity": image2_similarity_str,
            "accuracy": image2_sim_value,
            "new_total_score": team.score,
            "message": f"Image 2 evaluated! {image2_similarity_str} accuracy ({image2_points}/50 PTS). Synced to database & admin."
        }

    return {
        "success": True,
        "points_awarded": image2_points,
        "image2_points": image2_points,
        "image2_similarity": image2_similarity_str,
        "accuracy": image2_sim_value,
        "new_total_score": image2_points,
        "message": f"Image 2 evaluated in standalone mode! Accuracy: {image2_similarity_str} ({image2_points}/50 PTS)."
    }
