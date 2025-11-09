const mongoose = require('mongoose');

async function checkQuotes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice-app');
    const db = mongoose.connection.db;
    
    const quotes = await db.collection('quotes').find({}).toArray();
    console.log(`\n📋 Devis dans la base: ${quotes.length}`);
    
    if (quotes.length > 0) {
      quotes.forEach(q => {
        console.log(`  - ${q.quoteNumber} (${q.status}) - userId: ${q.userId}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkQuotes();
