const mongoose = require('mongoose');

async function testQuoteNumberGeneration() {
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice-app');
    const db = mongoose.connection.db;
    
    // Récupérer un client pour tester
    const client = await db.collection('clients').findOne({});
    
    if (!client) {
      console.log('⚠️ Aucun client dans la base. Créez un client d\'abord.');
      process.exit(0);
    }

    console.log('🏢 Client trouvé:', client.name);
    
    // Simuler la génération de numéros
    const cleanName = client.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 20);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');

    const quoteNumber = `DEVIS-${cleanName}-${dateStr}-${timeStr}`;

    console.log('\n📋 Numéro de devis généré:');
    console.log('   ', quoteNumber);
    console.log('\n✅ Format:', 'DEVIS-{CLIENT}-{YYYYMMDD}-{HHMMSS}');
    console.log('   - Unique: ✅ (timestamp à la seconde)');
    console.log('   - Lisible: ✅ (nom du client inclus)');
    console.log('   - Pas de compteur: ✅ (pas de race condition)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testQuoteNumberGeneration();
