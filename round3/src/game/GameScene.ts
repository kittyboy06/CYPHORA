import Phaser from 'phaser';
import { level1 } from '../levels/level1';
import { Command, TileType, LevelDefinition } from '../types/game';

const TILE_W = 100;
const TILE_H = 65;

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
    this.load.image('char_idle', '/assets/clean_char1_0.png');
    for (let i = 0; i < 8; i++) {
        this.load.image(`char_run_${i}`, `/assets/clean_char1_${12 + i}.png`);
    }
    this.load.image('char_jump', '/assets/clean_char2_0.png');
    this.load.image('char_fall', '/assets/clean_char2_4.png');
    this.load.image('tile_ground', '/assets/new_tile_ground.png');
    this.load.image('tile_spikes', '/assets/new_tile_spikes2.png');
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
    
    // Create animations
    if (!this.anims.exists('run')) {
      this.anims.create({
        key: 'run',
        frames: [0,1,2,3,4,5,6,7].map(i => ({ key: `char_run_${i}` })),
        frameRate: 12, // slightly faster looks better for 8 frames
        repeat: -1
      });
    }
    
    const h = this.scale.height;
    // Lower groundY to give more room for larger character/tiles
    this.groundY = h * 0.78;
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

    // A large red rectangle
    const body = this.add.rectangle(0, -60, 60, 90, 0x991111).setOrigin(0.5, 1);
    body.setStrokeStyle(3, 0xff5555);

    // Glowing shield
    this.beastShieldVisual = this.add.circle(0, -60, 65, 0x5555ff, 0.3);
    this.beastShieldVisual.setStrokeStyle(4, 0xaaaaff);
    
    this.beastVisual = this.add.container(bx, by, [body, this.beastShieldVisual]);
    
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

    // Use a regular image and scale it to cover the height, letting it stretch/scroll naturally
    // The original forest image is 1024x222.
    const bg = this.add.image(0, 0, 'bg_forest').setOrigin(0, 0);
    // Scale height to match canvas, scale width proportionally
    const scaleY = h / 222;
    bg.setScale(scaleY);
    bg.setTint(0x7a7a7a); // Dim the background to make foreground pop
    
    bg.setDisplaySize(w, h);
  }

  createPlatforms() {
    for (let i = 0; i < this.levelData.length; i++) {
      const tile = this.levelData.tiles[i];
      const x = this.startX + i * TILE_W;
      const y = this.groundY;

      if (tile === TileType.GROUND) {
        this.add.image(x + TILE_W / 2, y + 2, 'tile_ground')
            .setDisplaySize(TILE_W + 2, TILE_W * 0.8).setOrigin(0.5, 0);
      } else if (tile === TileType.GOAL) {
        const block = this.add.image(x + TILE_W / 2, y + 2, 'tile_ground')
            .setDisplaySize(TILE_W + 2, TILE_W * 0.8).setOrigin(0.5, 0).setTint(0xdfb125);
        const glow = this.add.circle(x + TILE_W / 2, y + TILE_H / 2, TILE_W * 0.6, 0xdfb125);
        glow.setAlpha(0.15);
      } else if (tile === TileType.TRAP) {
        this.add.image(x + TILE_W / 2, y + 2, 'tile_spikes')
            .setDisplaySize(TILE_W, TILE_W * 0.7).setOrigin(0.5, 0);
      } else if (tile === TileType.FIRE || tile === TileType.TOTEM_FIRE) {
        this.add.image(x + TILE_W / 2, y + 2, 'tile_ground')
            .setDisplaySize(TILE_W + 2, TILE_W * 0.8).setOrigin(0.5, 0).setTint(0xffaa55);
        for (let s = 0; s < 3; s++) {
          this.add.triangle(x + 15 + s * 16, y, 0, 0, 8, -16, 16, 0, 0xff4500).setOrigin(0, 1);
        }
        if (tile === TileType.TOTEM_FIRE) {
          const diamond = this.add.polygon(x + TILE_W / 2, y - 40, [0, -12, 12, 0, 0, 12, -12, 0], 0xffd700);
          diamond.setStrokeStyle(2, 0xffaa00);
          this.add.circle(x + TILE_W / 2, y - 40, 18, 0xffd700).setAlpha(0.15);
        }
      } else if (tile === TileType.GOBLIN || tile === TileType.TOTEM_GOBLIN) {
        this.add.image(x + TILE_W / 2, y + 2, 'tile_ground')
            .setDisplaySize(TILE_W + 2, TILE_W * 0.8).setOrigin(0.5, 0);
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
        this.add.image(x + TILE_W / 2, y + 2, 'tile_ground')
            .setDisplaySize(TILE_W + 2, TILE_W * 0.8).setOrigin(0.5, 0).setTint(0xaaaaaa);
        const diamond = this.add.polygon(x + TILE_W / 2, y - 25, [0, -20, 20, 0, 0, 20, -20, 0], 0xffd700);
        diamond.setStrokeStyle(2, 0xffaa00);
        this.add.circle(x + TILE_W / 2, y - 25, 30, 0xffd700).setAlpha(0.1);
      }
    }
  }

  spawnPlayer() {
    this.pIndex = this.levelData.playerStartX;
    this.player = this.add.sprite(0, 0, 'char_idle').setOrigin(0.5, 1);
    this.player.setDisplaySize(70, 115); // Scale the sprite appropriately (aspect ratio ~ 1:1.64)
    this.updatePlayerVisuals(false);
  }

  updatePlayerVisuals(animate = true, jump = false): Promise<void> {
    const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;
    const targetY = this.groundY + 10; // slightly down so feet touch ground tile

    
    return new Promise<void>((resolve) => {
      if (animate) {
        if (jump) {
          this.player.setTexture('char_jump');
          this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 500,
            ease: 'Linear'
          });
          this.tweens.add({
            targets: this.player,
            y: targetY - 140, // Increased jump height for larger character
            yoyo: true,
            duration: 250,
            ease: 'Sine.easeOut',
            onComplete: () => {
              this.player.y = targetY;
              this.player.setTexture('char_idle');
              resolve();
            }
          });
        } else {
          this.player.play('run');
          this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 350,
            ease: 'Linear',
            onComplete: () => {
              this.player.stop();
              this.player.setTexture('char_idle');
              resolve();
            }
          });
        }
        
        this.cameras.main.pan(
          Math.max(targetX, this.scale.width / 2),
          this.scale.height / 2,
          350,
          'Power2'
        );
      } else {
        this.player.setPosition(targetX, targetY);
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
    if (cmd.type === 'ATTACK') {
      return this.handleAttack();
    } else if (cmd.type === 'DEFEND') {
      return this.handleDefend();
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
  private async handleAttack(): Promise<string> {
    const startX = this.player.x;
    const attackX = startX + 40;
    
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.player,
        x: attackX,
        duration: 150,
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
          const body = this.beastVisual.list[0] as Phaser.GameObjects.Rectangle;
          body.fillColor = 0xffffff;
          setTimeout(() => { body.fillColor = 0x991111; }, 150);
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
              duration: 150,
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
    const shield = this.add.circle(this.player.x, this.player.y - 20, 35, 0x55aaff, 0.5);
    shield.setStrokeStyle(2, 0xaaddff);
    
    await new Promise(r => setTimeout(r, 300));
    shield.destroy();
    
    this.turnCount++;
    this.updateBeastVisuals();
    return 'OK';
  }

  // ──── Shared Animations ────
  private async playerFallDeath(): Promise<void> {
    this.player.setTexture('char_fall');
    this.tweens.add({
      targets: this.player,
      y: this.player.y + 150,
      alpha: 0,
      duration: 400,
      ease: 'Power2'
    });
    await new Promise(r => setTimeout(r, 500));
  }

  private jumpInPlace(): Promise<void> {
    this.player.setTexture('char_jump');
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.player,
        y: this.player.y - 120, // Increased for larger character scale
        yoyo: true,
        duration: 200,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.player.setTexture('char_idle');
          resolve();
        }
      });
    });
  }
}
