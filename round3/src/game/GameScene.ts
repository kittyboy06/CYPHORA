import Phaser from 'phaser';
import { level1 } from '../levels/level1';
import { Command, TileType, LevelDefinition } from '../types/game';

const TILE_W = 64;
const TILE_H = 48;

export default class GameScene extends Phaser.Scene {
  private levelData: LevelDefinition = level1;
  private player!: Phaser.GameObjects.Container;
  private pIndex = 0;
  private groundY = 0;
  private startX = 0;
  private allObjects: Phaser.GameObjects.GameObject[] = [];
  
  private turnCount = 0;
  private totemsActivated = 0;
  private beastHp = 0;
  private beastVisual?: Phaser.GameObjects.Container;
  private beastShieldVisual?: Phaser.GameObjects.Arc;
  
  constructor() {
    super('GameScene');
  }

  loadLevel(levelDef: LevelDefinition) {
    this.levelData = levelDef;
    this.scene.restart();
  }

  create() {
    this.turnCount = 0;
    this.totemsActivated = 0;
    this.totemsActivated = 0;
    this.beastHp = this.levelData.beast?.hp || 0;
    const h = this.scale.height;
    this.groundY = h * 0.72;
    this.startX = 80;

    this.drawBackground();
    this.createPlatforms();
    this.spawnPlayer();
    this.spawnBeast();

    // Set camera bounds so it can scroll horizontally
    const worldWidth = this.startX + this.levelData.length * TILE_W + 200;
    this.cameras.main.setBounds(0, 0, worldWidth, h);
  }

  spawnBeast() {
    if (!this.levelData.beast) return;
    
    const bx = this.startX + this.levelData.beast.positionIndex * TILE_W + TILE_W / 2;
    const by = this.groundY;

    // A large red rectangle
    const body = this.add.rectangle(0, -40, 40, 60, 0x991111).setOrigin(0.5, 1);
    body.setStrokeStyle(2, 0xff5555);

    // Glowing shield
    this.beastShieldVisual = this.add.circle(0, -40, 45, 0x5555ff, 0.3);
    this.beastShieldVisual.setStrokeStyle(3, 0xaaaaff);
    
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
    this.beastHp = this.levelData.beast?.hp || 0;
    this.pIndex = this.levelData.playerStartX;
    this.player.setAlpha(1);
    this.updatePlayerVisuals(false);
    this.updateBeastVisuals();
    if (this.beastVisual) {
       this.beastVisual.setAlpha(1);
    }
  }

  drawBackground() {
    const w = this.startX + this.levelData.length * TILE_W + 200;
    const h = this.scale.height;

    // Sky gradient — dark forest canopy
    const sky = this.add.rectangle(w / 2, 0, w, h, 0x050804).setOrigin(0.5, 0);

    // Distant tree silhouettes (subtle background layer)
    for (let i = 0; i < 20; i++) {
      const tx = 40 + i * 80 + Phaser.Math.Between(-20, 20);
      const th = Phaser.Math.Between(60, 120);
      this.add.rectangle(tx, this.groundY - TILE_H, 16, th, 0x0a1508)
        .setOrigin(0.5, 1).setAlpha(0.5);
      // Canopy circles
      this.add.circle(tx, this.groundY - TILE_H - th + 10, Phaser.Math.Between(15, 28), 0x0d1e0a)
        .setAlpha(0.4);
    }

    // Ground fill below the platform line
    this.add.rectangle(w / 2, this.groundY + TILE_H / 2, w, h - this.groundY + TILE_H, 0x0a0e08).setOrigin(0.5, 0);
  }

