/**
 * Script de migration : Ajouter les champs de finalisation à toutes les factures existantes
 * 
 * Ce script ajoute les nouveaux champs de conformité légale à toutes les factures :
 * - isFinalized: boolean (false par défaut pour rétrocompatibilité)
 * - deletedAt: Date (null)
 * - pdfPath, pdfHash, finalizedAt, finalizedBy: conservés null
 * 
 * Option: Auto-finaliser les factures déjà envoyées (sentAt existe)
 * 
 * Usage:
 *   node scripts/migrate-add-finalization-fields.js
 *   node scripts/migrate-add-finalization-fields.js --auto-finalize
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const AUTO_FINALIZE = process.argv.includes('--auto-finalize');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non définie dans .env.local');
  process.exit(1);
}

// Connexion MongoDB
async function connect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
}

async function migrate() {
  await connect();

  const db = mongoose.connection.db;
  const invoicesCollection = db.collection('invoices');

  console.log('\n📊 Analyse des factures...');
  
  const totalInvoices = await invoicesCollection.countDocuments();
  const alreadyMigrated = await invoicesCollection.countDocuments({ isFinalized: { $exists: true } });
  const needMigration = totalInvoices - alreadyMigrated;

  console.log(`   Total de factures: ${totalInvoices}`);
  console.log(`   Déjà migrées: ${alreadyMigrated}`);
  console.log(`   À migrer: ${needMigration}`);

  if (needMigration === 0) {
    console.log('\n✅ Toutes les factures sont déjà migrées');
    await mongoose.connection.close();
    return;
  }

  // Compter les factures envoyées (sentAt existe)
  const sentInvoices = await invoicesCollection.countDocuments({
    isFinalized: { $exists: false },
    sentAt: { $exists: true, $ne: null }
  });

  if (AUTO_FINALIZE && sentInvoices > 0) {
    console.log(`\n⚠️  ${sentInvoices} factures envoyées seront auto-finalisées (--auto-finalize activé)`);
  } else if (sentInvoices > 0) {
    console.log(`\n⚠️  ${sentInvoices} factures envoyées ne seront PAS finalisées (utilisez --auto-finalize pour les finaliser)`);
  }

  console.log('\n🔄 Migration en cours...');

  try {
    // 1. Migrer les factures NON envoyées (isFinalized = false)
    const result1 = await invoicesCollection.updateMany(
      { 
        isFinalized: { $exists: false },
        $or: [
          { sentAt: { $exists: false } },
          { sentAt: null }
        ]
      },
      {
        $set: {
          isFinalized: false,
          deletedAt: null
        }
      }
    );

    console.log(`   ✅ ${result1.modifiedCount} factures brouillon migrées (isFinalized=false)`);

    // 2. Migrer les factures ENVOYÉES
    if (AUTO_FINALIZE && sentInvoices > 0) {
      // Auto-finaliser les factures envoyées
      const result2 = await invoicesCollection.updateMany(
        { 
          isFinalized: { $exists: false },
          sentAt: { $exists: true, $ne: null }
        },
        {
          $set: {
            isFinalized: true,
            finalizedAt: new Date(),
            deletedAt: null
            // Note: pdfPath, pdfHash, finalizedBy restent null car PDF pas régénéré
          }
        }
      );

      console.log(`   ✅ ${result2.modifiedCount} factures envoyées AUTO-FINALISÉES (isFinalized=true)`);
      console.log(`   ⚠️  Ces factures n'ont pas de PDF stocké/hashé. Considérez la régénération.`);
    } else if (sentInvoices > 0) {
      // Marquer les factures envoyées comme non-finalisées mais bloquées
      const result2 = await invoicesCollection.updateMany(
        { 
          isFinalized: { $exists: false },
          sentAt: { $exists: true, $ne: null }
        },
        {
          $set: {
            isFinalized: false, // Conservées non-finalisées par sécurité
            deletedAt: null
          }
        }
      );

      console.log(`   ✅ ${result2.modifiedCount} factures envoyées migrées (isFinalized=false, modification bloquée par sentAt)`);
    }

    // 3. Vérifier les index requis
    console.log('\n🔍 Vérification des index...');
    const indexes = await invoicesCollection.indexes();
    const requiredIndexes = [
      'userId_1_isFinalized_1',
      'userId_1_deletedAt_1',
      'isFinalized_1_deletedAt_1'
    ];

    const existingIndexNames = indexes.map(idx => idx.name);
    const missingIndexes = requiredIndexes.filter(idx => !existingIndexNames.includes(idx));

    if (missingIndexes.length > 0) {
      console.log(`   ⚠️  Index manquants détectés: ${missingIndexes.join(', ')}`);
      console.log(`   💡 Créez-les avec: await Invoice.createIndexes() dans l'application`);
    } else {
      console.log(`   ✅ Tous les index requis sont présents`);
    }

    // 4. Statistiques finales
    console.log('\n📊 Statistiques après migration:');
    const stats = {
      total: await invoicesCollection.countDocuments(),
      finalized: await invoicesCollection.countDocuments({ isFinalized: true }),
      notFinalized: await invoicesCollection.countDocuments({ isFinalized: false }),
      sent: await invoicesCollection.countDocuments({ sentAt: { $exists: true, $ne: null } }),
      deleted: await invoicesCollection.countDocuments({ deletedAt: { $exists: true, $ne: null } })
    };

    console.log(`   Total: ${stats.total}`);
    console.log(`   Finalisées: ${stats.finalized} (${((stats.finalized/stats.total)*100).toFixed(1)}%)`);
    console.log(`   Non finalisées: ${stats.notFinalized}`);
    console.log(`   Envoyées: ${stats.sent}`);
    console.log(`   Supprimées (soft delete): ${stats.deleted}`);

    console.log('\n✅ Migration terminée avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Vérifiez les factures avec: npm run db:check-invoices');
    console.log('   2. Les factures brouillon peuvent être finalisées manuellement dans l\'UI');
    if (!AUTO_FINALIZE && sentInvoices > 0) {
      console.log('   3. Relancez avec --auto-finalize pour finaliser les factures envoyées');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécution
migrate().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
