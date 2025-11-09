/**
 * Script pour supprimer les anciens index uniques et créer les nouveaux
 * index composites (userId + invoiceNumber/quoteNumber)
 * 
 * Usage: node scripts/fix-invoice-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixIndexes() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const db = mongoose.connection.db;

    // Fix Invoice indexes
    console.log('\n📝 Traitement de la collection "invoices"...');
    const invoicesCollection = db.collection('invoices');
    
    try {
      // Lister les index existants
      const existingInvoiceIndexes = await invoicesCollection.indexes();
      console.log('Index actuels:', existingInvoiceIndexes.map(i => i.name));

      // Supprimer l'ancien index unique sur invoiceNumber
      try {
        await invoicesCollection.dropIndex('invoiceNumber_1');
        console.log('✅ Ancien index "invoiceNumber_1" supprimé');
      } catch (err) {
        console.log('ℹ️  Index "invoiceNumber_1" déjà supprimé ou inexistant');
      }

      // Créer le nouvel index composite unique
      await invoicesCollection.createIndex(
        { userId: 1, invoiceNumber: 1 },
        { unique: true, name: 'userId_1_invoiceNumber_1' }
      );
      console.log('✅ Nouvel index composite créé: userId_1_invoiceNumber_1');
    } catch (error) {
      console.error('❌ Erreur sur invoices:', error.message);
    }

    // Fix Quote indexes
    console.log('\n📝 Traitement de la collection "quotes"...');
    const quotesCollection = db.collection('quotes');
    
    try {
      // Lister les index existants
      const existingQuoteIndexes = await quotesCollection.indexes();
      console.log('Index actuels:', existingQuoteIndexes.map(i => i.name));

      // Supprimer l'ancien index unique sur quoteNumber
      try {
        await quotesCollection.dropIndex('quoteNumber_1');
        console.log('✅ Ancien index "quoteNumber_1" supprimé');
      } catch (err) {
        console.log('ℹ️  Index "quoteNumber_1" déjà supprimé ou inexistant');
      }

      // Créer le nouvel index composite unique
      await quotesCollection.createIndex(
        { userId: 1, quoteNumber: 1 },
        { unique: true, name: 'userId_1_quoteNumber_1' }
      );
      console.log('✅ Nouvel index composite créé: userId_1_quoteNumber_1');
    } catch (error) {
      console.error('❌ Erreur sur quotes:', error.message);
    }

    console.log('\n✅ Tous les index ont été mis à jour avec succès!');
    console.log('\n📊 Résumé:');
    console.log('- Invoices: index unique sur (userId, invoiceNumber)');
    console.log('- Quotes: index unique sur (userId, quoteNumber)');
    console.log('\n💡 Cela permet à chaque utilisateur d\'avoir ses propres numéros de factures/devis');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

fixIndexes();
