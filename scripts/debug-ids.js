const mongoose = require('mongoose');

async function debugIds() {
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice-app');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    const user = await db.collection('users').findOne({});
    console.log('\n👤 User _id:', user._id);
    console.log('   User _id type:', typeof user._id);
    
    const quote = await db.collection('quotes').findOne({});
    console.log('\n📋 Quote userId:', quote.userId);
    console.log('   Quote userId type:', typeof quote.userId);
    
    console.log('\n🔍 Sont-ils égaux?', user._id.equals(quote.userId));

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

debugIds();
