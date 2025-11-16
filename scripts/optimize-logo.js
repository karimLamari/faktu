const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public', 'icons');
const inputFile = path.join(publicDir, 'blink_logo.png');
const backupFile = path.join(publicDir, 'blink_logo_original.png');

async function optimizeLogo() {
  try {
    console.log('🔍 Checking logo file...');

    // Backup original
    if (!fs.existsSync(backupFile)) {
      console.log('💾 Creating backup...');
      fs.copyFileSync(inputFile, backupFile);
    }

    // Get original file size
    const originalStats = fs.statSync(inputFile);
    const originalSizeMB = (originalStats.size / 1024 / 1024).toFixed(2);
    console.log(`📏 Original size: ${originalSizeMB}MB`);

    // Optimize
    console.log('🔧 Optimizing logo...');
    await sharp(inputFile)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(inputFile + '.tmp');

    // Replace original
    fs.unlinkSync(inputFile);
    fs.renameSync(inputFile + '.tmp', inputFile);

    // Check new size
    const newStats = fs.statSync(inputFile);
    const newSizeMB = (newStats.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - newStats.size / originalStats.size) * 100).toFixed(0);

    console.log(`✅ Optimized size: ${newSizeMB}MB`);
    console.log(`📉 Reduction: ${reduction}%`);
    console.log(`✨ Logo optimized successfully!`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

optimizeLogo();
