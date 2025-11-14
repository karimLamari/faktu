/**
 * Script de diagnostic pour vérifier les templates de factures
 * Identifie les templates définis mais non inclus dans INVOICE_TEMPLATE_PRESETS
 */

import fs from 'fs';
import path from 'path';

const presetsPath = path.join(process.cwd(), 'src/lib/invoice-templates/presets.ts');

console.log('🔍 Audit des templates de factures...\n');

// Lire le fichier presets.ts
const presetsContent = fs.readFileSync(presetsPath, 'utf-8');

// Extraire tous les exports de templates
const templateExports = presetsContent.match(/export const \w+Template:\s*TemplatePreset\s*=/g) || [];
const templateNames = templateExports.map(exp => {
  const match = exp.match(/export const (\w+Template):/);
  return match ? match[1] : null;
}).filter(Boolean) as string[];

console.log('📋 Templates définis trouvés:');
templateNames.forEach((name, i) => {
  console.log(`  ${i + 1}. ${name}`);
});

// Extraire les templates dans INVOICE_TEMPLATE_PRESETS
const presetsMatch = presetsContent.match(/export const INVOICE_TEMPLATE_PRESETS[^=]*=\s*\{([\s\S]+?)\}/);
const presetsContent_inside = presetsMatch ? presetsMatch[1] : '';

// Extraire les clés (modern, classic, etc.)
const presetKeys = presetsContent_inside.match(/\s+(\w+):\s*\w+Template/g) || [];
const presetKeyNames = presetKeys.map(key => {
  const match = key.match(/\s+(\w+):/);
  return match ? match[1] : null;
}).filter(Boolean) as string[];

console.log('\n📦 Templates dans INVOICE_TEMPLATE_PRESETS:');
presetKeyNames.forEach((key, i) => {
  console.log(`  ${i + 1}. ${key}`);
});

// Trouver les templates manquants
const templateVars = templateNames.map(name => {
  // Enlever "Template" pour obtenir la variable (modernTemplate -> modern)
  const baseName = name.replace(/Template$/, '').toLowerCase();
  return { fullName: name, baseName };
});

console.log('\n🔎 Analyse:');
const missing: string[] = [];
templateVars.forEach(({ fullName, baseName }) => {
  if (!presetKeyNames.includes(baseName)) {
    missing.push(fullName);
    console.log(`  ❌ ${fullName} (${baseName}) - NON inclus dans INVOICE_TEMPLATE_PRESETS`);
  } else {
    console.log(`  ✅ ${fullName} (${baseName}) - Inclus`);
  }
});

if (missing.length > 0) {
  console.log('\n⚠️  PROBLÈME DÉTECTÉ:');
  console.log(`   ${missing.length} template(s) défini(s) mais non inclus dans INVOICE_TEMPLATE_PRESETS`);
  console.log('\n💡 Solution:');
  console.log('   Ajoutez ces templates dans INVOICE_TEMPLATE_PRESETS:');
  console.log('   export const INVOICE_TEMPLATE_PRESETS: Record<string, TemplatePreset> = {');
  presetKeyNames.forEach(key => {
    const templateVar = templateVars.find(t => t.baseName === key);
    if (templateVar) {
      console.log(`     ${key}: ${templateVar.fullName},`);
    }
  });
  missing.forEach(fullName => {
    const baseName = fullName.replace(/Template$/, '').toLowerCase();
    console.log(`     ${baseName}: ${fullName}, // ⚠️ À AJOUTER`);
  });
  console.log('   };');
} else {
  console.log('\n✅ Tous les templates sont correctement inclus dans INVOICE_TEMPLATE_PRESETS');
}

// Vérifier aussi les composants React
console.log('\n🎨 Vérification des composants React:');
const templatesDir = path.join(process.cwd(), 'src/lib/templates');
const templateFiles = fs.readdirSync(templatesDir).filter(f => 
  f.endsWith('Template.tsx') && f !== 'invoice-template-common.ts'
);

const reactComponents = templateFiles.map(f => f.replace('.tsx', ''));
console.log('   Composants trouvés:');
reactComponents.forEach(comp => {
  console.log(`     - ${comp}`);
});

// Vérifier le mapping dans invoice-pdf-react.tsx
const reactPdfPath = path.join(process.cwd(), 'src/lib/templates/invoice-pdf-react.tsx');
if (fs.existsSync(reactPdfPath)) {
  const reactPdfContent = fs.readFileSync(reactPdfPath, 'utf-8');
  
  // Extraire les imports
  const imports = reactPdfContent.match(/import\s+\{\s*(\w+Template)\s*\}\s+from/g) || [];
  const importedComponents = imports.map(imp => {
    const match = imp.match(/import\s+\{\s*(\w+Template)\s*\}/);
    return match ? match[1] : null;
  }).filter(Boolean) as string[];
  
  console.log('\n   Composants importés dans invoice-pdf-react.tsx:');
  importedComponents.forEach(comp => {
    console.log(`     - ${comp}`);
  });
  
  // Extraire les cases du switch
  const switchMatch = reactPdfContent.match(/switch\s*\([^)]+\)\s*\{([^}]+)\}/s);
  if (switchMatch) {
    const switchContent = switchMatch[1];
    const cases = switchContent.match(/case\s+['"]([^'"]+)['"]/g) || [];
    const caseNames = cases.map(c => {
      const match = c.match(/case\s+['"]([^'"]+)['"]/);
      return match ? match[1] : null;
    }).filter(Boolean) as string[];
    
    console.log('\n   Cases dans le switch (template.name):');
    caseNames.forEach(name => {
      console.log(`     - "${name}"`);
    });
    
    // Vérifier la correspondance avec les noms des presets
    console.log('\n   Correspondance noms presets ↔ cases:');
    templateVars.forEach(({ fullName, baseName }) => {
      if (presetKeyNames.includes(baseName)) {
        // Trouver le nom dans le preset
        const presetMatch = presetsContent.match(new RegExp(`${baseName}Template:\\s*TemplatePreset\\s*=\\s*\\{[^}]*name:\\s*['"]([^'"]+)['"]`, 's'));
        const presetName = presetMatch ? presetMatch[1] : null;
        
        if (presetName && caseNames.includes(presetName)) {
          console.log(`     ✅ ${baseName} → "${presetName}" → case trouvé`);
        } else if (presetName) {
          console.log(`     ❌ ${baseName} → "${presetName}" → case MANQUANT`);
        }
      }
    });
  }
}

console.log('\n✨ Diagnostic terminé\n');

