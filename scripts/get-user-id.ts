/**
 * Script utilitaire pour trouver l'ID d'un utilisateur
 *
 * Usage:
 *   npx ts-node scripts/get-user-id.ts <email>
 *   npx ts-node scripts/get-user-id.ts                 (liste tous les utilisateurs)
 */

import mongoose from 'mongoose';
import User, { type IUser } from '../src/models/User';

const MONGODB_URI =  'mongodb+srv://mirakiramal:HBHvGHRgd29nMaI7@cluster0.b8g5rc3.mongodb.net/invoice-app?retryWrites=true&w=majority';

async function getUserId(email?: string) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    if (email) {
      // Rechercher un utilisateur spécifique
      const user = await User.findOne({ email: email.toLowerCase() }).lean() as any;

      if (!user) {
        console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
        return;
      }

      console.log('👤 Utilisateur trouvé:\n');
      console.log(`   ID:    ${user._id}`);
      console.log(`   Nom:   ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Créé:  ${new Date(user.createdAt).toLocaleDateString('fr-FR')}`);

      // Compter les factures
      const Invoice = (await import('../src/models/Invoice')).default;
      const invoiceCount = await Invoice.countDocuments({ userId: user._id });
      console.log(`   Factures: ${invoiceCount}\n`);

    } else {
      // Lister tous les utilisateurs
      const users = await User.find({}).sort({ createdAt: -1 }).lean() as any[];

      if (users.length === 0) {
        console.log('❌ Aucun utilisateur trouvé dans la base');
        return;
      }

      console.log(`📋 ${users.length} utilisateur(s) trouvé(s):\n`);
      console.log('┌────────────────────────────┬──────────────────────────┬─────────────┐');
      console.log('│ ID                         │ Email                    │ Factures    │');
      console.log('├────────────────────────────┼──────────────────────────┼─────────────┤');

      const Invoice = (await import('../src/models/Invoice')).default;

      for (const user of users) {
        const invoiceCount = await Invoice.countDocuments({ userId: user._id });
        const id = String(user._id).padEnd(26);
        const email = (user.email || '').substring(0, 24).padEnd(24);
        const count = String(invoiceCount).padStart(11);
        console.log(`│ ${id} │ ${email} │ ${count} │`);
      }
      console.log('└────────────────────────────┴──────────────────────────┴─────────────┘\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Point d'entrée
async function main() {
  const args = process.argv.slice(2);
  const email = args[0];

  console.log('\n🔍 Recherche d\'utilisateur\n');
  await getUserId(email);
}

main().catch(console.error);
