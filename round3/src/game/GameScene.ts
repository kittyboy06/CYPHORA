import Phaser from 'phaser';
import { level1 } from '../levels/level1';
import { Command, TileType, LevelDefinition } from '../types/game';

const TILE_W = 140;
const TILE_H = 117;

export default class GameScene extends Phaser.Scene {
  private levelData: LevelDefinition = level1;
  private player!: Phaser.GameObjects.Sprite;
  private pIndex = 0;
  private groundY = 0;
  private tileHeights: number[] = [];
  private startX = 0;
  
  // Level 2: Beast state
  private turnCount = 0;
  private beastHp = 0;
  private beastVisual?: Phaser.GameObjects.Container;
  private beastShieldVisual?: Phaser.GameObjects.Arc;
  
  // Level 4: Totem state
  private totemsActivated = 0;
  
  // Level 2: Item state
  private hasSword = false;
  private hasShield = false;
  private itemSprites: Map<number, Phaser.GameObjects.Sprite> = new Map();

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('bg_forest', '/assets/bg_new.png');
    this.load.image('bg_level3', '/assets/bg_level3.png');
    this.load.image('bg_level4', '/assets/bg_level4_stitched.png');
    this.load.image('char_idle', '/assets/story/character_standing_v3.png');
    this.load.image('char_run_1', '/assets/story/hero_run_1.png');
    this.load.image('char_run_2', '/assets/story/hero_run_2.png');
    this.load.image('char_run_3', '/assets/story/hero_run_3.png');
    this.load.image('char_run_4', '/assets/story/hero_run_4.png');
    this.load.image('char_run_5', '/assets/story/hero_run_5.png');
    this.load.image('char_run_7', '/assets/story/hero_run_7.png');
    this.load.image('char_run_8', '/assets/story/hero_run_8.png');
    
    // Sword & Shield Item Assets
    this.load.image('item_sword', '/assets/item_sword.png');
    this.load.image('item_shield', '/assets/item_shield.png');

    // Run with sword
    this.load.image('char_run_sword_1', '/assets/hero_run_sword_1.png');
    this.load.image('char_run_sword_2', '/assets/hero_run_sword_2.png');
    this.load.image('char_run_sword_3', '/assets/hero_run_sword_3.png');
    this.load.image('char_run_sword_4', '/assets/hero_run_sword_4.png');
    this.load.image('char_run_sword_7', '/assets/hero_run_sword_7.png');

    // Run with sword & shield
    this.load.image('char_run_sword_shield_1', '/assets/hero_run_sword_shield_1.png');
    this.load.image('char_run_sword_shield_2', '/assets/hero_run_sword_shield_2.png');
    this.load.image('char_run_sword_shield_3', '/assets/hero_run_sword_shield_3.png');
    this.load.image('char_run_sword_shield_4', '/assets/hero_run_sword_shield_4.png');

    this.load.image('char_jump_1', '/assets/hero_jump_1.png');
    this.load.image('char_jump_2', '/assets/hero_jump_2.png');
    this.load.image('char_fall_1', '/assets/hero_fall_1.png');
    this.load.image('char_fall_2', '/assets/hero_fall_2.png');
    this.load.image('char_fall_3', '/assets/hero_fall_3.png');
    
    // Bridge chunks: 1 through 6 blocks
    this.load.image('bridge_1', '/assets/1_block_bridge_v2.png');
    this.load.image('bridge_2', '/assets/2_block_bridge_v2.png');
    this.load.image('bridge_3', '/assets/3_block_bridge_v2.png');
    this.load.image('bridge_4', '/assets/4_block_bridge_v2.png');
    this.load.image('bridge_5', '/assets/5_block_bridge_v2.png');
    this.load.image('bridge_6', '/assets/6_block_bridge_v2.png');

