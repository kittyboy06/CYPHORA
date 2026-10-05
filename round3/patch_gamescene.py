import re

with open('src/game/GameScene.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add this.tileHeights
code = re.sub(
    r'private groundY: number = 0;',
    r'private groundY: number = 0;\n  private tileHeights: number[] = [];',
    code
)

# 2. Modify createPlatforms to compute tileHeights and use them
create_platform_repl = r'''  createPlatforms() {
    this.tileHeights = new Array(this.levelData.length).fill(this.groundY);
    if (this.levelData.id === 'level_03' || this.levelData.id === 'level_04') {
      let currentY = this.groundY;
      for (let i = 0; i < this.levelData.length; i++) {
        const tile = this.levelData.tiles[i];
        this.tileHeights[i] = currentY;
        if (this.levelData.id === 'level_03' && tile === 20) { // TileType.COLOR_BLUE
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
          if (tile === 20) texture = 'platform_blue_slide'; // COLOR_BLUE
          else if (tile === 21) texture = 'platform_red'; // COLOR_RED
          else if (tile === 22) texture = 'platform_yellow'; // COLOR_GOLD
          else if (tile === 99) texture = 'platform_yellow'; // GOAL
        } else if (this.levelData.id === 'level_04') {
          if (tile === 23 || tile === 24 || tile === 25 || tile === 26) texture = 'platform_red';
          else texture = 'platform_yellow';
        }
        
        const img = this.add.image(blockCenterX, this.tileHeights[i], texture).setOrigin(0.5, 0);
        img.displayWidth = TILE_W;
        img.displayHeight = 110;
        
        i++;
'''

code = re.sub(
    r'  createPlatforms\(\) \{.*?i\+\+;',
    create_platform_repl,
    code,
    flags=re.DOTALL
)

# 3. Modify spawnPlayer to use tileHeights[0]
code = re.sub(
    r'spawnPlayer\(\) \{\s*const px = this\.startX \+ this\.pIndex \* TILE_W \+ TILE_W / 2;\s*const py = this\.groundY \+ 5;',
    r'spawnPlayer() {\n    const px = this.startX + this.pIndex * TILE_W + TILE_W / 2;\n    const py = (this.tileHeights && this.tileHeights.length > 0 ? this.tileHeights[0] : this.groundY) + 5;',
    code
)

# 4. Modify updatePlayerVisuals to use tileHeights
code = re.sub(
    r'const targetY = this\.groundY \+ 5;',
    r'const targetY = (this.tileHeights && this.tileHeights.length > this.pIndex ? this.tileHeights[this.pIndex] : this.groundY) + 5;',
    code
)

# 5. Fix Level 3 SLIDE animation height to drop down to targetY
code = re.sub(
    r"y: this\.player\.y \+ 25,",
    r"y: targetY,",
    code
)

# 6. Change GOLD to YELLOW in getTileColor
code = re.sub(
    r"if \(tile === TileType\.COLOR_GOLD\) return 'gold';",
    r"if (tile === TileType.COLOR_GOLD) return 'yellow';",
    code
)

with open('src/game/GameScene.ts', 'w', encoding='utf-8') as f:
    f.write(code)
print("Updated GameScene.ts")
