const mongoose = require('mongoose');

async function deleteInvalidQuotes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice-app');
    const db = mongoose.connection.db;
    
    // Supprimer les devis avec total = 0 mais qui ont des items
    const result = await db.collection('quotes').deleteMany({
      total: 0,
      'items.0': { $exists: true }
    });
    
    console.log(`✅ ${result.deletedCount} devis invalides supprimés`);
    
    // Supprimer aussi les factures créées à partir de ces devis
    const invoiceResult = await db.collection('invoices').deleteMany({
      total: 0,
      'items.0': { $exists: true }
    });
    
    console.log(`✅ ${invoiceResult.deletedCount} factures invalides supprimées`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

deleteInvalidQuotes();
