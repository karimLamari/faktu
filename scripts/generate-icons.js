#!/usr/bin/env node

/**
 * Script de génération des icônes PWA
 * Utilise sharp pour redimensionner le SVG en PNG
 * 
 * Installation: npm install sharp --save-dev
 * Exécution: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Tailles d'icônes à générer
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

console.log('🎨 Génération des icônes PWA...\n');

// Vérifier si sharp est installé
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp n\'est pas installé.');
  console.log('📦 Installez-le avec: npm install sharp --save-dev\n');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');
const svgPath = path.join(publicDir, 'icon.svg');
const svgMaskablePath = path.join(publicDir, 'icon-maskable.svg');

// Créer le dossier icons s'il n'existe pas
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Générer les icônes normales
async function generateIcons() {
  console.log('📱 Génération des icônes normales...');
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Généré: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
    }
  }
  
  console.log('\n🎭 Génération des icônes maskable...');
  
  // Générer les icônes maskable
  for (const size of maskableSizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}-maskable.png`);
    
    try {
      await sharp(svgMaskablePath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Généré: icon-${size}x${size}-maskable.png`);
    } catch (error) {
      console.error(`❌ Erreur pour maskable ${size}x${size}:`, error.message);
    }
  }
  
  // Générer le favicon (PNG 32x32 et 16x16 dans /icons/)
  console.log('\n🌐 Génération des favicons...');
  
  try {
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(iconsDir, 'favicon-32x32.png'));
    
    console.log('✅ Généré: favicon-32x32.png');
  } catch (error) {
    console.error('❌ Erreur favicon 32x32:', error.message);
  }

  try {
    await sharp(svgPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(iconsDir, 'favicon-16x16.png'));
    
    console.log('✅ Généré: favicon-16x16.png');
  } catch (error) {
    console.error('❌ Erreur favicon 16x16:', error.message);
  }
  
  // Générer apple-touch-icon (180x180)
  console.log('\n🍎 Génération de l\'icône Apple...');
  const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
  
  try {
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(appleTouchPath);
    
    console.log('✅ Généré: apple-touch-icon.png');
  } catch (error) {
    console.error('❌ Erreur apple-touch-icon:', error.message);
  }
  
  console.log('\n✨ Génération terminée!\n');
  console.log('📝 Prochaines étapes:');
  console.log('  1. Vérifier les icônes dans public/icons/');
  console.log('  2. Ajouter les meta tags dans app/layout.tsx');
  console.log('  3. Créer le Service Worker');
  console.log('  4. Tester l\'installation PWA\n');
}

generateIcons().catch(console.error);
