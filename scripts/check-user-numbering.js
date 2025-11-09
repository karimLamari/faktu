const mongoose = require('mongoose');

async function checkUserQuoteNumbering() {
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice-app');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}).toArray();
    console.log(`\n👥 Utilisateurs trouvés: ${users.length}\n`);

    users.forEach(user => {
      console.log(`User: ${user.email || user._id}`);
      console.log(`  quoteNumbering:`, user.quoteNumbering);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkUserQuoteNumbering();
