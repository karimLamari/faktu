// Script pour ajouter les champs subscription et usage aux users existants
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Accéder directement à la collection users
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Compter users existants
    const totalUsers = await usersCollection.countDocuments();
    console.log(`🔍 ${totalUsers} utilisateurs trouvés`);

    // Compter users déjà migrés
    const alreadyMigrated = await usersCollection.countDocuments({
      'subscription.plan': { $exists: true }
    });
    console.log(`✅ ${alreadyMigrated} déjà migrés`);

    // Migrer uniquement les non-migrés
    const result = await usersCollection.updateMany(
      { 
        subscription: { $exists: false } 
      },
      {
        $set: {
          subscription: {
            plan: 'free',
            status: 'active',
          },
          usage: {
            invoicesThisMonth: 0,
            quotesThisMonth: 0,
            clientsCount: 0,
            lastResetDate: new Date(),
          },
        },
      }
    );

    console.log(`✅ Migration terminée : ${result.modifiedCount} users migrés`);
    console.log(`📊 Total après migration : ${totalUsers} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur de migration:', error);
    process.exit(1);
  }
}

migrate();
