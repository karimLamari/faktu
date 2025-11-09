const fs = require('fs');
const path = require('path');

const buildTime = Date.now();
const swPath = path.join(__dirname, '..', 'public', 'sw.js');

// Lire le fichier SW
let swContent = fs.readFileSync(swPath, 'utf8');

// Remplacer les placeholders par le timestamp
swContent = swContent.replace(/\{\{BUILD_TIME\}\}/g, buildTime);

// Écrire le fichier final
fs.writeFileSync(swPath, swContent, 'utf8');

console.log(`✅ Service Worker mis à jour avec build ID: ${buildTime}`);

