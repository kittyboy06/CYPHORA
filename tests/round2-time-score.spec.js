import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Round 2 Time-Based Score Evaluation & Persistence', () => {

  test('Backend calculates time_score, awards it to stage2 submission, and adds to team round2_score and total score', async ({ request }) => {
    const squad = `R2TimeSquad_${Date.now().toString().slice(-6)}`;

    // 1. Register team
    const regRes = await request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squad,
        pin: '7788',
        member1: 'TimeTester1',
        member2: 'TimeTester2'
      }
    });
    expect(regRes.ok()).toBeTruthy();
    const regData = await regRes.json();
    const teamId = regData.team?.id || regData.team_id;
    const token = regData.token;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-Team-Id': String(teamId),
      'X-Team-Name': squad,
      'Content-Type': 'application/json'
    };

    const img1Base64 = `data:image/jpeg;base64,${fs.readFileSync('public/assets/round2/targets/target1.jpg').toString('base64')}`;
    const img2Base64 = `data:image/jpeg;base64,${fs.readFileSync('public/assets/round2/targets/target2.jpg').toString('base64')}`;

    // 2. Evaluate Image 1 (50 PTS max)
    const img1Res = await request.post('http://localhost:8000/api/stage2/evaluate-image1', {
      headers,
      data: {
        team_name: squad,
        prompt: 'Mystical ancient ruin covered in golden vines',
        image1_filename: 'target1.jpg',
        image1_base64: img1Base64
      }
    });
    expect(img1Res.ok()).toBeTruthy();
    const img1Data = await img1Res.json();
    expect(img1Data.success).toBeTruthy();
    expect(img1Data.points).toBeGreaterThanOrEqual(5);
    const img1Score = img1Data.points;

    // 3. Submit Image 2 with fast completion (e.g. elapsed 180s, remaining 720s out of 900s)
    const submitRes = await request.post('http://localhost:8000/api/stage2/submit', {
      headers,
      data: {
        team_name: squad,
        prompt: 'Ancient obsidian temple gateway unsealed with golden runes',
        slot2_filename: 'target1.jpg',
        slot3_filename: 'target2.jpg',
        slot3_base64: img2Base64,
        elapsed_seconds: 180,
        remaining_seconds: 720,
        calculated_points: 0
      }
    });
    expect(submitRes.ok()).toBeTruthy();
    const submitData = await submitRes.json();

    // Verify time_score is present, evaluated, and greater than zero
    expect(submitData.success).toBeTruthy();
    expect(submitData.time_score).toBeDefined();
    expect(submitData.time_score).toBeGreaterThanOrEqual(5);
    expect(submitData.time_used_seconds).toBe(180);

    // Verify points_awarded includes both image2 accuracy points AND time_score
    expect(submitData.points_awarded).toBe(submitData.image2_points + submitData.time_score);

    // Verify total Round 2 score includes Image 1 + Image 2 + time_score
    const expectedRound2Score = img1Score + submitData.image2_points + submitData.time_score;
    expect(submitData.round2_score).toBe(expectedRound2Score);
    expect(submitData.new_total_score).toBe(expectedRound2Score);

    // 4. Verify Admin team standings API reflects the score
    const adminRes = await request.get('http://localhost:8000/api/admin/teams');
    if (adminRes.ok()) {
      const allTeams = await adminRes.json();
      const myTeam = allTeams.find(t => t.id === teamId || t.name.toLowerCase() === squad.toLowerCase());
      if (myTeam) {
        expect(myTeam.round2_score).toBe(expectedRound2Score);
        expect(myTeam.score).toBe(expectedRound2Score);
      }
    }
  });

  test('Submitting with 0 remaining seconds awards 0 time_score but still awards accuracy points', async ({ request }) => {
    const squad = `R2LateSquad_${Date.now().toString().slice(-6)}`;

    // Register team
    const regRes = await request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squad,
        pin: '9900',
        member1: 'LateTester1',
        member2: 'LateTester2'
      }
    });
    expect(regRes.ok()).toBeTruthy();
    const regData = await regRes.json();
    const teamId = regData.team?.id || regData.team_id;
    const token = regData.token;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-Team-Id': String(teamId),
      'X-Team-Name': squad,
      'Content-Type': 'application/json'
    };

    // Submit Image 2 with elapsed 900s, remaining 0s
    const submitRes = await request.post('http://localhost:8000/api/stage2/submit', {
      headers,
      data: {
        team_name: squad,
        prompt: 'Temple gateway at last moment',
        slot2_filename: 'img1.png',
        slot3_filename: 'img2.png',
        slot3_base64: null,
        elapsed_seconds: 900,
        remaining_seconds: 0,
        calculated_points: 0
      }
    });
    expect(submitRes.ok()).toBeTruthy();
    const submitData = await submitRes.json();

    expect(submitData.success).toBeTruthy();
    expect(submitData.time_score).toBe(0);
    expect(submitData.points_awarded).toBe(submitData.image2_points);
  });

});
