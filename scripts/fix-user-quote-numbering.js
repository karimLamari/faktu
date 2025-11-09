const mongoose = require('mongoose');

async function fixUserQuoteNumbering() {
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice-app');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const quotesCollection = db.collection('quotes');

    const users = await usersCollection.find({}).toArray();
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.email || user._id}`);
      
      // Trouver le dernier numéro de devis pour cet utilisateur
      const lastQuote = await quotesCollection
        .find({ userId: user._id })
        .sort({ quoteNumber: -1 })
        .limit(1)
        .toArray();

      if (lastQuote.length > 0) {
        const lastQuoteNumber = lastQuote[0].quoteNumber;
        console.log(`  Dernier devis: ${lastQuoteNumber}`);
        
        // Extraire le numéro (ex: DEVIS-2025-0001 -> 1)
        const match = lastQuoteNumber.match(/DEVIS-(\d{4})-(\d{4})/);
        if (match) {
          const year = parseInt(match[1]);
          const number = parseInt(match[2]);
          const nextNumber = number + 1;
          
          console.log(`  Année: ${year}, Dernier numéro: ${number}`);
          console.log(`  Prochain numéro sera: ${nextNumber}`);
          
          await usersCollection.updateOne(
            { _id: user._id },
            { 
              $set: { 
                quoteNumbering: {
                  prefix: 'DEVIS',
                  year: year,
                  nextNumber: nextNumber
                }
              }
            }
          );
          
          console.log(`  ✅ quoteNumbering mis à jour: { prefix: 'DEVIS', year: ${year}, nextNumber: ${nextNumber} }`);
        }
      } else {
        console.log(`  Aucun devis trouvé, initialisation à 1`);
        await usersCollection.updateOne(
          { _id: user._id },
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
        console.log(`  ✅ quoteNumbering initialisé`);
      }
    }

    console.log('\n✅ Migration terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixUserQuoteNumbering();
