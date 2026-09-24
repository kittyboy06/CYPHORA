import Phaser from 'phaser';
import { level1 } from '../levels/level1';
import { Command, TileType } from '../types/game';

const TILE_W = 64;
const TILE_H = 48;

export default class GameScene extends Phaser.Scene {
  private levelData = level1;
  private player!: Phaser.GameObjects.Container;
  private pIndex = 0;
  private groundY = 0;
  private startX = 0;
  private allObjects: Phaser.GameObjects.GameObject[] = [];
  
  constructor() {
    super('GameScene');
  }

  create() {
    const h = this.scale.height;
    this.groundY = h * 0.72;
    this.startX = 80;

    this.drawBackground();
    this.createPlatforms();
    this.spawnPlayer();

    // Set camera bounds so it can scroll horizontally
    const worldWidth = this.startX + this.levelData.length * TILE_W + 200;
    this.cameras.main.setBounds(0, 0, worldWidth, h);
  }

  resetLevel() {
    this.pIndex = this.levelData.playerStartX;
    this.player.setAlpha(1);
    this.updatePlayerVisuals(false);
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
    if (cmd.type === 'RUN') {
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
