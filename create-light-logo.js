const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createLightLogo() {
  const inputPath = path.join(__dirname, 'src', 'assets', 'logo-icon.png');
  const outputPath = path.join(__dirname, 'src', 'assets', 'logo-icon-light.png');
  
  try {
    const image = await loadImage(inputPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the original image
    ctx.drawImage(image, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Process each pixel - lighten dark colors while preserving details
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Calculate brightness
      const brightness = (r + g + b) / 3;
      
      // If pixel is very dark (like the clock body), lighten it significantly
      if (brightness < 100) {
        // Shift towards cream/beige tones
        data[i] = Math.min(255, r + 180);     // Red channel
        data[i + 1] = Math.min(255, g + 170); // Green channel
        data[i + 2] = Math.min(255, b + 150); // Blue channel
      }
      // Moderately dark pixels - lighter adjustments
      else if (brightness < 150) {
        data[i] = Math.min(255, r + 100);
        data[i + 1] = Math.min(255, g + 95);
        data[i + 2] = Math.min(255, b + 85);
      }
      // Already light pixels - minimal adjustment
      else {
        data[i] = Math.min(255, r + 20);
        data[i + 1] = Math.min(255, g + 20);
        data[i + 2] = Math.min(255, b + 20);
      }
    }
    
    // Put the modified data back
    ctx.putImageData(imageData, 0, 0);
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log('✓ Created light version: logo-icon-light.png');
  } catch (error) {
    console.error('Error:', error);
  }
}

createLightLogo();
