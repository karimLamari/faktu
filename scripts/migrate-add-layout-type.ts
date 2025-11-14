/**
 * Script de migration : Ajouter layoutType aux templates existants
 *
 * Usage:
 *   npm run db:migrate-layout-type
 */

import mongoose from 'mongoose';
import InvoiceTemplate from '../src/models/InvoiceTemplate';

const MONGODB_URI = 'mongodb+srv://mirakiramal:HBHvGHRgd29nMaI7@cluster0.b8g5rc3.mongodb.net/invoice-app?retryWrites=true&w=majority';

async function migrateLayoutType() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Compter les templates sans layoutType
    const templatesWithoutLayoutType = await InvoiceTemplate.countDocuments({
      'layout.layoutType': { $exists: false }
    });

    console.log(`📊 Templates sans layoutType: ${templatesWithoutLayoutType}\n`);

    if (templatesWithoutLayoutType === 0) {
      console.log('✨ Tous les templates ont déjà un layoutType défini');
      return;
    }

    // Mettre à jour tous les templates sans layoutType
    const result = await InvoiceTemplate.updateMany(
      { 'layout.layoutType': { $exists: false } },
      { $set: { 'layout.layoutType': 'modern' } }
    );

    console.log(`✅ Migration terminée avec succès !`);
    console.log(`   - Templates mis à jour: ${result.modifiedCount}`);
    console.log(`   - layoutType par défaut: "modern"\n`);

    // Vérification
    const remainingWithoutLayoutType = await InvoiceTemplate.countDocuments({
      'layout.layoutType': { $exists: false }
    });

    if (remainingWithoutLayoutType === 0) {
      console.log('✅ Vérification réussie : tous les templates ont maintenant layoutType');
    } else {
      console.log(`⚠️  Attention : ${remainingWithoutLayoutType} templates n'ont toujours pas layoutType`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Point d'entrée
migrateLayoutType().catch(console.error);