  createPlatforms() {
    for (let i = 0; i < this.levelData.length; i++) {
      const tile = this.levelData.tiles[i];
      const x = this.startX + i * TILE_W;
      const y = this.groundY;

      if (tile === TileType.GROUND) {
        // Stone platform tile
        const block = this.add.rectangle(x + TILE_W / 2, y, TILE_W - 3, TILE_H, 0x3a3a2e).setOrigin(0.5, 0);
        block.setStrokeStyle(1, 0x555544);
        // Add subtle moss on top
        this.add.rectangle(x + TILE_W / 2, y, TILE_W - 3, 3, 0x4a6a3a).setOrigin(0.5, 0);
      } else if (tile === TileType.GOAL) {
        // Golden goal tile
        const block = this.add.rectangle(x + TILE_W / 2, y, TILE_W - 3, TILE_H, 0xdfb125).setOrigin(0.5, 0);
        block.setStrokeStyle(2, 0xffd700);
        // Glow effect
        const glow = this.add.circle(x + TILE_W / 2, y + TILE_H / 2, TILE_W * 0.6, 0xdfb125);
        glow.setAlpha(0.15);
      } else if (tile === TileType.TRAP) {
        // Gap — draw danger spikes at the bottom
        const spikeY = y + TILE_H + 10;
        for (let s = 0; s < 3; s++) {
          this.add.triangle(
            x + 10 + s * 18, spikeY,
            0, 14, 8, 0, 16, 14,
            0x8b2020
          ).setOrigin(0, 0);
        }
        // Draw faint red line to indicate danger
        this.add.rectangle(x + TILE_W / 2, y + TILE_H + 2, TILE_W - 8, 2, 0x5a1010).setOrigin(0.5, 0).setAlpha(0.5);
      } else if (tile === TileType.FIRE || tile === TileType.TOTEM_FIRE) {
        const block = this.add.rectangle(x + TILE_W / 2, y, TILE_W - 3, TILE_H, 0x3a3a2e).setOrigin(0.5, 0);
        for (let s = 0; s < 3; s++) {
          this.add.triangle(x + 15 + s * 16, y, 0, 0, 8, -16, 16, 0, 0xff4500).setOrigin(0, 1);
        }
        if (tile === TileType.TOTEM_FIRE) {
          const diamond = this.add.polygon(x + TILE_W / 2, y - 30, [0, -10, 10, 0, 0, 10, -10, 0], 0xffd700);
          diamond.setStrokeStyle(1, 0xffaa00);
        }
      } else if (tile === TileType.GOBLIN || tile === TileType.TOTEM_GOBLIN) {
        const block = this.add.rectangle(x + TILE_W / 2, y, TILE_W - 3, TILE_H, 0x3a3a2e).setOrigin(0.5, 0);
        this.add.rectangle(x + TILE_W / 2, y - 10, 20, 20, 0x228b22);
        this.add.circle(x + TILE_W / 2 - 4, y - 14, 2, 0xff0000);
        this.add.circle(x + TILE_W / 2 + 4, y - 14, 2, 0xff0000);
        if (tile === TileType.TOTEM_GOBLIN) {
          const diamond = this.add.polygon(x + TILE_W / 2, y - 40, [0, -10, 10, 0, 0, 10, -10, 0], 0xffd700);
          diamond.setStrokeStyle(1, 0xffaa00);
        }
      } else if (tile === TileType.TOTEM_FINAL) {
        const block = this.add.rectangle(x + TILE_W / 2, y, TILE_W - 3, TILE_H, 0x555555).setOrigin(0.5, 0);
        const diamond = this.add.polygon(x + TILE_W / 2, y - 20, [0, -20, 20, 0, 0, 20, -20, 0], 0xffd700);
        diamond.setStrokeStyle(2, 0xffaa00);
      }
    }
  }

  spawnPlayer() {
    this.pIndex = this.levelData.playerStartX;
    
    // Body (rectangle)
    const body = this.add.rectangle(0, -24, 20, 28, 0xeae0c8).setOrigin(0.5, 1);
    body.setStrokeStyle(1, 0x999999);
    // Head
    const head = this.add.circle(0, -30, 8, 0xeae0c8);
    head.setStrokeStyle(1, 0x999999);
    // Eye
    const eye = this.add.circle(4, -32, 2, 0x222222);
    // Legs
    const legL = this.add.rectangle(-5, -4, 6, 12, 0x735a11).setOrigin(0.5, 1);
    const legR = this.add.rectangle(5, -4, 6, 12, 0x735a11).setOrigin(0.5, 1);
    
    this.player = this.add.container(0, 0, [legL, legR, body, head, eye]);
    this.updatePlayerVisuals(false);
  }

