const mongoose = require('mongoose');

async function fixQuotesIndex() {
  try {
    await mongoose.connect('mongodb+srv://mirakiramal:HBHvGHRgd29nMaI7@cluster0.b8g5rc3.mongodb.net/invoice-app?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const quotesCollection = db.collection('quotes');

    // 1. Voir les quotes existants
    const existingQuotes = await quotesCollection.find({}).toArray();
    console.log(`\n📊 Devis existants: ${existingQuotes.length}`);
    existingQuotes.forEach(q => {
      console.log(`  - ${q.quoteNumber} (${q.status})`);
    });

    // 2. Voir les indexes
    const indexes = await quotesCollection.indexes();
    console.log('\n📑 Index actuels:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // 3. Supprimer l'ancien index si existe
    try {
      await quotesCollection.dropIndex('quoteNumber_1');
      console.log('\n✅ Index quoteNumber_1 supprimé');
    } catch (err) {
      console.log('\n⚠️ Index quoteNumber_1 n\'existe pas ou déjà supprimé');
    }

    // 4. Recréer l'index unique
    await quotesCollection.createIndex({ quoteNumber: 1 }, { unique: true });
    console.log('✅ Nouvel index unique créé sur quoteNumber');

    // 5. Vérifier les doublons
    const duplicates = await quotesCollection.aggregate([
      { $group: { _id: '$quoteNumber', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicates.length > 0) {
      console.log('\n⚠️ DOUBLONS DETECTÉS:');
      duplicates.forEach(d => {
        console.log(`  - ${d._id}: ${d.count} occurrences`);
      });
      console.log('\n🔧 Suppression des doublons...');
      
      for (const dup of duplicates) {
        const docs = await quotesCollection.find({ quoteNumber: dup._id }).toArray();
        // Garder le plus récent, supprimer les autres
        docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        for (let i = 1; i < docs.length; i++) {
          await quotesCollection.deleteOne({ _id: docs[i]._id });
          console.log(`  ❌ Supprimé: ${docs[i]._id}`);
        }
      }
    } else {
      console.log('\n✅ Aucun doublon détecté');
    }

    console.log('\n✅ Migration terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixQuotesIndex();
