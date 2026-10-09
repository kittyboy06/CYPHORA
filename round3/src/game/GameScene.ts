import Phaser from 'phaser';
import { level1 } from '../levels/level1';
import { Command, TileType, LevelDefinition } from '../types/game';

const TILE_W = 140;
const TILE_H = 117;
const BEAST_SWIPE_FRAMES = [
  'beast_swipe_01_windup',
  'beast_swipe_02_preparation',
  'beast_swipe_03_arc_start',
  'beast_swipe_04_mid_swing',
  'beast_swipe_06_follow_through',
  'beast_swipe_07_recovery',
  'beast_swipe_08_idle_recover',
] as const;
const BEAST_SMASH_FRAMES = [
  'beast_smash_left_01_anticipation',
  'beast_smash_left_02_raise',
  'beast_smash_left_03_peak',
  'beast_smash_left_05_impact',
  'beast_smash_left_06_follow_through',
  'beast_smash_left_07_recovery',
  'beast_smash_left_08_idle_recover',
] as const;
const BEAST_IDLE_FRAMES = [
  'beast_swipe_08_idle_recover',
  'beast_swipe_01_windup',
] as const;

export default class GameScene extends Phaser.Scene {
  private levelData: LevelDefinition = level1;
  private player!: Phaser.GameObjects.Sprite;
  private pIndex = 0;
  private groundY = 0;
  private tileHeights: number[] = [];
  private startX = 0;
  
  // Level 2: Beast state
  private beastHp = 0;
  private beastVisual?: Phaser.GameObjects.Container;
  private beastCanBeHit = false;
  private nextBeastAction: 'smash' | 'swipe' = 'smash';
  private beastIdleTimer?: Phaser.Time.TimerEvent;
  private beastIdleActive = false;
  private beastAttackInProgress = false;
  private beastIdleFrameIndex = 0;
  private beastDefeated = false;
  private beastRevealed = false;
  private beastRevealCutscenePlayed = false;
  private goblinSprites: Map<number, Phaser.GameObjects.Image> = new Map();
  private goblinIdleFrameIndex = 0;
  
  // Stage 3: Totem state
  private totemsActivated = 0;
  private totemSprites: Map<number, Phaser.GameObjects.Sprite> = new Map();
  
  // Level 2: Item state
  private hasSword = false;
  private hasShield = false;
  private itemSprites: Map<number, Phaser.GameObjects.Sprite> = new Map();

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('bg_forest', '/assets/bg_new.png');
    this.load.image('bg_path_trials', '/assets/bg_level4_stitched.png');
    this.load.image('char_idle', '/assets/story/character_standing_v3.png');
    this.load.image('char_attack_1', '/assets/story/first_3_attack_frames_spaced_attack1.png');
    this.load.image('char_attack_2', '/assets/story/first_3_attack_frames_spaced_attack2.png');
    this.load.image('char_defend', '/assets/story/hero_defend.png');
    this.load.image('char_hurt_sword', '/assets/story/Anime Adventurer Impact Sprite 1.png');
    this.load.image('char_defeated_sword', '/assets/story/Anime Adventurer Impact Sprite 2.png');
    this.load.image('char_hurt_unarmed', '/assets/story/Anime RPG Hero Hurt and Defeated Sprites without sword 1.png');
    this.load.image('char_defeated_unarmed', '/assets/story/Anime RPG Hero Hurt and Defeated Sprites without sword 2.png');
    this.load.image('goblin_idle_1', '/assets/story/Goblin Warrior Animation 1.png');
    this.load.image('goblin_idle_2', '/assets/story/Goblin Warrior Animation 2.png');
    this.load.image('goblin_defeated', '/assets/story/Defeated Goblin Knockback Sprite.png');
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

    // Ancient Totem Asset
    this.load.image('totem', '/assets/Totem.png');

    // Run with sword
    this.load.image('char_run_sword_1', '/assets/hero_run_sword_1.png');
    this.load.image('char_run_sword_2', '/assets/hero_run_sword_2.png');
    this.load.image('char_run_sword_3', '/assets/hero_run_sword_3.png');
    this.load.image('char_run_sword_4', '/assets/hero_run_sword_4.png');
    this.load.image('char_run_sword_7', '/assets/hero_run_sword_5.png');

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
    this.load.image('beast_shield', '/assets/story/Molten Forest Golem with Golden Shield.png');
    this.load.image('beast_dead', '/assets/story/Ruined Molten Stone-Tree Golem destroyed.png');
    this.load.image('beast_standoff', '/assets/story/forest_guardian_standoff.png');
    BEAST_SWIPE_FRAMES.forEach((key) => this.load.image(key, `/assets/story/${key}.png`));
    BEAST_SMASH_FRAMES.forEach((key) => this.load.image(key, `/assets/story/${key}.png`));
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
    this.totemsActivated = 0;
    this.beastHp = this.levelData.beast?.hp || 0;
    this.beastVisual = undefined;
    this.beastCanBeHit = false;
    this.nextBeastAction = 'smash';
    this.beastIdleActive = false;
    this.beastAttackInProgress = false;
    this.beastIdleFrameIndex = 0;
    this.beastDefeated = false;
    this.beastRevealed = false;
    this.beastRevealCutscenePlayed = false;
    this.beastIdleTimer?.remove();
    this.beastIdleTimer = undefined;
    this.hasSword = false;
    this.hasShield = false;
    if (this.levelData.id === 'level_03') {
      this.hasSword = true;
      this.hasShield = true;
    }
    this.itemSprites.clear();
    this.goblinSprites.clear();
    this.totemSprites.clear();
    this.goblinIdleFrameIndex = 0;
    
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
    // Anchor groundY so bridge pillars sit directly flush on the bottom border (the below tab)
    const targetBridgeHeight = 110;
    this.groundY = Math.max(160, h - targetBridgeHeight);
    this.startX = 150;