  updatePlayerVisuals(animate = true, jump = false): Promise<void> {
    const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;
    const targetY = this.groundY;
    
    return new Promise<void>((resolve) => {
      if (animate) {
        if (jump) {
          // Horizontal movement
          this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 500,
            ease: 'Linear'
          });
          // Vertical arc
          this.tweens.add({
            targets: this.player,
            y: targetY - 80,
            yoyo: true,
            duration: 250,
            ease: 'Sine.easeOut',
            onComplete: () => {
              this.player.y = targetY;
              resolve();
            }
          });
        } else {
          this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 350,
            ease: 'Power2',
            onComplete: () => resolve()
          });
        }
        
        // Smooth camera follow
        this.cameras.main.pan(
          Math.max(targetX, this.scale.width / 2),
          this.scale.height / 2,
          350,
          'Power2'
        );
      } else {
        this.player.setPosition(targetX, targetY);
        this.cameras.main.centerOn(
          Math.max(targetX, this.scale.width / 2),
          this.scale.height / 2
        );
        resolve();
      }
    });
  }

  async executeCommand(cmd: Command): Promise<string> {
    if (this.levelData.id === 'level_04') {
      if (cmd.type === 'ACTIVATE_TOTEM') {
        const currentTile = this.levelData.tiles[this.pIndex];
        if (currentTile === TileType.TOTEM_FIRE || currentTile === TileType.TOTEM_GOBLIN || currentTile === TileType.TOTEM_FINAL) {
          const glow = this.add.circle(this.player.x, this.player.y - 20, 40, 0xffd700, 0.5);
          this.tweens.add({ targets: glow, alpha: 0, scale: 1.5, duration: 500, onComplete: () => glow.destroy() });
          this.totemsActivated++;
          await new Promise(r => setTimeout(r, 600));
          if (this.totemsActivated === 3) return 'LEVEL_COMPLETE';
          return 'OK';
        }
        return 'FAILED';
      }

      const nextIndex = this.pIndex + 1;
      if (nextIndex >= this.levelData.length) return 'OK';
      const nextTile = this.levelData.tiles[nextIndex];
      
      this.pIndex = nextIndex;

      if (cmd.type === 'RUN') {
        await this.updatePlayerVisuals(true, false);
        if ([TileType.FIRE, TileType.GOBLIN, TileType.TOTEM_FIRE, TileType.TOTEM_GOBLIN].includes(nextTile)) {
          this.tweens.add({ targets: this.player, y: this.player.y + 150, alpha: 0, duration: 400 });
          await new Promise(r => setTimeout(r, 500));
          return 'FAILED';
        }
        return 'OK';
      } else if (cmd.type === 'JUMP') {
        await this.updatePlayerVisuals(true, true);
        if ([TileType.GOBLIN, TileType.TOTEM_GOBLIN].includes(nextTile)) {
          this.tweens.add({ targets: this.player, y: this.player.y + 150, alpha: 0, duration: 400 });
          await new Promise(r => setTimeout(r, 500));
          return 'FAILED';
        }
        return 'OK';
      } else if (cmd.type === 'ATTACK') {
        await this.updatePlayerVisuals(true, false);
        await new Promise<void>((resolve) => {
          this.tweens.add({
            targets: this.player, x: this.player.x + 40, duration: 150, yoyo: true, ease: 'Power2', onComplete: () => resolve()
          });
        });
        if ([TileType.FIRE, TileType.TOTEM_FIRE].includes(nextTile)) {
          this.tweens.add({ targets: this.player, y: this.player.y + 150, alpha: 0, duration: 400 });
          await new Promise(r => setTimeout(r, 500));
          return 'FAILED';
        }
        return 'OK';
      }
      return 'OK';
    }

    if (cmd.type === 'ATTACK') {
      return this.handleAttack();
    } else if (cmd.type === 'DEFEND') {
      return this.handleDefend();
    } else if (cmd.type === 'RUN') {
      // Run = advance 1 tile. Must land on ground/goal. Trap = death.
      const nextIndex = this.pIndex + 1;
      
      if (nextIndex >= this.levelData.length) {
        // Ran off the edge
        return 'OK';
      }

      const nextTile = this.levelData.tiles[nextIndex];
      this.pIndex = nextIndex;
      await this.updatePlayerVisuals(true, false);

      if (nextTile === TileType.TRAP) {
        // Fell into gap
        this.tweens.add({
          targets: this.player,
          y: this.player.y + 150,
          alpha: 0,
          duration: 400,
          ease: 'Power2'
        });
        await new Promise(r => setTimeout(r, 500));
        return 'FAILED';
      }

      if (nextTile === TileType.GOAL) {
        return 'LEVEL_COMPLETE';
      }

      return 'OK';

    } else if (cmd.type === 'JUMP') {
      // Jump = check if next tile is a gap.
      //   If gap ahead → leap over it, land on tile +2 (the ground after the gap)
      //   If ground ahead → jump in place (no movement)
      const nextIndex = this.pIndex + 1;

      if (nextIndex >= this.levelData.length) {
        // Nothing ahead, jump in place
        await this.jumpInPlace();
        return 'OK';
      }

      const nextTile = this.levelData.tiles[nextIndex];

      if (nextTile === TileType.TRAP) {
        // Gap ahead — leap over it
        const landIndex = this.pIndex + 2;
        if (landIndex >= this.levelData.length) {
          // Would land off the edge, just jump in place
          await this.jumpInPlace();
          return 'OK';
        }
        this.pIndex = landIndex;
        await this.updatePlayerVisuals(true, true);

        const landTile = this.levelData.tiles[landIndex];
        if (landTile === TileType.GOAL) {
          return 'LEVEL_COMPLETE';
        }
        return 'OK';
      } else {
        // Ground ahead — jump in place, no movement
        await this.jumpInPlace();
        return 'OK';
      }
    }

    return 'OK';
  }

  async handleAttack(): Promise<string> {
    // Player dashes forward and back
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
        // Flash beast
        if (this.beastVisual) {
          const body = this.beastVisual.list[0] as Phaser.GameObjects.Rectangle;
          body.fillColor = 0xffffff;
          setTimeout(() => {
             body.fillColor = 0x991111;
          }, 150);
        }
        
        if (this.beastHp <= 0) {
          // Beast dies
          if (this.beastVisual) {
            this.tweens.add({
              targets: this.beastVisual,
              alpha: 0,
              y: this.beastVisual.y + 50,
              duration: 500
            });
          }
          return 'LEVEL_COMPLETE'; // or maybe just open the path? Prompt says: "If beastHp <= 0, beast dies, return 'LEVEL_COMPLETE'".
        }
      } else {
        // Shielded -> beast attacks player
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
        
        // player dies
        this.tweens.add({
          targets: this.player,
          y: this.player.y + 150,
          alpha: 0,
          duration: 400
        });
        await new Promise(r => setTimeout(r, 500));
        return 'FAILED';
      }
    }
    
    this.turnCount++;
    this.updateBeastVisuals();
    return 'OK';
  }

  async handleDefend(): Promise<string> {
    // Show blue shield
    const shield = this.add.circle(this.player.x, this.player.y - 20, 35, 0x55aaff, 0.5);
    shield.setStrokeStyle(2, 0xaaddff);
    
    await new Promise(r => setTimeout(r, 300));
    shield.destroy();
    
    this.turnCount++;
    this.updateBeastVisuals();
    return 'OK';
  }

  private jumpInPlace(): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.player,
        y: this.player.y - 60,
        yoyo: true,
        duration: 200,
        ease: 'Sine.easeOut',
        onComplete: () => resolve()
      });
    });
  }
}
