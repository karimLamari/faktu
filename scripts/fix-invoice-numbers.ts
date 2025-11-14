/**
 * Script de correction de la numérotation des factures
 *
 * Ce script corrige les numéros de factures incohérents en:
 * 1. Récupérant toutes les factures par utilisateur
 * 2. Les triant par date de création (ou date d'émission)
 * 3. Les renumérotant de manière séquentielle
 * 4. Gardant un backup des anciens numéros
 *
 * Usage:
 *   npx ts-node scripts/fix-invoice-numbers.ts [userId]
 *
 * Si userId n'est pas fourni, le script corrige pour TOUS les utilisateurs
 */

import mongoose from 'mongoose';
import Invoice from '../src/models/Invoice';
import User, { type IUser } from '../src/models/User';

// Configuration
const MONGODB_URI = 'mongodb+srv://mirakiramal:HBHvGHRgd29nMaI7@cluster0.b8g5rc3.mongodb.net/invoice-app?retryWrites=true&w=majority';

// Fonction pour générer un numéro de facture
function generateInvoiceNumber(index: number, year: number): string {
  // Format: FACT-YYYY-XXXX (ex: FACT-2025-0001)
  const paddedNumber = String(index).padStart(4, '0');
  return `FACT-${year}-${paddedNumber}`;
}

// Fonction principale de correction
async function fixInvoiceNumbers(userId?: string) {
  console.log('🔧 Démarrage de la correction des numéros de factures...\n');

  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer les utilisateurs à traiter
    let userIds: string[] = [];
    if (userId) {
      // Vérifier que l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        console.error(`❌ Utilisateur ${userId} non trouvé`);
        return;
      }
      userIds = [userId];
      console.log(`📋 Traitement de l'utilisateur: ${user.name || user.email}\n`);
    } else {
      // Récupérer tous les utilisateurs qui ont des factures
      const usersWithInvoices = await Invoice.distinct('userId');
      userIds = usersWithInvoices.map(id => id.toString());
      console.log(`📋 ${userIds.length} utilisateur(s) trouvé(s) avec des factures\n`);
    }

    let totalFixed = 0;
    let totalErrors = 0;

    // Traiter chaque utilisateur
    for (const uid of userIds) {
      try {
        console.log(`\n👤 Traitement utilisateur ID: ${uid}`);

        // Récupérer toutes les factures de l'utilisateur
        const invoices = await Invoice.find({ userId: uid })
          .sort({ issueDate: 1, createdAt: 1 }) // Trier par date d'émission puis date de création
          .lean();

        console.log(`   📄 ${invoices.length} facture(s) trouvée(s)`);

        if (invoices.length === 0) {
          console.log('   ⏭️  Aucune facture à traiter');
          continue;
        }

        // Grouper les factures par année
        const invoicesByYear = new Map<number, any[]>();
        for (const invoice of invoices) {
          const year = new Date(invoice.issueDate).getFullYear();
          if (!invoicesByYear.has(year)) {
            invoicesByYear.set(year, []);
          }
          invoicesByYear.get(year)!.push(invoice);
        }

        console.log(`   📅 ${invoicesByYear.size} année(s) différente(s)`);

        // Renuméroter par année
        let fixedCount = 0;
        const updates: Array<{ id: string; oldNumber: string; newNumber: string }> = [];

        for (const [year, yearInvoices] of invoicesByYear.entries()) {
          console.log(`\n   📆 Année ${year}: ${yearInvoices.length} facture(s)`);

          for (let i = 0; i < yearInvoices.length; i++) {
            const invoice = yearInvoices[i];
            const newNumber = generateInvoiceNumber(i + 1, year);

            // Ne mettre à jour que si le numéro change
            if (invoice.invoiceNumber !== newNumber) {
              updates.push({
                id: invoice._id.toString(),
                oldNumber: invoice.invoiceNumber,
                newNumber: newNumber,
              });
            }
          }
        }

        console.log(`\n   🔄 ${updates.length} facture(s) à mettre à jour`);

        // Afficher un aperçu des changements
        if (updates.length > 0) {
          console.log('\n   Aperçu des changements:');
          updates.slice(0, 5).forEach(update => {
            console.log(`      ${update.oldNumber} → ${update.newNumber}`);
          });
          if (updates.length > 5) {
            console.log(`      ... et ${updates.length - 5} autre(s)`);
          }

          // Demander confirmation si en mode interactif
          if (process.stdin.isTTY && userIds.length === 1) {
            const readline = require('readline').createInterface({
              input: process.stdin,
              output: process.stdout,
            });

            const answer = await new Promise<string>((resolve) => {
              readline.question('\n   ⚠️  Confirmer les modifications? (oui/non): ', resolve);
            });
            readline.close();

            if (answer.toLowerCase() !== 'oui' && answer.toLowerCase() !== 'o' && answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
              console.log('   ❌ Opération annulée par l\'utilisateur');
              continue;
            }
          }

          // Appliquer les changements avec transaction
          const session = await mongoose.startSession();
          try {
            await session.withTransaction(async () => {
              for (const update of updates) {
                const existingInvoice = await Invoice.findById(update.id).select('privateNotes').lean() as any;
                const existingNotes = existingInvoice?.privateNotes || '';

                await Invoice.findByIdAndUpdate(
                  update.id,
                  {
                    invoiceNumber: update.newNumber,
                    // Sauvegarder l'ancien numéro dans privateNotes
                    $set: {
                      privateNotes: `[Migration] Ancien numéro: ${update.oldNumber}\n${existingNotes}`
                    }
                  },
                  { session }
                );
                fixedCount++;
              }
            });
            console.log(`   ✅ ${fixedCount} facture(s) mises à jour avec succès`);
            totalFixed += fixedCount;
          } catch (error) {
            console.error(`   ❌ Erreur lors de la transaction:`, error);
            totalErrors++;
          } finally {
            await session.endSession();
          }
        } else {
          console.log('   ✅ Numérotation déjà cohérente, aucune modification nécessaire');
        }

      } catch (error) {
        console.error(`❌ Erreur pour l'utilisateur ${uid}:`, error);
        totalErrors++;
      }
    }

    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA CORRECTION');
    console.log('='.repeat(60));
    console.log(`✅ Total de factures corrigées: ${totalFixed}`);
    console.log(`❌ Erreurs rencontrées: ${totalErrors}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnexion de MongoDB');
  }
}

// Point d'entrée
async function main() {
  const args = process.argv.slice(2);
  const userId = args[0];

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🔧 SCRIPT DE CORRECTION DES NUMÉROS DE FACTURES 🔧     ║
╚═══════════════════════════════════════════════════════════╝
  `);

  if (userId) {
    console.log(`Mode: Utilisateur spécifique (${userId})`);
  } else {
    console.log(`Mode: Tous les utilisateurs`);
    console.log(`⚠️  ATTENTION: Cela va traiter TOUTES les factures de TOUS les utilisateurs`);

    if (process.stdin.isTTY) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        readline.question('\nContinuer? (oui/non): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'oui' && answer.toLowerCase() !== 'o' && answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Opération annulée');
        process.exit(0);
      }
    }
  }

  await fixInvoiceNumbers(userId);
}

// Exécution
main().catch(console.error);
