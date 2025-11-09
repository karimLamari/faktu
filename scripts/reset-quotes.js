const mongoose = require('mongoose');

async function resetQuotes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice-app');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Supprimer tous les devis
    const deleteResult = await db.collection('quotes').deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} devis supprimés`);
    
    // Réinitialiser le compteur pour tous les users
    const updateResult = await db.collection('users').updateMany(
      {},
      { 
        $set: { 
          quoteNumbering: { 
            prefix: 'DEVIS', 
            year: 2025, 
            nextNumber: 1 
          } 
        } 
      }
    );
    console.log(`✅ ${updateResult.modifiedCount} utilisateur(s) réinitialisé(s)`);
    
    console.log('\n✅ Base nettoyée et prête pour de nouveaux devis!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

resetQuotes();
