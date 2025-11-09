// Script pour ajouter expensesThisMonth à tous les utilisateurs
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function addExpensesField() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    const result = await User.updateMany(
      {},
      { 
        $set: { 
          'usage.expensesThisMonth': 0
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with expensesThisMonth field`);

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addExpensesField();
