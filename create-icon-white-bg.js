const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createWhiteBackgroundIcon() {
  const inputPath = path.join(__dirname, 'src', 'assets', 'logo-icon.png');
  const outputPath = path.join(__dirname, 'src', 'assets', 'logo-icon-white-bg.png');
  
  try {
    const image = await loadImage(inputPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Create rounded rectangle path
    const radius = Math.min(image.width, image.height) * 0.22; // 22% radius for modern iOS-style rounding
    
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(image.width - radius, 0);
    ctx.quadraticCurveTo(image.width, 0, image.width, radius);
    ctx.lineTo(image.width, image.height - radius);
    ctx.quadraticCurveTo(image.width, image.height, image.width - radius, image.height);
    ctx.lineTo(radius, image.height);
    ctx.quadraticCurveTo(0, image.height, 0, image.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    
    // Clip to rounded rectangle
    ctx.clip();
    
    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the original image on top
    ctx.drawImage(image, 0, 0);
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log('✓ Created rounded logo-icon-white-bg.png');
  } catch (error) {
    console.error('Error:', error);
  }
}

createWhiteBackgroundIcon();
