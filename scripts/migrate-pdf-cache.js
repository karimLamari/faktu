/**
 * Script de migration: Ajouter champs PDF cache à Invoice et Quote
 * 
 * Exécution: node scripts/migrate-pdf-cache.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blink');

    const db = mongoose.connection;

    // Ajouter champs à Invoice si pas présents
    console.log('📝 Migrating Invoice collection...');
    await db.collection('invoices').updateMany(
      {},
      {
        $set: {
          pdfBuffer: { $ifNull: ['$pdfBuffer', null] },
          pdfTemplateVersion: { $ifNull: ['$pdfTemplateVersion', null] },
          pdfCachedAt: { $ifNull: ['$pdfCachedAt', null] },
        }
      }
    );
    console.log('✅ Invoice collection updated');

    // Ajouter champs à Quote si pas présents
    console.log('📝 Migrating Quote collection...');
    await db.collection('quotes').updateMany(
      {},
      {
        $set: {
          pdfBuffer: { $ifNull: ['$pdfBuffer', null] },
          pdfCachedAt: { $ifNull: ['$pdfCachedAt', null] },
        }
      }
    );
    console.log('✅ Quote collection updated');

    console.log('🎉 Migration completed successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
