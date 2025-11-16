const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'icons', 'blink_logo.png');

async function createFavicons() {
  try {
    console.log('🎨 Creating favicons...');

    // Create different sizes
    const sizes = [
      { name: 'favicon.ico', size: 32 },
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
    ];

    for (const { name, size } of sizes) {
      const outputPath = path.join(publicDir, name);

      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);

      console.log(`✅ Created: ${name} (${size}x${size})`);
    }

    console.log('🎉 All favicons created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createFavicons();
