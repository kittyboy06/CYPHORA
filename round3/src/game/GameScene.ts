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
  private startX = 0;
  
  // Level 2: Beast state
  private turnCount = 0;
  private beastHp = 0;
  private beastVisual?: Phaser.GameObjects.Container;
  private beastShieldVisual?: Phaser.GameObjects.Arc;
  
  // Level 4: Totem state
  private totemsActivated = 0;
  
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('bg_forest', '/assets/bg_new.png');
    this.load.image('char_idle', '/assets/story/character_standing_v3.png');
    this.load.image('char_run_1', '/assets/story/running_action_1_v2.png');
    this.load.image('char_run_2', '/assets/story/running_action_2_v2.png');
    this.load.image('char_jump_1', '/assets/story/jumping_getting_ready_v2.png');
    this.load.image('char_jump_2', '/assets/story/jumping_getting_ready_2_v2.png');
    this.load.image('char_fall_1', '/assets/story/landing_on_air_v2.png');
    this.load.image('char_fall_2', '/assets/story/landing_impact_v2.png');
    this.load.image('char_fall_3', '/assets/story/recovery_from_landing_impact_v2.png');
    
    // New unified bridge chunks
    this.load.image('bridge_2', '/assets/2_block_bridge_v2.png');
    this.load.image('bridge_3', '/assets/3_block_bridge_v2.png');
    this.load.image('bridge_4', '/assets/4_block_bridge_v2.png');
    this.load.image('bridge_5', '/assets/5_block_bridge_v2.png');
    this.load.image('bridge_6', '/assets/6_block_bridge_v2.png');

    this.load.image('tile_ground', '/assets/2_block_bridge_v2.png'); // Fallback/single
    this.load.image('tile_spikes', '/assets/2_block_bridge_v2.png'); // Fallback
    this.load.image('beast', '/assets/beast_v2.png');
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
    
    // Create animations from individual frames
    if (!this.anims.exists('run')) {
      this.anims.create({
        key: 'run',
        frames: [
          { key: 'char_run_1' },
          { key: 'char_run_2' }
        ],
        frameRate: 6,
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
    this.groundY = h * 0.70;
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
    this.turnCount = 0;
    this.totemsActivated = 0;
    this.beastHp = this.levelData.beast?.hp || 0;
    this.pIndex = this.levelData.playerStartX;
    this.player.setAlpha(1);
    this.player.stop();
    this.player.setTexture('char_idle');
    this.updatePlayerVisuals(false);
    this.updateBeastVisuals();
    if (this.beastVisual) {
       this.beastVisual.setAlpha(1);
    }
  }

  drawBackground() {
    const w = this.startX + this.levelData.length * TILE_W + 300;
    const h = this.scale.height;

    // Use tileSprite to prevent stretching. We set it to cover the full scroll width.
    const bg = this.add.tileSprite(0, 0, w, h, 'bg_forest').setOrigin(0, 0);
    
    // Scale the texture up so it covers the height of the screen properly
    const scale = h / 724; 
    bg.setTileScale(scale, scale);
  }

  createPlatforms() {
    // Generate a particle texture for the fire
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('fire_particle', 16, 16);
    graphics.destroy();

    let i = 0;
    while (i < this.levelData.length) {
      const tile = this.levelData.tiles[i];
      const x = this.startX + i * TILE_W;
      const y = this.groundY;

      // Check for contiguous ground blocks to use the unified bridge assets
      if (tile === TileType.GROUND) {
        let runLength = 0;
        while (i + runLength < this.levelData.length && this.levelData.tiles[i + runLength] === TileType.GROUND) {
          runLength++;
        }
        
        let tilesRemaining = runLength;
        let currentX = x;
        while (tilesRemaining > 0) {
          let chunk = Math.min(tilesRemaining, 6);
          // Prevent leaving exactly 1 tile if we have options
          if (tilesRemaining > 6 && (tilesRemaining - chunk) === 1) {
             chunk -= 1; // leaves 2 instead of 1
          }
          
          if (chunk === 1) {
             // We only have a 1-block gap to fill, but we only have bridge_2 minimum.
             const img = this.add.image(currentX + TILE_W / 2, y, 'bridge_2').setOrigin(0.5, 0);
             img.displayWidth = TILE_W;
             img.scaleY = img.scaleX;
             tilesRemaining -= 1;
             currentX += TILE_W;
          } else {
             const blockCenterX = currentX + (chunk * TILE_W) / 2;
             const img = this.add.image(blockCenterX, y, `bridge_${chunk}`).setOrigin(0.5, 0);
             img.displayWidth = chunk * TILE_W;
             img.scaleY = img.scaleX;
             tilesRemaining -= chunk;
             currentX += chunk * TILE_W;
          }
        }
        i += runLength - 1; // -1 because i++ is at the end of the main loop
      } else if (tile === TileType.GOAL) {
        const block = this.add.image(x + TILE_W / 2, y, 'tile_ground').setOrigin(0.5, 0).setTint(0xdfb125);
        block.displayWidth = TILE_W; block.scaleY = block.scaleX;
        const glow = this.add.circle(x + TILE_W / 2, y + TILE_H / 2, TILE_W * 0.6, 0xdfb125);
        glow.setAlpha(0.15);
      } else if (tile === TileType.TRAP) {
        // Render nothing for TRAP since we don't have spikes anymore. It's a bottomless pit!
        // Maybe some dark fog or just leave it empty.
      } else if (tile === TileType.COLOR_RED) {
        const block = this.add.image(x + TILE_W / 2, y, 'tile_ground').setOrigin(0.5, 0).setTint(0xff4444);
        block.displayWidth = TILE_W; block.scaleY = block.scaleX;
        // Blood/Fire visual
        this.add.circle(x + TILE_W / 2, y + TILE_H / 2, 10, 0xff0000).setAlpha(0.5);
      } else if (tile === TileType.COLOR_BLUE) {
        const block = this.add.image(x + TILE_W / 2, y, 'tile_ground').setOrigin(0.5, 0).setTint(0x4444ff);
        block.displayWidth = TILE_W; block.scaleY = block.scaleX;
        // Sky/Water visual
        this.add.circle(x + TILE_W / 2, y + TILE_H / 2, 10, 0x0000ff).setAlpha(0.5);
      } else if (tile === TileType.COLOR_GOLD) {
        const block = this.add.image(x + TILE_W / 2, y, 'tile_ground').setOrigin(0.5, 0).setTint(0xffcc00);
        block.displayWidth = TILE_W; block.scaleY = block.scaleX;
        // Sun visual
        this.add.circle(x + TILE_W / 2, y + TILE_H / 2, 10, 0xffaa00).setAlpha(0.5);
      } else if (tile === TileType.FIRE || tile === TileType.TOTEM_FIRE) {
        const block = this.add.image(x + TILE_W / 2, y, 'tile_ground').setOrigin(0.5, 0).setTint(0x333333); // Burnt ground
        block.displayWidth = TILE_W; block.scaleY = block.scaleX;
        
        // Realistic Fire Emitter
        this.add.particles(x + TILE_W / 2, y, 'fire_particle', {
            color: [ 0xffff00, 0xff4500, 0x220000 ],
            colorEase: 'quad.out',
            lifespan: 600,
            angle: { min: 250, max: 290 },
            speed: { min: 80, max: 140 },
            scale: { start: 2.5, end: 0 },
            blendMode: 'ADD',
            frequency: 40
        });

        if (tile === TileType.TOTEM_FIRE) {
          const diamond = this.add.polygon(x + TILE_W / 2, y - 40, [0, -12, 12, 0, 0, 12, -12, 0], 0xffd700);
          diamond.setStrokeStyle(2, 0xffaa00);
          this.add.circle(x + TILE_W / 2, y - 40, 18, 0xffd700).setAlpha(0.15);
        }
      } else if (tile === TileType.GOBLIN || tile === TileType.TOTEM_GOBLIN) {
        const block = this.add.image(x + TILE_W / 2, y, 'tile_ground').setOrigin(0.5, 0);
        block.displayWidth = TILE_W; block.scaleY = block.scaleX;
        // Goblin body
        this.add.rectangle(x + TILE_W / 2, y - 10, 20, 20, 0x228b22);
        this.add.circle(x + TILE_W / 2 - 4, y - 14, 2, 0xff0000);
        this.add.circle(x + TILE_W / 2 + 4, y - 14, 2, 0xff0000);
        if (tile === TileType.TOTEM_GOBLIN) {
          const diamond = this.add.polygon(x + TILE_W / 2, y - 40, [0, -12, 12, 0, 0, 12, -12, 0], 0xffd700);
          diamond.setStrokeStyle(2, 0xffaa00);
          this.add.circle(x + TILE_W / 2, y - 40, 18, 0xffd700).setAlpha(0.15);
        }
      } else if (tile === TileType.TOTEM_FINAL) {
        const block = this.add.image(x + TILE_W / 2, y, 'tile_ground').setOrigin(0.5, 0).setTint(0xaaaaaa);
        block.displayWidth = TILE_W; block.scaleY = block.scaleX;
        const diamond = this.add.polygon(x + TILE_W / 2, y - 25, [0, -20, 20, 0, 0, 20, -20, 0], 0xffd700);
        diamond.setStrokeStyle(2, 0xffaa00);
        this.add.circle(x + TILE_W / 2, y - 25, 30, 0xffd700).setAlpha(0.1);
      }
      i++;
    }
  }

  spawnPlayer() {
    this.pIndex = this.levelData.playerStartX;
    this.player = this.add.sprite(0, 0, 'char_idle').setOrigin(0.5, 1);
    this.player.setScale(1.0); // Use fixed scale so different animations keep physical proportions
    this.updatePlayerVisuals(false);
  }

  updatePlayerVisuals(animate = true, jump = false): Promise<void> {
    const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;
    const targetY = this.groundY + 5; // offset slightly so feet rest on the visual stone

    
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
this.player.setTexture('char_idle');
              resolve();
            }
          });
        } else {
          this.player.play('run');
          this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
              this.player.stop();
              this.player.stop();
this.player.setTexture('char_idle');
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
this.player.setTexture('char_idle');
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
        await this.jumpInPlace();
        return 'OK';
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
    if (cmd.type === 'ATTACK') {
      if (this.levelData.beast && this.pIndex !== this.levelData.beast.positionIndex - 2) {
        // Attacked from the wrong distance!
        await this.playerFallDeath();
        return 'FAILED';
      }
      return this.handleAttack();
    } else if (cmd.type === 'DEFEND') {
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
      // Run dies if hitting FIRE or BEAST (which is at positionIndex)
      if (nextTile === TileType.FIRE || (this.levelData.beast && nextIndex >= this.levelData.beast.positionIndex)) {
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
      if (nextTile === TileType.FIRE || (this.levelData.beast && nextIndex >= this.levelData.beast.positionIndex)) {
        const landIndex = this.pIndex + 2;
        if (landIndex >= this.levelData.length) {
          await this.jumpInPlace();
          return 'OK';
        }
        this.pIndex = landIndex;
        await this.updatePlayerVisuals(true, true);

        // Jump survives on FIRE, but if you land on BEAST you die.
        const landTile = this.levelData.tiles[landIndex];
        if (this.levelData.beast && landIndex >= this.levelData.beast.positionIndex) {
          await this.playerFallDeath();
          return 'FAILED';
        }
        if (landTile === TileType.GOAL) return 'LEVEL_COMPLETE';
        return 'OK';
      } else {
        await this.jumpInPlace();
        return 'OK';
      }
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
this.player.setTexture('char_idle');
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
    if (tile === TileType.COLOR_GOLD) return 'gold';
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
this.player.setTexture('char_idle');
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
        this.player.play('fall');
        
        await new Promise<void>((resolve) => {
          this.tweens.add({
            targets: this.player,
            x: targetX,
            scaleY: 0.6,
            y: this.player.y + 25,
            yoyo: true,
            duration: 200,
            onComplete: () => {
              this.player.stop();
this.player.setTexture('char_idle');
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