    this.load.image('beast', '/assets/beast_v2.png');
    this.load.image('platform_ancient', '/assets/platform_ancient.png');
    this.load.image('platform_red', '/assets/platform_red.png');
    this.load.image('platform_blue_slide', '/assets/platform_blue_slide.png');
    this.load.image('platform_yellow', '/assets/platform_yellow.png');
    this.load.image('platform_slant', '/assets/platform_slant.png');
  }

  loadLevel(levelDef: LevelDefinition) {
    this.levelData = levelDef;
    this.scene.restart();
  }

  create() {
    this.turnCount = 0;
    this.totemsActivated = 0;
    this.beastHp = this.levelData.beast?.hp || 0;
    this.beastVisual = undefined;
    this.beastShieldVisual = undefined;
    this.hasSword = false;
    this.hasShield = false;
    this.itemSprites.clear();
    
    // Create animations from individual frames
    if (!this.anims.exists('run')) {
      this.anims.create({
        key: 'run',
        frames: [
          { key: 'char_run_1' },
          { key: 'char_run_2' },
          { key: 'char_run_3' },
          { key: 'char_run_4' },
          { key: 'char_run_5' },
          { key: 'char_run_7' },
          { key: 'char_run_8' }
        ],
        frameRate: 12,
        repeat: -1
      });
    }
    if (!this.anims.exists('run_sword')) {
      this.anims.create({
        key: 'run_sword',
        frames: [
          { key: 'char_run_sword_1' },
          { key: 'char_run_sword_2' },
          { key: 'char_run_sword_3' },
          { key: 'char_run_sword_4' },
          { key: 'char_run_sword_7' }
        ],
        frameRate: 12,
        repeat: -1
      });
    }
    if (!this.anims.exists('run_sword_shield')) {
      this.anims.create({
        key: 'run_sword_shield',
        frames: [
          { key: 'char_run_sword_shield_1' },
          { key: 'char_run_sword_shield_2' },
          { key: 'char_run_sword_shield_3' },
          { key: 'char_run_sword_shield_4' }
        ],
        frameRate: 12,
        repeat: -1
      });
    }
    if (!this.anims.exists('jump')) {
      this.anims.create({
        key: 'jump',
        frames: [
          { key: 'char_jump_1' },
          { key: 'char_jump_2' }
        ],
        frameRate: 6,
        repeat: 0
      });
    }
    if (!this.anims.exists('fall')) {
      this.anims.create({
        key: 'fall',
        frames: [
          { key: 'char_fall_1' },
          { key: 'char_fall_2' },
          { key: 'char_fall_3' }
        ],
        frameRate: 6,
        repeat: 0
      });
    }
    
    const h = this.scale.height;
    // Lower groundY to give more room for larger character/tiles
    this.groundY = h * 0.72;
    this.startX = 150;

    this.drawBackground();
    this.createPlatforms();
    this.spawnPlayer();
    this.spawnBeast();

    // Set camera bounds so it can scroll horizontally
    const worldWidth = this.startX + this.levelData.length * TILE_W + 300;
    this.cameras.main.setBounds(0, 0, worldWidth, h);
  }

  spawnBeast() {
    if (!this.levelData.beast) return;
    
    const bx = this.startX + this.levelData.beast.positionIndex * TILE_W + TILE_W / 2;
    const by = this.groundY;

    // Use the beast image (flipped if it naturally faces right, assuming we want it facing left towards the player)
    const body = this.add.image(0, -70, 'beast').setOrigin(0.5, 1);
    body.setDisplaySize(180, 150); // Scale appropriately
    body.setFlipX(true); // Assuming the original art faces right

    // Glowing shield
    this.beastShieldVisual = this.add.circle(0, -110, 100, 0x5555ff, 0.3);
    this.beastShieldVisual.setStrokeStyle(4, 0xaaaaff);
    
    this.beastVisual = this.add.container(bx, by + 20, [body, this.beastShieldVisual]); // offset Y slightly so feet touch ground
    
    this.updateBeastVisuals();
  }
  
  updateBeastVisuals() {
    if (!this.levelData.beast || !this.beastShieldVisual) return;
    const vulnerable = this.isBeastVulnerable();
    this.beastShieldVisual.setVisible(!vulnerable);
  }
  
  isBeastVulnerable(): boolean {
    if (!this.levelData.beast) return false;
    const pattern = this.levelData.beast.vulnerablePattern;
    return pattern[this.turnCount % pattern.length];
  }

  resetLevel() {
    this.scene.restart();
  }

  drawBackground() {
    const w = this.startX + this.levelData.length * TILE_W + 300;
    const h = this.scale.height;

    let bgKey = 'bg_forest';
    let originalHeight = 724;

    if (this.levelData.id === 'level_03') {
      bgKey = 'bg_level3';
      originalHeight = 341;
    } else if (this.levelData.id === 'level_04') {
      bgKey = 'bg_level4';
      originalHeight = 341;
    }

    // Use tileSprite to prevent stretching. We set it to cover the full scroll width.
    const bg = this.add.tileSprite(0, 0, w, h, bgKey).setOrigin(0, 0);
    
    // Scale the texture up so it covers the height of the screen properly
    const scale = h / originalHeight; 
    bg.setTileScale(scale, scale);

    // Dim the background so bridges and character stand out
    const dimOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000);
    dimOverlay.setAlpha(0.3);
  }

  createPlatforms() {
    this.tileHeights = new Array(this.levelData.length).fill(this.groundY);
    if (this.levelData.id === 'level_03' || this.levelData.id === 'level_04') {
      let currentY = this.groundY;
      for (let i = 0; i < this.levelData.length; i++) {
        const tile = this.levelData.tiles[i];
        this.tileHeights[i] = currentY;
        if (this.levelData.id === 'level_03' && tile === TileType.COLOR_BLUE) { // TileType.COLOR_BLUE
          currentY += 25; // drop height for next tiles
        }
      }
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('fire_particle', 16, 16);
    graphics.destroy();

    const isWalkable = (t: TileType) => t !== TileType.TRAP;

    let i = 0;
    while (i < this.levelData.length) {
      const tile = this.levelData.tiles[i];
      if (!isWalkable(tile)) { i++; continue; }

      if (this.levelData.id === 'level_03' || this.levelData.id === 'level_04') {
        const currentX = this.startX + i * TILE_W;
        const blockCenterX = currentX + TILE_W / 2;
        
        let texture = 'platform_yellow';
        if (this.levelData.id === 'level_03') {
          if (tile === TileType.COLOR_BLUE) texture = 'platform_blue_slide'; // COLOR_BLUE
          else if (tile === TileType.COLOR_RED) texture = 'platform_red'; // COLOR_RED
          else if (tile === TileType.COLOR_GOLD) texture = 'platform_yellow'; // COLOR_GOLD
          else if (tile === TileType.GOAL) texture = 'platform_yellow'; // GOAL
        } else if (this.levelData.id === 'level_04') {
          if (tile === TileType.FIRE || tile === TileType.GOBLIN || tile === TileType.TOTEM_FIRE || tile === TileType.TOTEM_GOBLIN) texture = 'platform_red';
          else texture = 'platform_yellow';
        }
        
        const img = this.add.image(blockCenterX, this.tileHeights[i], texture).setOrigin(0.5, 0);
        img.displayWidth = TILE_W;
        img.displayHeight = 110;
        
        i++;
 continue; }

      if (this.levelData.id === 'level_03' || this.levelData.id === 'level_04') {
        const currentX = this.startX + i * TILE_W;
        const blockCenterX = currentX + TILE_W / 2;
        
        let texture = 'platform_ancient';
        if (this.levelData.id === 'level_03' && tile === TileType.COLOR_BLUE) {
          texture = 'platform_slant';
        }
        
        const img = this.add.image(blockCenterX, this.groundY, texture).setOrigin(0.5, 0);
        img.displayWidth = TILE_W;
        img.displayHeight = 110;
        
        i++;
      } else {
        // Measure contiguous walkable run
        let runLength = 0;
        while (i + runLength < this.levelData.length && isWalkable(this.levelData.tiles[i + runLength])) {
          runLength++;
        }

        // Render bridge chunks using the greedy compositor (bridge_1 to bridge_6)
        let tilesRemaining = runLength;
        let currentX = this.startX + i * TILE_W;
        while (tilesRemaining > 0) {
          let chunk = Math.min(tilesRemaining, 6);
          const blockCenterX = currentX + (chunk * TILE_W) / 2;
          const img = this.add.image(blockCenterX, this.groundY, `bridge_${chunk}`).setOrigin(0.5, 0);
          img.displayWidth = chunk * TILE_W;
          img.displayHeight = 110;
          tilesRemaining -= chunk;
          currentX += chunk * TILE_W;
        }

        i += runLength;
      }
    }

    // ─── PASS 2: Add overlays, markers, and effects for special tiles ───
    for (let j = 0; j < this.levelData.length; j++) {
      const tile = this.levelData.tiles[j];
      const x = this.startX + j * TILE_W;
      const y = this.groundY;
      const cx = x + TILE_W / 2;

      if (tile === TileType.GOAL) {
        // Golden glow on the goal tile
        const glow = this.add.circle(cx, y + 10, TILE_W * 0.4, 0xdfb125);
        glow.setAlpha(0.25);
        // Flag / diamond marker
        const diamond = this.add.polygon(cx, y - 15, [0, -14, 14, 0, 0, 14, -14, 0], 0xffd700);
        diamond.setStrokeStyle(2, 0xffaa00);
      } else if (tile === TileType.COLOR_RED) {
        // Red glow strip on the bridge surface
        const strip = this.add.rectangle(cx, y + 8, TILE_W - 8, 12, 0xff2222);
        strip.setAlpha(0.55);
        // Small flame icon
        this.add.circle(cx, y - 8, 7, 0xff4400).setAlpha(0.7);
      } else if (tile === TileType.COLOR_BLUE) {
        // Blue glow strip
        const strip = this.add.rectangle(cx, y + 8, TILE_W - 8, 12, 0x2266ff);
        strip.setAlpha(0.55);
        // Water droplet icon
        this.add.circle(cx, y - 8, 7, 0x2288ff).setAlpha(0.7);
      } else if (tile === TileType.COLOR_GOLD) {
        // Gold glow strip
        const strip = this.add.rectangle(cx, y + 8, TILE_W - 8, 12, 0xffcc00);
        strip.setAlpha(0.55);
        // Sun icon
        this.add.circle(cx, y - 8, 7, 0xffaa00).setAlpha(0.7);
      } else if (tile === TileType.FIRE || tile === TileType.TOTEM_FIRE) {
        // Realistic fire emitter on the bridge
        this.add.particles(cx, y, 'fire_particle', {
          color: [0xffff00, 0xff4500, 0x220000],
          colorEase: 'quad.out',
          lifespan: 600,
          angle: { min: 250, max: 290 },
          speed: { min: 80, max: 140 },
          scale: { start: 2.5, end: 0 },
          blendMode: 'ADD',
          frequency: 40
        });

        if (tile === TileType.TOTEM_FIRE) {
          const diamond = this.add.polygon(cx, y - 40, [0, -12, 12, 0, 0, 12, -12, 0], 0xffd700);
          diamond.setStrokeStyle(2, 0xffaa00);
          this.add.circle(cx, y - 40, 18, 0xffd700).setAlpha(0.15);
        }
      } else if (tile === TileType.GOBLIN || tile === TileType.TOTEM_GOBLIN) {
        // Goblin body
        this.add.rectangle(cx, y - 10, 20, 20, 0x228b22);
        this.add.circle(cx - 4, y - 14, 2, 0xff0000);
        this.add.circle(cx + 4, y - 14, 2, 0xff0000);
        if (tile === TileType.TOTEM_GOBLIN) {
          const diamond = this.add.polygon(cx, y - 40, [0, -12, 12, 0, 0, 12, -12, 0], 0xffd700);
          diamond.setStrokeStyle(2, 0xffaa00);
          this.add.circle(cx, y - 40, 18, 0xffd700).setAlpha(0.15);
        }
      } else if (tile === TileType.TOTEM_FINAL) {
        const diamond = this.add.polygon(cx, y - 25, [0, -20, 20, 0, 0, 20, -20, 0], 0xffd700);
        diamond.setStrokeStyle(2, 0xffaa00);
        this.add.circle(cx, y - 25, 30, 0xffd700).setAlpha(0.1);
      } else if (tile === TileType.ITEM_SWORD) {
        const itemY = y - 40;
        const sword = this.add.sprite(cx, itemY, 'item_sword').setOrigin(0.5, 0.5);
        this.tweens.add({
          targets: sword, y: itemY - 10, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.itemSprites.set(j, sword);
      } else if (tile === TileType.ITEM_SHIELD) {
        const itemY = y - 40;
        const shield = this.add.sprite(cx, itemY, 'item_shield').setOrigin(0.5, 0.5);
        this.tweens.add({
          targets: shield, y: itemY - 10, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.itemSprites.set(j, shield);
      }
    }

    // ─── PASS 3: Render low-hanging branches above GROUND tiles (Level 1 only) ───
    // These visually signal that jumping on ground tiles is blocked
    if (this.levelData.id === 'level_01') {
      // Find the last trap — tiles after it are the final stretch (no branches)
      let lastTrapIdx = -1;
      for (let k = this.levelData.length - 1; k >= 0; k--) {
        if (this.levelData.tiles[k] === TileType.TRAP) { lastTrapIdx = k; break; }
      }

      for (let j = 0; j < this.levelData.length; j++) {
        const tile = this.levelData.tiles[j];
        if (tile !== TileType.GROUND) continue;
        if (j > lastTrapIdx) continue; // Skip the final stretch

        const x = this.startX + j * TILE_W;
        const y = this.groundY;
        const cx = x + TILE_W / 2;

        // Draw hanging vines/branches from above
        const branchY = y - 140; // Height where branches hang

        // Main branch (thick horizontal line)
        const branch = this.add.rectangle(cx, branchY, TILE_W - 10, 6, 0x3d2b1f);
        branch.setAlpha(0.85);

        // Hanging vines from the branch
        for (let v = -1; v <= 1; v++) {
          const vineX = cx + v * (TILE_W / 4);
          const vineLen = 20 + Math.random() * 25;
          const vine = this.add.rectangle(vineX, branchY + vineLen / 2 + 3, 3, vineLen, 0x2d5a1e);
          vine.setAlpha(0.7);
          // Leaf cluster at the end
          this.add.circle(vineX, branchY + vineLen + 5, 6, 0x3a7d28).setAlpha(0.6);
        }

        // Side leaves on the branch
        this.add.circle(cx - TILE_W / 3, branchY - 5, 8, 0x4a8b3a).setAlpha(0.5);
        this.add.circle(cx + TILE_W / 3, branchY - 5, 8, 0x4a8b3a).setAlpha(0.5);
      }
    }
  }

  private getIdleTexture(): string {
    if (this.hasSword && this.hasShield) return 'char_run_sword_shield_1';
    if (this.hasSword) return 'char_run_sword_1';
    return 'char_idle';
  }

  private getRunAnim(): string {
    if (this.hasSword && this.hasShield) return 'run_sword_shield';
    if (this.hasSword) return 'run_sword';
    return 'run';
  }

  spawnPlayer() {
    this.pIndex = this.levelData.playerStartX;
    this.player = this.add.sprite(0, 0, this.getIdleTexture()).setOrigin(0.5, 1);
    this.player.setScale(1.0); // Use fixed scale so different animations keep physical proportions
    this.updatePlayerVisuals(false);
  }

  updatePlayerVisuals(animate = true, jump = false): Promise<void> {
    const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;
    const targetY = (this.tileHeights && this.tileHeights.length > this.pIndex ? this.tileHeights[this.pIndex] : this.groundY) + 5;

    return new Promise<void>((resolve) => {
      if (animate) {
        if (jump) {
          this.player.play('jump');
          
          this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 1000,
            ease: 'Linear'
          });
          this.tweens.add({
            targets: this.player,
            y: targetY - 180, // Jump height relative to new smaller scale
            yoyo: true,
            duration: 500,
            ease: 'Sine.easeOut',
            onComplete: () => {
              this.player.y = targetY;
              this.player.stop();
              
              this.player.setTexture(this.getIdleTexture());
              resolve();
            }
          });
        } else {
          this.player.play(this.getRunAnim());
          this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
              this.player.stop();
              this.player.setTexture(this.getIdleTexture());
              resolve();
            }
          });
        }
        
        this.cameras.main.pan(
          Math.max(targetX, this.scale.width / 2),
          this.scale.height / 2,
          1000,
          'Linear'
        );
      } else {
        this.player.setPosition(targetX, targetY);
        this.player.stop();
        this.player.setTexture(this.getIdleTexture());
        this.cameras.main.centerOn(
          Math.max(targetX, this.scale.width / 2),
          this.scale.height / 2
        );
        resolve();
      }
    });
  }

  // ═══════════════════════════════════════════
  // COMMAND EXECUTION
  // ═══════════════════════════════════════════
  async executeCommand(cmd: Command): Promise<string> {
    // ──── Level 4: The Path of Trials ────
    if (this.levelData.id === 'level_04') {
      return this.executeLevel4Command(cmd);
    }

    // ──── Level 2: Beast Fight ────
    if (this.levelData.id === 'level_02') {
      return this.executeLevel2Command(cmd);
    }

    // ──── Level 3: Ancient Colour Cipher ────
    if (this.levelData.id === 'level_03') {
      return this.executeLevel3Command(cmd);
    }

    // ──── Level 1: The Broken Bridge ────
    if (cmd.type === 'RUN') {
      const nextIndex = this.pIndex + 1;
      if (nextIndex >= this.levelData.length) return 'OK';

      const nextTile = this.levelData.tiles[nextIndex];
      this.pIndex = nextIndex;
      await this.updatePlayerVisuals(true, false);

      if (nextTile === TileType.TRAP) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      if (nextTile === TileType.GOAL) return 'LEVEL_COMPLETE';
      return 'OK';

    } else if (cmd.type === 'JUMP') {
      const nextIndex = this.pIndex + 1;
      if (nextIndex >= this.levelData.length) {
        await this.jumpInPlace();
        return 'OK';
      }

      const nextTile = this.levelData.tiles[nextIndex];

      if (nextTile === TileType.TRAP) {
        const landIndex = this.pIndex + 2;
        if (landIndex >= this.levelData.length) {
          await this.jumpInPlace();
          return 'OK';
        }
        this.pIndex = landIndex;
        await this.updatePlayerVisuals(true, true);

        const landTile = this.levelData.tiles[landIndex];
        if (landTile === TileType.GOAL) return 'LEVEL_COMPLETE';
        return 'OK';
      } else {
        // Next tile is GROUND — check if we're in the final stretch (past last trap)
        let lastTrapIdx = -1;
        for (let k = this.levelData.length - 1; k >= 0; k--) {
          if (this.levelData.tiles[k] === TileType.TRAP) { lastTrapIdx = k; break; }
        }

        if (nextIndex > lastTrapIdx) {
          // Final stretch — no branches, jump is safe
          await this.jumpInPlace();
          return 'OK';
        }

        // Low-hanging branches block the jump!
        this.pIndex = nextIndex;
        await this.updatePlayerVisuals(true, true);
        // Show branch hit effect
        const hitX = this.player.x;
        const hitY = this.player.y - 100;
        const hitText = this.add.text(hitX, hitY, '💥 BRANCH!', {
          fontSize: '18px', color: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({
          targets: hitText, y: hitY - 40, alpha: 0, duration: 800,
          onComplete: () => hitText.destroy()
        });
        await this.playerFallDeath();
        return 'FAILED';
      }
    }

    return 'OK';
  }

  // ──── Level 4 Command Handler ────
  private async executeLevel4Command(cmd: Command): Promise<string> {
    // ACTIVATE_TOTEM: doesn't advance, checks current tile
    if (cmd.type === 'ACTIVATE_TOTEM') {
      const currentTile = this.levelData.tiles[this.pIndex];
      const isTotem = currentTile === TileType.TOTEM_FIRE ||
                      currentTile === TileType.TOTEM_GOBLIN ||
                      currentTile === TileType.TOTEM_FINAL;
      
      if (!isTotem) {
        // Not on a totem tile — fail
        await this.playerFallDeath();
        return 'FAILED';
      }
      
      // Play glow animation
      const glow = this.add.circle(this.player.x, this.player.y - 20, 40, 0xffd700, 0.6);
      this.tweens.add({
        targets: glow, alpha: 0, scale: 2, duration: 600,
        onComplete: () => glow.destroy()
      });
      await new Promise(r => setTimeout(r, 700));
      
      this.totemsActivated++;
      if (this.totemsActivated >= 3) return 'LEVEL_COMPLETE';
      return 'OK';
    }

    // DEFEND: doesn't advance, just shows shield
    if (cmd.type === 'DEFEND') {
      const shield = this.add.circle(this.player.x, this.player.y - 20, 35, 0x55aaff, 0.5);
      shield.setStrokeStyle(2, 0xaaddff);
      await new Promise(r => setTimeout(r, 300));
      shield.destroy();
      return 'OK';
    }

    // RUN, JUMP, ATTACK: all advance exactly 1 tile forward
    const nextIndex = this.pIndex + 1;
    if (nextIndex >= this.levelData.length) return 'OK';
    
    const nextTile = this.levelData.tiles[nextIndex];
    this.pIndex = nextIndex;

    if (cmd.type === 'RUN') {
      await this.updatePlayerVisuals(true, false);
      // Run survives on: GROUND, TOTEM_FINAL
      // Run dies on: FIRE, GOBLIN, TOTEM_FIRE, TOTEM_GOBLIN
      if (nextTile === TileType.FIRE || nextTile === TileType.GOBLIN ||
          nextTile === TileType.TOTEM_FIRE || nextTile === TileType.TOTEM_GOBLIN) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      return 'OK';

    } else if (cmd.type === 'JUMP') {
      await this.updatePlayerVisuals(true, true);
      // Jump survives on: FIRE, TOTEM_FIRE, GROUND, TOTEM_FINAL
      // Jump dies on: GOBLIN, TOTEM_GOBLIN (can't jump past a goblin)
      if (nextTile === TileType.GOBLIN || nextTile === TileType.TOTEM_GOBLIN) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      return 'OK';

    } else if (cmd.type === 'ATTACK') {
      // Dash attack animation
      await this.updatePlayerVisuals(true, false);
      await new Promise<void>((resolve) => {
        this.tweens.add({
          targets: this.player, x: this.player.x + 30,
          duration: 100, yoyo: true, ease: 'Power2',
          onComplete: () => resolve()
        });
      });
      // Attack survives on: GOBLIN, TOTEM_GOBLIN, GROUND, TOTEM_FINAL
      // Attack dies on: FIRE, TOTEM_FIRE (fire burns you)
      if (nextTile === TileType.FIRE || nextTile === TileType.TOTEM_FIRE) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      return 'OK';
    }

    return 'OK';
  }

  // ──── Level 2: Beast Fight ────
  private async executeLevel2Command(cmd: Command): Promise<string> {
    if (cmd.type === 'EQUIP') {
      const currentTile = this.levelData.tiles[this.pIndex];
      let didEquip = false;
      if (currentTile === TileType.ITEM_SWORD && !this.hasSword) {
        this.hasSword = true;
        didEquip = true;
      } else if (currentTile === TileType.ITEM_SHIELD && !this.hasShield) {
        this.hasShield = true;
        didEquip = true;
      }

      if (didEquip) {
        // Hide the item sprite
        const sprite = this.itemSprites.get(this.pIndex);
        if (sprite) {
          this.tweens.add({ targets: sprite, alpha: 0, y: sprite.y - 20, duration: 300, onComplete: () => sprite.destroy() });
          this.itemSprites.delete(this.pIndex);
        }
        // Update character visual
        this.player.setTexture(this.getIdleTexture());
        // Quick bob animation
        await new Promise<void>((resolve) => {
          this.tweens.add({ targets: this.player, y: this.player.y - 20, yoyo: true, duration: 150, onComplete: () => resolve() });
        });
      }
      return 'OK';
    }

    if (cmd.type === 'ATTACK') {
      if (!this.hasSword) {
        await this.playerFallDeath();
        return 'FAILED'; // Cannot attack without sword
      }
      if (this.levelData.beast && this.pIndex !== this.levelData.beast.positionIndex - 2) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      return this.handleAttack();
    } else if (cmd.type === 'DEFEND') {
      if (!this.hasShield) {
        await this.playerFallDeath();
        return 'FAILED'; // Cannot defend without shield
      }
      if (this.levelData.beast && this.pIndex !== this.levelData.beast.positionIndex - 2) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      return this.handleDefend();
    }

    if (cmd.type === 'RUN') {
      const nextIndex = this.pIndex + 1;
      if (nextIndex >= this.levelData.length) return 'OK';

      this.pIndex = nextIndex;
      await this.updatePlayerVisuals(true, false);

      const nextTile = this.levelData.tiles[nextIndex];
      if (this.levelData.beast && nextIndex >= this.levelData.beast.positionIndex) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      if (nextTile === TileType.GOAL) return 'LEVEL_COMPLETE';
      return 'OK';

    } else if (cmd.type === 'JUMP') {
      const nextIndex = this.pIndex + 1;
      if (nextIndex >= this.levelData.length) {
        await this.jumpInPlace();
        return 'OK';
      }

      const nextTile = this.levelData.tiles[nextIndex];
      // Since Level 2 is continuous, jump just advances by 2 safely unless it hits beast
      const landIndex = this.pIndex + 2;
      if (landIndex >= this.levelData.length) {
        await this.jumpInPlace();
        return 'OK';
      }
      this.pIndex = landIndex;
      await this.updatePlayerVisuals(true, true);

      const landTile = this.levelData.tiles[landIndex];
      if (this.levelData.beast && landIndex >= this.levelData.beast.positionIndex) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      if (landTile === TileType.GOAL) return 'LEVEL_COMPLETE';
      return 'OK';
    }
    return 'OK';
  }

  private async handleAttack(): Promise<string> {
    const startX = this.player.x;
    const attackX = startX + 40;
    
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.player,
        x: attackX,
        duration: 300,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });

    if (this.levelData.beast) {
      if (this.isBeastVulnerable()) {
        this.beastHp--;
        // Flash beast white
        if (this.beastVisual) {
          const body = this.beastVisual.list[0] as Phaser.GameObjects.Image;
          body.setTintFill(0xffffff);
          setTimeout(() => { body.clearTint(); }, 150);
        }
        
        if (this.beastHp <= 0) {
          if (this.beastVisual) {
            this.tweens.add({
              targets: this.beastVisual,
              alpha: 0, y: this.beastVisual.y + 50,
              duration: 500
            });
          }
          await new Promise(r => setTimeout(r, 600));
          return 'LEVEL_COMPLETE';
        }
      } else {
        // Shielded → beast counter-attacks
        if (this.beastVisual) {
          const bx = this.beastVisual.x;
          await new Promise<void>((resolve) => {
            this.tweens.add({
              targets: this.beastVisual,
              x: bx - 40,
              duration: 300,
              yoyo: true,
              onComplete: () => resolve()
            });
          });
        }
        
        await this.playerFallDeath();
        return 'FAILED';
      }
    }
    
    this.turnCount++;
    this.updateBeastVisuals();
    return 'OK';
  }

  private async handleDefend(): Promise<string> {
    const shield = this.add.circle(this.player.x, this.player.y - 70, 70, 0x55aaff, 0.5);
    shield.setStrokeStyle(4, 0xaaddff);
    
    await new Promise(r => setTimeout(r, 300));
    shield.destroy();
    
    this.turnCount++;
    this.updateBeastVisuals();
    return 'OK';
  }

  // ──── Shared Animations ────
  private async playerFallDeath(): Promise<void> {
    this.player.play('fall');
    this.tweens.add({
      targets: this.player,
      y: this.player.y + 400,
      alpha: 0,
      duration: 600,
      ease: 'Power2'
    });
    await new Promise(r => setTimeout(r, 500));
  }

  private jumpInPlace(): Promise<void> {
    this.player.play('jump');
    
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.player,
        y: this.player.y - 180, // Jump height relative to new smaller scale
        yoyo: true,
        duration: 500,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.player.stop();
          
          this.player.setTexture(this.getIdleTexture());
          resolve();
        }
      });
    });
  }

  // ──── Level 3: Ancient Colour Cipher ────
  public getTileColor(): string {
    const tile = this.levelData.tiles[this.pIndex];
    if (tile === TileType.COLOR_RED) return 'red';
    if (tile === TileType.COLOR_BLUE) return 'blue';
    if (tile === TileType.COLOR_GOLD) return 'yellow';
    return 'none';
  }

  private async executeLevel3Command(cmd: Command): Promise<string> {
    const nextIndex = this.pIndex + 1;
    if (this.pIndex >= this.levelData.length) return 'OK';

    const currentTile = this.levelData.tiles[this.pIndex];

    if (cmd.type === 'DODGE') {
      if (currentTile === TileType.COLOR_RED) {
        // Correct! Dodge animation
        this.pIndex = nextIndex;
        const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;
        const targetY = (this.tileHeights && this.tileHeights.length > this.pIndex ? this.tileHeights[this.pIndex] : this.groundY) + 5;
        this.player.play('jump');
        
        
        await new Promise<void>((resolve) => {
          this.tweens.add({
            targets: this.player,
            x: targetX,
            y: this.player.y - 80,
            yoyo: true,
            duration: 200,
            ease: 'Sine.easeOut',
            onComplete: () => {
              this.player.stop();
              
              this.player.setTexture(this.getIdleTexture());
              resolve();
            }
          });
        });
        await this.updatePlayerVisuals(false);
      } else {
        await this.playerFallDeath();
        return 'FAILED';
      }
    } else if (cmd.type === 'SLIDE') {
      if (currentTile === TileType.COLOR_BLUE) {
        // Correct! Slide animation
        this.pIndex = nextIndex;
        const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;
        const targetY = (this.tileHeights && this.tileHeights.length > this.pIndex ? this.tileHeights[this.pIndex] : this.groundY) + 5;
        this.player.play('fall');
        
        await new Promise<void>((resolve) => {
          this.tweens.add({
            targets: this.player,
            x: targetX,
            scaleY: 0.6,
            y: targetY,
            yoyo: true,
            duration: 200,
            onComplete: () => {
              this.player.stop();
              
              this.player.setTexture(this.getIdleTexture());
              resolve();
            }
          });
        });
        await this.updatePlayerVisuals(false);
      } else {
        await this.playerFallDeath();
        return 'FAILED';
      }
    } else if (cmd.type === 'ACTIVATE_TILE') {
      if (currentTile === TileType.COLOR_GOLD) {
        // Correct! Activate animation
        const glow = this.add.circle(this.player.x, this.player.y - 70, 70, 0xffd700, 0.6);
        this.tweens.add({
          targets: glow, alpha: 0, scale: 2, duration: 400,
          onComplete: () => glow.destroy()
        });
        await new Promise(r => setTimeout(r, 400));
        
        this.pIndex = nextIndex;
        await this.updatePlayerVisuals(true, false);
      } else {
        await this.playerFallDeath();
        return 'FAILED';
      }
    } else {
      // Any other command is an invalid move in this strict cipher sequence!
      await this.playerFallDeath();
      return 'FAILED';
    }

    if (this.pIndex < this.levelData.length && this.levelData.tiles[this.pIndex] === TileType.GOAL) {
      return 'LEVEL_COMPLETE';
    }
    
    return 'OK';
  }
}



