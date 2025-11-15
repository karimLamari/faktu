/**
 * Script de migration : Suppression du champ paymentStatus
 * 
 * Ce script synchronise les données en copiant paymentStatus vers status
 * puis supprime le champ paymentStatus
 * 
 * Usage: node scripts/remove-payment-status.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function migratePaymentStatus() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const db = mongoose.connection.db;
    const invoicesCollection = db.collection('invoices');

    // 1. Compter les factures à migrer
    const totalInvoices = await invoicesCollection.countDocuments();
    console.log(`📊 Total des factures : ${totalInvoices}`);

    const withPaymentStatus = await invoicesCollection.countDocuments({
      paymentStatus: { $exists: true }
    });
    console.log(`📋 Factures avec paymentStatus : ${withPaymentStatus}\n`);

    if (withPaymentStatus === 0) {
      console.log('✅ Aucune migration nécessaire. Le champ paymentStatus n\'existe plus.');
      return;
    }

    // 2. Stratégie de mapping
    console.log('🔄 Application de la stratégie de migration...\n');
    console.log('Règles de mapping :');
    console.log('  - paymentStatus: "paid" → status: "paid"');
    console.log('  - paymentStatus: "partially_paid" → status: "partially_paid"');
    console.log('  - paymentStatus: "overdue" → status: "overdue"');
    console.log('  - paymentStatus: "cancelled" → status: "cancelled"');
    console.log('  - paymentStatus: "pending" + status: "sent" → status: "sent"');
    console.log('  - paymentStatus: "pending" + status: "draft" → status: "draft"\n');

    // 3. Migration par lot
    let migratedCount = 0;

    // Cas 1: paymentStatus = paid → status = paid
    const result1 = await invoicesCollection.updateMany(
      { paymentStatus: 'paid' },
      { $set: { status: 'paid' } }
    );
    migratedCount += result1.modifiedCount;
    console.log(`✅ ${result1.modifiedCount} factures "paid" migrées`);

    // Cas 2: paymentStatus = partially_paid → status = partially_paid
    const result2 = await invoicesCollection.updateMany(
      { paymentStatus: 'partially_paid' },
      { $set: { status: 'partially_paid' } }
    );
    migratedCount += result2.modifiedCount;
    console.log(`✅ ${result2.modifiedCount} factures "partially_paid" migrées`);

    // Cas 3: paymentStatus = overdue → status = overdue
    const result3 = await invoicesCollection.updateMany(
      { paymentStatus: 'overdue' },
      { $set: { status: 'overdue' } }
    );
    migratedCount += result3.modifiedCount;
    console.log(`✅ ${result3.modifiedCount} factures "overdue" migrées`);

    // Cas 4: paymentStatus = cancelled → status = cancelled
    const result4 = await invoicesCollection.updateMany(
      { paymentStatus: 'cancelled' },
      { $set: { status: 'cancelled' } }
    );
    migratedCount += result4.modifiedCount;
    console.log(`✅ ${result4.modifiedCount} factures "cancelled" migrées`);

    // Cas 5: paymentStatus = pending, on garde le status actuel (sent ou draft)
    const result5 = await invoicesCollection.updateMany(
      { paymentStatus: 'pending' },
      {} // Pas de changement, on garde le status actuel
    );
    console.log(`✅ ${result5.matchedCount} factures "pending" gardent leur status actuel\n`);

    // 4. Suppression du champ paymentStatus
    console.log('🗑️  Suppression du champ paymentStatus...');
    const removeResult = await invoicesCollection.updateMany(
      { paymentStatus: { $exists: true } },
      { $unset: { paymentStatus: '' } }
    );
    console.log(`✅ ${removeResult.modifiedCount} factures nettoyées\n`);

    // 5. Vérification finale
    const remainingPaymentStatus = await invoicesCollection.countDocuments({
      paymentStatus: { $exists: true }
    });

    console.log('📊 Résumé de la migration :');
    console.log('━'.repeat(60));
    console.log(`Total factures migrées : ${migratedCount}`);
    console.log(`Champ paymentStatus supprimé : ${removeResult.modifiedCount}`);
    console.log(`Factures restantes avec paymentStatus : ${remainingPaymentStatus}`);
    
    if (remainingPaymentStatus === 0) {
      console.log('\n✅ Migration terminée avec succès !');
    } else {
      console.warn(`\n⚠️  Il reste ${remainingPaymentStatus} factures avec paymentStatus`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

// Exécution
migratePaymentStatus();
