const { Jimp } = require('jimp');
const fs = require('fs');

async function main() {
    try {
        const image = await Jimp.read('public/assets/sprite_sheet.jpg');
        
        // Make a clone to draw a grid on
        const gridImage = image.clone();
        
        const width = gridImage.bitmap.width;
        const height = gridImage.bitmap.height;
        
        console.log(`Image size: ${width}x${height}`);
        
        // Draw 100x100 grid
        const color = 0xFF0000FF; // Red
        for (let x = 0; x < width; x += 100) {
            for (let y = 0; y < height; y++) {
                gridImage.setPixelColor(color, x, y);
            }
        }
        for (let y = 0; y < height; y += 100) {
            for (let x = 0; x < width; x++) {
                gridImage.setPixelColor(color, x, y);
            }
        }
        
        await gridImage.writeAsync('public/assets/grid.jpg');
        console.log("Grid image saved to public/assets/grid.jpg");
    } catch (err) {
        console.error(err);
    }
}
main();