    this.drawBackground();
    this.createPlatforms();
    this.spawnPlayer();
    this.spawnBeast();

    // Set camera bounds so it can scroll horizontally
    const worldWidth = this.startX + this.levelData.length * TILE_W + 300;
    this.cameras.main.setBounds(0, 0, worldWidth, h);
  }

  private getBeastCombatIndex(): number {
    return this.levelData.beast
      ? this.levelData.beast.positionIndex - 3
      : Number.POSITIVE_INFINITY;
  }

  private isAtBeastCombatPosition(): boolean {
    return this.pIndex === this.getBeastCombatIndex();
  }

  private isBeyondBeastCombatPosition(index: number): boolean {
    return index > this.getBeastCombatIndex();
  }

  private revealBeastWhenCameraReachesIt(): void {
    if (this.beastRevealed || !this.beastVisual || this.cameras.main.scrollX <= 0) return;

    const cameraRight = this.cameras.main.scrollX + this.cameras.main.width;
    if (this.beastVisual.x - 260 <= cameraRight) {
      this.beastVisual.setVisible(true);
      this.beastRevealed = true;
    }
  }

  private async playBeastRevealCutscene(): Promise<void> {
    if (this.beastRevealCutscenePlayed) return;
    this.beastRevealCutscenePlayed = true;
    if (!this.beastRevealed && this.beastVisual) {
      this.beastVisual.setVisible(true);
      this.beastRevealed = true;
    }

    const source = this.textures.get('beast_standoff').getSourceImage() as HTMLImageElement;
    const halfWidth = Math.floor(source.width / 2);
    const halfHeight = source.height;
    const makeHalfTexture = (key: string, sourceX: number) => {
      if (this.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = halfWidth;
      canvas.height = halfHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(source, sourceX, 0, halfWidth, halfHeight, 0, 0, halfWidth, halfHeight);
      this.textures.addCanvas(key, canvas);
    };

    makeHalfTexture('beast_standoff_left', 0);
    makeHalfTexture('beast_standoff_right', halfWidth);
    if (!this.textures.exists('beast_standoff_left') || !this.textures.exists('beast_standoff_right')) return;

    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const imageWidth = Math.min(screenWidth * 0.94, screenHeight * 3.2);
    const imageHeight = imageWidth * (halfHeight / source.width);
    const halfDisplayWidth = imageWidth / 2;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const curtain = this.add.rectangle(centerX, centerY, screenWidth, screenHeight, 0x000000, 0.78)
      .setScrollFactor(0)
      .setDepth(1000);
    const left = this.add.image(-halfDisplayWidth / 2, centerY, 'beast_standoff_left')
      .setScrollFactor(0)
      .setDepth(1001)
      .setDisplaySize(halfDisplayWidth, imageHeight);
    const right = this.add.image(screenWidth + halfDisplayWidth / 2, centerY, 'beast_standoff_right')
      .setScrollFactor(0)
      .setDepth(1001)
      .setDisplaySize(halfDisplayWidth, imageHeight);

    const slideIn = (target: Phaser.GameObjects.Image, x: number) => new Promise<void>((resolve) => {
      this.tweens.add({ targets: target, x, duration: 700, ease: 'Cubic.easeOut', onComplete: () => resolve() });
    });
    await Promise.all([
      slideIn(left, centerX - halfDisplayWidth / 2),
      slideIn(right, centerX + halfDisplayWidth / 2),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 1600));

    await Promise.all([
      new Promise<void>((resolve) => this.tweens.add({ targets: left, x: -halfDisplayWidth, alpha: 0, duration: 450, onComplete: () => resolve() })),
      new Promise<void>((resolve) => this.tweens.add({ targets: right, x: screenWidth + halfDisplayWidth, alpha: 0, duration: 450, onComplete: () => resolve() })),
      new Promise<void>((resolve) => this.tweens.add({ targets: curtain, alpha: 0, duration: 450, onComplete: () => resolve() })),
    ]);
    left.destroy();
    right.destroy();
    curtain.destroy();
  }

  spawnBeast() {
    if (!this.levelData.beast) return;

    const bx = this.startX + this.levelData.beast.positionIndex * TILE_W + TILE_W / 2;
    const by = this.groundY+18;

    // Fixed world anchor: the large PNG is decorative; combat distance is
    // always determined by tile index, never by the artwork's transparent canvas.
    const body = this.add.image(0, 0, 'beast_shield').setOrigin(0.5, 1);
    this.setBeastTexture(body, 'beast_shield');

    this.beastVisual = this.add.container(bx, by, [body]);
    this.beastVisual.setVisible(false);
    this.updateBeastVisuals();
    this.tweens.add({
      targets: this.beastVisual,
      y: by - 2,
      duration: 1450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.beastIdleTimer = this.time.addEvent({
      delay: 850,
      loop: true,
      callback: () => {
        if (!this.beastIdleActive || this.beastAttackInProgress || this.beastDefeated || !this.beastVisual?.active) return;
        this.beastIdleFrameIndex = (this.beastIdleFrameIndex + 1) % BEAST_IDLE_FRAMES.length;
        const currentBody = this.beastVisual.list[0] as Phaser.GameObjects.Image;
        this.setBeastTexture(currentBody, BEAST_IDLE_FRAMES[this.beastIdleFrameIndex]);
      }
    });
  }

  private setGoblinTexture(goblin: Phaser.GameObjects.Image, textureKey: string): void {
    const bounds: Record<string, { originX: number; originY: number; scale: number }> = {
      goblin_idle_1: { originX: 0.543, originY: 0.916, scale: 0.165 },
      goblin_idle_2: { originX: 0.449, originY: 0.907, scale: 0.165 },
      goblin_defeated: { originX: 0.521, originY: 0.895, scale: 0.09 },
    };
    const boundsForTexture = bounds[textureKey];
    goblin.setTexture(textureKey);
    goblin.setOrigin(boundsForTexture.originX, boundsForTexture.originY);
    goblin.setScale(boundsForTexture.scale);
  }

  private spawnGoblin(tileIndex: number, centerX: number, floorY: number): void {
    // Offset +20px down so the goblin stands firmly on top of the stone platform surface instead of floating in the air
    const groundedY = floorY + 20;
    const goblin = this.add.image(centerX, groundedY, 'goblin_idle_1');
    this.setGoblinTexture(goblin, 'goblin_idle_1');
    this.goblinSprites.set(tileIndex, goblin);
    this.tweens.add({
      targets: goblin,
      y: groundedY - 2,
      duration: 1250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private playGoblinDefeat(tileIndex: number): Promise<void> {
    const goblin = this.goblinSprites.get(tileIndex);
    if (!goblin?.active) return Promise.resolve();

    this.tweens.killTweensOf(goblin);
    this.goblinSprites.delete(tileIndex);
    this.setGoblinTexture(goblin, 'goblin_defeated');
    return new Promise((resolve) => {
      this.tweens.add({
        targets: goblin,
        x: goblin.x + 22,
        alpha: 0,
        duration: 650,
        ease: 'Quad.easeOut',
        onComplete: () => {
          goblin.destroy();
          resolve();
        },
      });
    });
  }

  private setBeastTexture(body: Phaser.GameObjects.Image, textureKey: string) {
    body.setTexture(textureKey);
    body.setOrigin(0.5, 1);

    // The source PNGs have different canvas heights. Normalize their visible
    // height and keep the bottom at y=0 so the beast never jumps/floats when
    // swapping between idle, hit, swipe and smash frames.
    const config: Record<string, { scale: number, offsetY: number, offsetX: number }> = {
      'beast_shield': { scale: 0.227, offsetY: 0, offsetX: -100 },
      'beast_dead': { scale: 0.20, offsetY: 0, offsetX: -100 },
      ...Object.fromEntries(
        BEAST_SWIPE_FRAMES.map((key) => [key, { scale: 0.374, offsetY: 0, offsetX: -130 }])
      ),
      ...Object.fromEntries(
        BEAST_SMASH_FRAMES.map((key) => [key, { scale: 0.66, offsetY: 0, offsetX: -130 }])
      )
    };

    const cfg = config[textureKey] || { scale: 0.25, offsetY: 0, offsetX: -100 };
    body.setScale(cfg.scale);
    body.setPosition(cfg.offsetX, cfg.offsetY);
  }

  updateBeastVisuals() {
    if (!this.levelData.beast || !this.beastVisual) return;
    const body = this.beastVisual.list[0] as Phaser.GameObjects.Image;
    if (this.beastDefeated) {
      this.beastIdleActive = false;
      this.setBeastTexture(body, 'beast_dead');
    } else if (!this.isBeastVulnerable()) {
      this.beastIdleActive = false;
      this.setBeastTexture(body, 'beast_shield');
    } else {
      this.beastIdleActive = true;
      this.beastIdleFrameIndex = 0;
      this.setBeastTexture(body, BEAST_IDLE_FRAMES[this.beastIdleFrameIndex]);
    }
  }
  
  isBeastVulnerable(): boolean {
    if (!this.levelData.beast) return false;
    return this.beastCanBeHit;
  }

  private setBeastVulnerable(): void {
    this.beastCanBeHit = true;
    this.updateBeastVisuals();
  }

  private async prepareNextBeastPhase(): Promise<void> {
    this.beastCanBeHit = false;
    this.nextBeastAction = (this.beastHp % 2 === 0) ? 'swipe' : 'smash';
    this.updateBeastVisuals();
  }

  private playBlockClashAudio(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // AudioContext may be restricted by browser policy before user interaction; ignore silently
    }
  }

  private triggerShieldBlockClash(shieldX: number, shieldY: number, shield: Phaser.GameObjects.Shape): void {
    // 1. Screen impact impulse
    this.cameras.main.shake(280, 0.018);

    // 2. Shield flare
    shield.setFillStyle(0xffffff, 0.95);
    shield.setStrokeStyle(8, 0x38bdf8);
    this.tweens.add({
      targets: shield,
      scale: 1.25,
      duration: 120,
      yoyo: true,
      onComplete: () => {
        shield.setFillStyle(0x55aaff, 0.45);
        shield.setStrokeStyle(5, 0x99ddff);
      }
    });

    // 3. Shockwave ring expanding from point of clash
    const shockwave = this.add.circle(shieldX + 15, shieldY, 20, 0x38bdf8, 0.9).setDepth(20);
    this.tweens.add({
      targets: shockwave,
      scale: 4.0,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => shockwave.destroy()
    });

    // 4. Clash sparks burst
    for (let i = 0; i < 12; i++) {
      const angle = (Math.random() - 0.5) * 1.6;
      const speed = 70 + Math.random() * 80;
      const spark = this.add.circle(
        shieldX + 10,
        shieldY + (Math.random() - 0.5) * 40,
        3 + Math.random() * 4,
        Math.random() > 0.4 ? 0xfde047 : 0xffffff,
        1
      ).setDepth(22);

      this.tweens.add({
        targets: spark,
        x: spark.x + Math.cos(angle) * speed,
        y: spark.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.2,
        duration: 300 + Math.random() * 200,
        onComplete: () => spark.destroy()
      });
    }

    // 5. Floating text banner: 🛡️ ATTACK BLOCKED!
    const blockText = this.add.text(this.player.x + 20, this.player.y - 125, '🛡️ ATTACK BLOCKED!', {
      fontSize: '22px',
      color: '#38bdf8',
      stroke: '#0f172a',
      strokeThickness: 5,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: blockText,
      y: blockText.y - 40,
      alpha: 0,
      duration: 900,
      ease: 'Power2',
      onComplete: () => blockText.destroy()
    });

    // 6. Play synthesized clash audio
    this.playBlockClashAudio();
  }

  private async playBeastAttackBlockedAnimation(
    isSmash: boolean,
    shieldX: number,
    shieldY: number,
    shield: Phaser.GameObjects.Shape
  ): Promise<void> {
    if (!this.beastVisual) return;

    const frames = isSmash ? BEAST_SMASH_FRAMES : BEAST_SWIPE_FRAMES;
    const frameDurations = isSmash
      ? [360, 320, 280, 400, 300, 320, 360]
      : [320, 280, 240, 360, 280, 300, 340];
    const body = this.beastVisual.list[0] as Phaser.GameObjects.Image;

    this.beastIdleActive = false;
    this.beastAttackInProgress = true;
    let blockTriggered = false;

    try {
      for (let index = 0; index < frames.length; index++) {
        this.setBeastTexture(body, frames[index]);

        // Frame index 3 is peak impact where beast strikes player shield
        if (index === 3 && !blockTriggered) {
          blockTriggered = true;
          this.triggerShieldBlockClash(shieldX, shieldY, shield);
        }

        await new Promise((resolve) => setTimeout(resolve, frameDurations[index]));
      }
    } finally {
      this.beastAttackInProgress = false;
    }
  }

  private async playBeastAttackAnimation(isSmash: boolean): Promise<void> {
    if (!this.beastVisual) return;

    const frames = isSmash ? BEAST_SMASH_FRAMES : BEAST_SWIPE_FRAMES;
    const frameDurations = isSmash
      ? [400, 350, 300, 400, 320, 350, 380]
      : [380, 320, 260, 350, 300, 320, 360];
    const body = this.beastVisual.list[0] as Phaser.GameObjects.Image;

    this.beastIdleActive = false;
    this.beastAttackInProgress = true;
    try {
      for (let index = 0; index < frames.length; index++) {
        this.setBeastTexture(body, frames[index]);
        if (isSmash && index === 3) {
          this.cameras.main.shake(320, 0.018);
        }
        await new Promise((resolve) => setTimeout(resolve, frameDurations[index]));
      }
    } finally {
      this.beastAttackInProgress = false;
    }
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
      bgKey = 'bg_path_trials';
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
    if (this.levelData.id === 'level_03') {
      for (let i = 0; i < this.levelData.length; i++) {
        this.tileHeights[i] = this.groundY;
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

      if (this.levelData.id === 'level_03') {
        const currentX = this.startX + i * TILE_W;
        const blockCenterX = currentX + TILE_W / 2;
        
        let texture = 'platform_yellow';
        if (tile === TileType.FIRE) {
          i++;
          continue;
        }
        texture = 'platform_red';
        
        const img = this.add.image(blockCenterX, this.tileHeights[i], texture).setOrigin(0.5, 0);
        img.displayWidth = TILE_W;
        img.displayHeight = Math.max(110, this.scale.height - this.tileHeights[i]);
        
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
        const bridgeHeight = Math.max(110, this.scale.height - this.groundY);
        while (tilesRemaining > 0) {
          let chunk = Math.min(tilesRemaining, 6);
          const blockCenterX = currentX + (chunk * TILE_W) / 2;
          const img = this.add.image(blockCenterX, this.groundY, `bridge_${chunk}`).setOrigin(0.5, 0);
          img.displayWidth = chunk * TILE_W;
          img.displayHeight = bridgeHeight;
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
      } else if (tile === TileType.FIRE) {
        // Realistic fire emitter on the bridge
        // Push the fire down by 60px so it sits inside the gap
        this.add.particles(cx, y + 60, 'fire_particle', {
          color: [0xffff00, 0xff4500, 0x220000],
          colorEase: 'quad.out',
          lifespan: 600,
          angle: { min: 250, max: 290 },
          speed: { min: 80, max: 140 },
          scale: { start: 2.5, end: 0 },
          blendMode: 'ADD',
          frequency: 40
        });

      } else if (tile === TileType.TOTEM_FIRE || tile === TileType.TOTEM_GOBLIN || tile === TileType.TOTEM_FINAL) {
        // Ancient mystical Totem monument
        const isFinal = tile === TileType.TOTEM_FINAL;
        const targetHeight = isFinal ? 155 : 140;
        const totemScale = targetHeight / 1215;

        const totem = this.add.sprite(cx, y + 8, 'totem');
        totem.setOrigin(0.5, 1.0);
        totem.setScale(totemScale);
        totem.setDepth(2);

        // Ambient mystical glow aura around the totem
        const aura = this.add.circle(cx, y - (targetHeight * 0.5), isFinal ? 50 : 40, isFinal ? 0xffcc00 : 0xff9900, isFinal ? 0.22 : 0.16);
        aura.setDepth(1);
        this.tweens.add({
          targets: aura,
          alpha: { from: 0.12, to: 0.32 },
          scale: { from: 0.9, to: 1.18 },
          duration: 1600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Golden rune glyph ring on the ground platform
        const ring = this.add.ellipse(cx, y + 4, TILE_W * (isFinal ? 0.8 : 0.7), 14, 0xffd700, 0.4);
        ring.setDepth(1);
        this.tweens.add({
          targets: ring,
          alpha: { from: 0.25, to: 0.55 },
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        this.totemSprites.set(j, totem);
      } else if (tile === TileType.GOBLIN) {
        this.spawnGoblin(j, cx, y);
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

    if (this.goblinSprites.size > 0) {
      this.time.addEvent({
        delay: 760,
        loop: true,
        callback: () => {
          this.goblinIdleFrameIndex = 1 - this.goblinIdleFrameIndex;
          const textureKey = this.goblinIdleFrameIndex === 0 ? 'goblin_idle_1' : 'goblin_idle_2';
          for (const goblin of this.goblinSprites.values()) {
            if (goblin.active) this.setGoblinTexture(goblin, textureKey);
          }
        },
      });
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

  
  private setPlayerIdle() {
    if (!this.player) return;
    this.player.stop();
    this.setPlayerTextureScale(this.getIdleTexture());
  }


  private setPlayerTextureScale(tex: string) {
    if (!this.player) return;
    this.player.setTexture(tex);
    if (tex === 'char_idle') {
      this.player.setScale(125 / 1520);
      this.player.setOrigin(0.5, 0.98);
    } else if (tex === 'char_attack_1') {
      this.player.setScale(0.246);
      this.player.setOrigin(0.5, 0.847);
    } else if (tex === 'char_attack_2') {
      this.player.setScale(0.237);
      this.player.setOrigin(0.5, 0.874);
    } else if (tex === 'char_defend') {
      this.player.setScale(0.14);
      this.player.setOrigin(0.5, 1.0);
    } else {
      this.player.setScale(1.0);
      this.player.setOrigin(0.5, 1.0);
    }
  }

  private playPlayerAnim(anim: string) {
    if (!this.player) return;
    this.player.setScale(1.0);
    this.player.play(anim);
  }

  private getIdleTexture(): string {
    if (this.hasShield) return 'char_run_sword_shield_1';
    if (this.hasSword) return 'char_run_sword_1';
    return 'char_idle';
  }

  private getRunAnim(): string {
    if (this.hasShield) return 'run_sword_shield';
    if (this.hasSword) return 'run_sword';
    return 'run';
  }

  spawnPlayer() {
    this.pIndex = this.levelData.playerStartX;
    this.player = this.add.sprite(0, 0, this.getIdleTexture()).setOrigin(0.5, 1);
    this.player.setDepth(10);

    // Auto-normalize any frame height in run/jump/fall animations to prevent size glitching
    this.player.on('animationupdate', () => {
      if (this.player && this.player.anims && this.player.anims.currentAnim) {
        const animKey = this.player.anims.currentAnim.key;
        if (animKey.startsWith('run') || animKey === 'jump' || animKey === 'fall') {
          const frameHeight = this.player.frame?.height;
          if (frameHeight && Math.abs(frameHeight - 125) > 4) {
            this.player.setScale(125 / frameHeight);
          } else {
            this.player.setScale(1.0);
          }
          this.player.setOrigin(0.5, 1.0);
        }
      }
    });

    this.setPlayerIdle();
    this.updatePlayerVisuals(false);
  }

  updatePlayerVisuals(animate = true, jump = false): Promise<void> {
    const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;
    const targetY = (this.tileHeights && this.tileHeights.length > this.pIndex ? this.tileHeights[this.pIndex] : this.groundY) + 5;

    return new Promise<void>((resolve) => {
      if (animate) {
        if (jump) {
          this.playPlayerAnim('jump');
          
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
              
              this.setPlayerIdle();
              resolve();
            }
          });
        } else {
          this.playPlayerAnim(this.getRunAnim());
          this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
              this.player.stop();
              this.setPlayerIdle();
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
        this.setPlayerIdle();
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
    // ──── Stage 3: The Path of Trials ────
    if (this.levelData.id === 'level_03') {
      return this.executePathTrialsCommand(cmd);
    }

    // ──── Level 2: Beast Fight ────
    if (this.levelData.id === 'level_02') {
      return this.executeLevel2Command(cmd);
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

    if (cmd.type === 'DEFEND') {
      await this.playDefendInPlace();
      return 'OK';
    }

    if (cmd.type === 'ATTACK') {
      await this.playAttackInPlace();
      return 'OK';
    }

    return 'OK';
  }

  private async playAttackInPlace(): Promise<void> {
    const tex = (this.hasSword || !this.hasShield) ? 'char_attack_2' : 'char_defend';
    this.setPlayerTextureScale(tex);
    await new Promise(r => setTimeout(r, 320));
    this.setPlayerIdle();
  }

  private async playDefendInPlace(): Promise<void> {
    this.setPlayerTextureScale('char_defend');
    const shield = this.add.circle(this.player.x + 25, this.player.y - 45, 32, 0x55aaff, 0.4);
    shield.setStrokeStyle(3, 0x99ddff);
    shield.setDepth(15);
    await new Promise(r => setTimeout(r, 360));
    shield.destroy();
    this.setPlayerIdle();
  }

  // ──── Path of Trials Command Handler ────
  private async executePathTrialsCommand(cmd: Command): Promise<string> {
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

      const totemSprite = this.totemSprites.get(this.pIndex);

      // Play dramatic activation surge on the Totem
      if (totemSprite) {
        const origScaleX = totemSprite.scaleX;
        const origScaleY = totemSprite.scaleY;
        this.tweens.add({
          targets: totemSprite,
          scaleX: origScaleX * 1.15,
          scaleY: origScaleY * 1.15,
          duration: 250,
          yoyo: true,
          ease: 'Back.easeOut'
        });

        // Radiant divine light beam surging upward into the sky
        const beam = this.add.rectangle(totemSprite.x, totemSprite.y - 130, 48, 280, 0xffe680, 0.75);
        beam.setBlendMode(Phaser.BlendModes.ADD);
        beam.setDepth(15);
        this.tweens.add({
          targets: beam,
          alpha: 0,
          scaleX: 2.4,
          duration: 750,
          ease: 'Quad.easeOut',
          onComplete: () => beam.destroy()
        });

        // Floating rune text indicator
        const text = this.add.text(totemSprite.x, totemSprite.y - 150, '✨ TOTEM AWAKENED!', {
          fontFamily: 'Cinzel, serif',
          fontSize: '16px',
          color: '#ffd700',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
          targets: text,
          y: text.y - 30,
          alpha: 0,
          duration: 900,
          ease: 'Power1',
          onComplete: () => text.destroy()
        });
      }
      
      // Play glow animation on player
      const glow = this.add.circle(this.player.x, this.player.y - 20, 45, 0xffd700, 0.7);
      glow.setDepth(15);
      this.tweens.add({
        targets: glow, alpha: 0, scale: 2.2, duration: 600,
        onComplete: () => glow.destroy()
      });
      await new Promise(r => setTimeout(r, 700));
      
      this.totemsActivated++;
      if (this.totemsActivated >= 3) return 'LEVEL_COMPLETE';
      return 'OK';
    }

    // DEFEND: blocks goblin attack if goblin on next tile, otherwise raises shield safely
    if (cmd.type === 'DEFEND') {
      const nextIndex = this.pIndex + 1;
      const nextTile = (nextIndex < this.levelData.length) ? this.levelData.tiles[nextIndex] : null;

      this.setPlayerTextureScale('char_defend');
      const shield = this.add.circle(this.player.x + 35, this.player.y - 45, 45, 0x55aaff, 0.45);
      shield.setStrokeStyle(4, 0x99ddff);
      shield.setDepth(15);

      if (nextTile === TileType.GOBLIN || nextTile === TileType.TOTEM_GOBLIN) {
        const goblin = this.goblinSprites.get(nextIndex);
        if (goblin?.active) {
          await new Promise<void>((res) => {
            this.tweens.add({
              targets: goblin,
              x: goblin.x - 35,
              duration: 180,
              yoyo: true,
              onComplete: () => res()
            });
          });
        }

        this.triggerShieldBlockClash(this.player.x + 35, this.player.y - 45, shield);
        await this.playGoblinDefeat(nextIndex);
        this.levelData.tiles[nextIndex] = TileType.GROUND;
      } else {
        await new Promise(r => setTimeout(r, 400));
      }

      shield.destroy();
      this.setPlayerIdle();
      return 'OK';
    }

    if (cmd.type === 'RUN') {
      const nextIndex = this.pIndex + 1;
      if (nextIndex >= this.levelData.length) return 'OK';
      const nextTile = this.levelData.tiles[nextIndex];
      this.pIndex = nextIndex;

      await this.updatePlayerVisuals(true, false);
      if (nextTile === TileType.FIRE || nextTile === TileType.GOBLIN) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      return 'OK';

    } else if (cmd.type === 'ATTACK') {
      const nextIndex = this.pIndex + 1;
      if (nextIndex >= this.levelData.length) return 'OK';
      const nextTile = this.levelData.tiles[nextIndex];
      this.pIndex = nextIndex;

      this.setPlayerTextureScale('char_attack_2');
      const targetX = this.startX + this.pIndex * TILE_W + TILE_W / 2;
      await new Promise<void>((resolve) => {
        this.tweens.add({
          targets: this.player, x: targetX,
          duration: 300, ease: 'Power2',
          onComplete: () => {
            this.setPlayerIdle();
            resolve();
          }
        });
      });

      if (nextTile === TileType.FIRE || nextTile === TileType.TOTEM_FIRE) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      if (nextTile === TileType.GOBLIN || nextTile === TileType.TOTEM_GOBLIN) {
        await this.playGoblinDefeat(nextIndex);
        this.levelData.tiles[nextIndex] = TileType.GROUND;
      }
      return 'OK';

    } else if (cmd.type === 'JUMP') {
      const skipIndex = this.pIndex + 1;
      const landIndex = this.pIndex + 2;
      if (landIndex >= this.levelData.length) {
         await this.jumpInPlace();
         return 'OK';
      }
      const skipTile = this.levelData.tiles[skipIndex];
      const landTile = this.levelData.tiles[landIndex];
      
      this.pIndex = landIndex;
      await this.updatePlayerVisuals(true, true);

      if (skipTile === TileType.GOBLIN || skipTile === TileType.TOTEM_GOBLIN) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      if (landTile === TileType.GOBLIN || landTile === TileType.TOTEM_GOBLIN || 
          landTile === TileType.FIRE || landTile === TileType.TOTEM_FIRE) {
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
        const sprite = this.itemSprites.get(this.pIndex);
        if (sprite) {
          this.tweens.add({
            targets: sprite, alpha: 0, y: sprite.y - 20, duration: 300,
            onComplete: () => sprite.destroy()
          });
          this.itemSprites.delete(this.pIndex);
        }

        this.setPlayerIdle();
        await new Promise<void>((resolve) => {
          this.tweens.add({
            targets: this.player, y: this.player.y - 20, yoyo: true, duration: 150,
            onComplete: () => resolve()
          });
        });
      }
      return 'OK';
    }

    if (cmd.type === 'ATTACK') {
      if (!this.isAtBeastCombatPosition()) {
        await this.playAttackInPlace();
        return 'OK';
      }
      return this.handleAttack();
    }

    if (cmd.type === 'DEFEND') {
      if (!this.isAtBeastCombatPosition()) {
        await this.playDefendInPlace();
        return 'OK';
      }
      return this.handleDefend();
    }

    if (cmd.type === 'RUN') {
      const nextIndex = this.pIndex + 1;
      if (nextIndex >= this.levelData.length) return 'OK';

      this.pIndex = nextIndex;
      await this.updatePlayerVisuals(true, false);

      const nextTile = this.levelData.tiles[nextIndex];
      if (this.isBeyondBeastCombatPosition(nextIndex)) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      if (nextTile === TileType.GOAL) return 'LEVEL_COMPLETE';
      this.revealBeastWhenCameraReachesIt();
      if (this.isAtBeastCombatPosition()) await this.playBeastRevealCutscene();
      return 'OK';
    }

    if (cmd.type === 'JUMP') {
      const landIndex = this.pIndex + 2;
      if (landIndex >= this.levelData.length) {
        await this.jumpInPlace();
        return 'OK';
      }

      this.pIndex = landIndex;
      await this.updatePlayerVisuals(true, true);

      if (this.isBeyondBeastCombatPosition(landIndex)) {
        await this.playerFallDeath();
        return 'FAILED';
      }
      const landTile = this.levelData.tiles[landIndex];
      if (landTile === TileType.GOAL) return 'LEVEL_COMPLETE';
      this.revealBeastWhenCameraReachesIt();
      if (this.isAtBeastCombatPosition()) await this.playBeastRevealCutscene();
      return 'OK';
    }

    return 'OK';
  }

  private async handleAttack(): Promise<string> {
    if (!this.levelData.beast) return 'OK';

    const vulnerable = this.isBeastVulnerable();

    if (vulnerable) {
      if (this.hasSword) {
        this.setPlayerTextureScale('char_attack_1');
        await new Promise(r => setTimeout(r, 380));
        this.setPlayerTextureScale('char_attack_2');
        await new Promise(r => setTimeout(r, 320));
      } else if (this.hasShield) {
        // Shield Bash attack! Player charges forward with shield
        this.setPlayerTextureScale('char_defend');
        const startX = this.player.x;
        await new Promise<void>((resolve) => {
          this.tweens.add({
            targets: this.player,
            x: startX + 45,
            duration: 220,
            yoyo: true,
            ease: 'Back.easeOut',
            onComplete: () => resolve()
          });
        });
      } else {
        await this.playerFallDeath();
        return 'FAILED';
      }

      this.beastHp--;
      this.beastCanBeHit = false;
      this.beastIdleActive = false;
      this.beastDefeated = this.beastHp <= 0;

      if (this.beastVisual) {
        const body = this.beastVisual.list[0] as Phaser.GameObjects.Image;
        body.setTintFill(0xffffff);
        this.updateBeastVisuals();

        const impact = this.add.circle(this.beastVisual.x - 90, this.beastVisual.y - 130, 22, 0xffffff, 0.9).setDepth(20);
        this.tweens.add({
          targets: impact, scale: 3.5, alpha: 0, duration: 250,
          onComplete: () => impact.destroy()
        });
        this.time.delayedCall(180, () => { if (body.active) body.clearTint(); });
      }

      const hitLabel = (!this.hasSword && this.hasShield)
        ? `💥 SHIELD BASH! [HP: ${this.beastHp}]`
        : `⚔️ STRIKE! [HP: ${this.beastHp}]`;
      const hitText = this.add.text(this.player.x + 80, this.player.y - 120, hitLabel, {
        fontSize: '20px',
        color: '#facc15',
        stroke: '#0f172a',
        strokeThickness: 5,
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(30);

      this.tweens.add({
        targets: hitText,
        y: hitText.y - 40,
        alpha: 0,
        duration: 850,
        ease: 'Power2',
        onComplete: () => hitText.destroy()
      });

      this.setPlayerIdle();

      if (this.beastHp <= 0) {
        await new Promise(r => setTimeout(r, 800));
        return 'LEVEL_COMPLETE';
      }

      await this.prepareNextBeastPhase();
    } else {
      this.setPlayerIdle();

      const deflectText = this.add.text(this.player.x + 80, this.player.y - 110, '🛡️ GUARDED! (Enemy counters)', {
        fontSize: '18px',
        color: '#ef4444',
        stroke: '#000',
        strokeThickness: 4,
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({ targets: deflectText, y: deflectText.y - 30, alpha: 0, duration: 750 });

      if (this.beastVisual) {
        await this.playBeastAttackAnimation(this.nextBeastAction === 'smash');
      }

      await this.playerFallDeath();
      return 'FAILED';
    }

    return 'OK';
  }

  private async handleDefend(): Promise<string> {
    if (!this.levelData.beast) return 'OK';

    this.setPlayerTextureScale('char_defend');

    const shieldX = this.player.x + 35;
    const shieldY = this.player.y - 72;
    const shield = this.add.circle(shieldX, shieldY, 62, 0x55aaff, 0.35);
    shield.setStrokeStyle(5, 0x99ddff);
    shield.setDepth(15);

    // If player does NOT have the shield equipped:
    if (!this.hasShield) {
      const warnText = this.add.text(this.player.x, this.player.y - 110, '⚠️ NO SHIELD EQUIPPED!', {
        fontSize: '20px', color: '#ef4444', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({ targets: warnText, y: warnText.y - 30, alpha: 0, duration: 800 });

      if (this.beastVisual) {
        await this.playBeastAttackAnimation(this.nextBeastAction === 'smash');
      }
      shield.destroy();
      await this.playerFallDeath();
      return 'FAILED';
    }

    // If beast is already vulnerable:
    if (this.beastCanBeHit) {
      const guardText = this.add.text(shieldX, shieldY - 50, '🛡️ GUARD READY', {
        fontSize: '18px', color: '#38bdf8', fontStyle: 'bold', stroke: '#0f172a', strokeThickness: 4
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({
        targets: guardText, y: guardText.y - 30, alpha: 0, duration: 700,
        onComplete: () => guardText.destroy()
      });
      await new Promise(r => setTimeout(r, 500));
      shield.destroy();
      this.setPlayerIdle();
      return 'OK';
    }

    // Beast attacks, and player BLOCKS THE ATTACK!
    const isSmash = (this.nextBeastAction === 'smash');
    await this.playBeastAttackBlockedAnimation(isSmash, shieldX, shieldY, shield);

    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: shield, alpha: 0, scale: 1.3, duration: 250,
        onComplete: () => resolve()
      });
    });
    shield.destroy();
    this.setPlayerIdle();

    // Deflected! Beast is staggered and now vulnerable!
    this.setBeastVulnerable();
    return 'OK';
  }

  // ──── Shared Animations ────
  private async playerFallDeath(): Promise<void> {
    const hasSword = this.hasSword;
    const hurtTexture = hasSword ? 'char_hurt_sword' : 'char_hurt_unarmed';
    const defeatedTexture = hasSword ? 'char_defeated_sword' : 'char_defeated_unarmed';
    const origins: Record<string, { x: number; y: number }> = {
      char_hurt_sword: { x: 0.494, y: 0.934 },
      char_defeated_sword: { x: 0.502, y: 0.974 },
      char_hurt_unarmed: { x: 0.506, y: 0.972 },
      char_defeated_unarmed: { x: 0.494, y: 0.978 },
    };

    this.player.stop();
    this.player.setTexture(hurtTexture);
    this.player.setOrigin(origins[hurtTexture].x, origins[hurtTexture].y);
    this.player.setScale(0.15);
    await new Promise((resolve) => setTimeout(resolve, 280));

    this.player.setTexture(defeatedTexture);
    this.player.setOrigin(origins[defeatedTexture].x, origins[defeatedTexture].y);
    this.player.setScale(0.15);
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.player,
        x: this.player.x - 18,
        alpha: 0,
        duration: 720,
        ease: 'Power2',
        onComplete: () => resolve(),
      });
    });
  }

  private jumpInPlace(): Promise<void> {
    this.playPlayerAnim('jump');
    
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.player,
        y: this.player.y - 180, // Jump height relative to new smaller scale
        yoyo: true,
        duration: 500,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.player.stop();
          
          this.setPlayerIdle();
          resolve();
        }
      });
    });
  }

}
