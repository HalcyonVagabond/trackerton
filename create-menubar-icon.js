const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a proper macOS menu bar template icon
// Must be:
// - Monochrome (black on transparent)
// - 16x16 or 18x18 for @1x
// - Simple, recognizable design
// - PNG with alpha channel

function createMenuBarIcon() {
  const size = 18; // Standard menu bar icon size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Start with transparent background (CRITICAL for menu bar icons)
  ctx.clearRect(0, 0, size, size);
  
  // Draw a simple clock icon in pure black
  ctx.fillStyle = '#000000';
  
  // Clock circle outline
  ctx.beginPath();
  ctx.arc(size/2, size/2, 7, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  
  // Clock hands
  // Hour hand (shorter, pointing to 10)
  ctx.beginPath();
  ctx.moveTo(size/2, size/2);
  ctx.lineTo(size/2 - 2, size/2 - 3);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // Minute hand (longer, pointing to 2)
  ctx.beginPath();
  ctx.moveTo(size/2, size/2);
  ctx.lineTo(size/2 + 3, size/2 - 4);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // Center dot
  ctx.beginPath();
  ctx.arc(size/2, size/2, 1, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();
  
  // Save as PNG
  const outputPath = path.join(__dirname, 'src', 'assets', 'menuBarIconTemplate.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log('✓ Created proper menu bar icon: menuBarIconTemplate.png');
  console.log('  Size: 18x18px');
  console.log('  Format: Black on transparent PNG');
}

createMenuBarIcon();
