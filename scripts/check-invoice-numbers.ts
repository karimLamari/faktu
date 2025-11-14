/**
 * Script de vérification de la numérotation des factures (DRY RUN)
 *
 * Ce script analyse les numéros de factures et affiche:
 * - Les incohérences détectées
 * - Les doublons
 * - Les sauts de numérotation
 * - Un aperçu des corrections proposées
 *
 * Ce script NE MODIFIE PAS la base de données
 *
 * Usage:
 *   npx ts-node scripts/check-invoice-numbers.ts [userId]
 */

import mongoose from 'mongoose';
import Invoice from '../src/models/Invoice';
import User, { type IUser } from '../src/models/User';

// Configuration
const MONGODB_URI = 'mongodb+srv://mirakiramal:HBHvGHRgd29nMaI7@cluster0.b8g5rc3.mongodb.net/invoice-app?retryWrites=true&w=majority';

// Fonction pour générer un numéro de facture
function generateInvoiceNumber(index: number, year: number): string {
  const paddedNumber = String(index).padStart(4, '0');
  return `FACT-${year}-${paddedNumber}`;
}

// Fonction d'analyse
async function checkInvoiceNumbers(userId?: string) {
  console.log('🔍 Démarrage de l\'analyse des numéros de factures...\n');

  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer les utilisateurs à analyser
    let userIds: string[] = [];
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        console.error(`❌ Utilisateur ${userId} non trouvé`);
        return;
      }
      userIds = [userId];
      console.log(`📋 Analyse de l'utilisateur: ${user.name || user.email}\n`);
    } else {
      const usersWithInvoices = await Invoice.distinct('userId');
      userIds = usersWithInvoices.map(id => id.toString());
      console.log(`📋 ${userIds.length} utilisateur(s) trouvé(s) avec des factures\n`);
    }

    let totalIssues = 0;

    // Analyser chaque utilisateur
    for (const uid of userIds) {
      try {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`👤 UTILISATEUR: ${uid}`);
        console.log('='.repeat(70));

        // Récupérer l'utilisateur
        const user = await User.findById(uid).lean() as any;
        if (user) {
          console.log(`   Nom: ${user.firstName} ${user.lastName}`);
          console.log(`   Email: ${user.email}`);
        }

        // Récupérer toutes les factures
        const invoices = await Invoice.find({ userId: uid })
          .sort({ issueDate: 1, createdAt: 1 })
          .lean();

        console.log(`\n   📄 ${invoices.length} facture(s) au total\n`);

        if (invoices.length === 0) {
          console.log('   ✅ Aucune facture à analyser\n');
          continue;
        }

        // Grouper par année
        const invoicesByYear = new Map<number, any[]>();
        for (const invoice of invoices) {
          const year = new Date(invoice.issueDate).getFullYear();
          if (!invoicesByYear.has(year)) {
            invoicesByYear.set(year, []);
          }
          invoicesByYear.get(year)!.push(invoice);
        }

        let userIssues = 0;

        // Analyser par année
        for (const [year, yearInvoices] of Array.from(invoicesByYear.entries()).sort((a, b) => a[0] - b[0])) {
          console.log(`\n   📆 ANNÉE ${year} (${yearInvoices.length} facture(s))`);
          console.log('   ' + '-'.repeat(66));

          // Détecter les doublons
          const numbers = yearInvoices.map(inv => inv.invoiceNumber);
          const duplicates = numbers.filter((num, idx) => numbers.indexOf(num) !== idx);
          if (duplicates.length > 0) {
            console.log(`\n   ⚠️  DOUBLONS DÉTECTÉS:`);
            [...new Set(duplicates)].forEach(dup => {
              console.log(`      - "${dup}" apparaît plusieurs fois`);
            });
            userIssues += duplicates.length;
          }

          // Analyser la séquence
          const issues: string[] = [];
          const corrections: Array<{ current: string; expected: string; date: string }> = [];

          yearInvoices.forEach((invoice, idx) => {
            const expectedNumber = generateInvoiceNumber(idx + 1, year);
            const currentNumber = invoice.invoiceNumber;

            if (currentNumber !== expectedNumber) {
              issues.push(currentNumber);
              corrections.push({
                current: currentNumber,
                expected: expectedNumber,
                date: new Date(invoice.issueDate).toLocaleDateString('fr-FR'),
              });
            }
          });

          if (issues.length > 0) {
            console.log(`\n   ⚠️  INCOHÉRENCES DÉTECTÉES: ${issues.length} facture(s)`);
            console.log('\n   Corrections proposées:');
            console.log('   ┌──────────────────┬──────────────────┬────────────┐');
            console.log('   │ Numéro actuel    │ Numéro correct   │ Date       │');
            console.log('   ├──────────────────┼──────────────────┼────────────┤');
            corrections.forEach(corr => {
              console.log(`   │ ${corr.current.padEnd(16)} │ ${corr.expected.padEnd(16)} │ ${corr.date.padEnd(10)} │`);
            });
            console.log('   └──────────────────┴──────────────────┴────────────┘');
            userIssues += issues.length;
          } else {
            console.log(`   ✅ Numérotation cohérente pour ${year}`);
          }
        }

        if (userIssues > 0) {
          console.log(`\n   ⚠️  Total: ${userIssues} problème(s) détecté(s) pour cet utilisateur`);
          totalIssues += userIssues;
        } else {
          console.log(`\n   ✅ Aucun problème détecté pour cet utilisateur`);
        }

      } catch (error) {
        console.error(`\n   ❌ Erreur lors de l'analyse de l'utilisateur ${uid}:`, error);
      }
    }

    // Résumé global
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 RÉSUMÉ DE L\'ANALYSE');
    console.log('='.repeat(70));
    console.log(`Utilisateurs analysés: ${userIds.length}`);
    console.log(`Total de problèmes détectés: ${totalIssues}`);

    if (totalIssues > 0) {
      console.log('\n⚠️  Des corrections sont nécessaires');
      console.log('💡 Exécutez le script fix-invoice-numbers.ts pour corriger automatiquement');
    } else {
      console.log('\n✅ Toutes les numérotations sont cohérentes!');
    }
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnexion de MongoDB\n');
  }
}

// Point d'entrée
async function main() {
  const args = process.argv.slice(2);
  const userId = args[0];

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🔍 VÉRIFICATION DES NUMÉROS DE FACTURES (DRY RUN) 🔍   ║
╚═══════════════════════════════════════════════════════════╝
  `);

  if (userId) {
    console.log(`Mode: Utilisateur spécifique (${userId})\n`);
  } else {
    console.log(`Mode: Tous les utilisateurs\n`);
  }

  await checkInvoiceNumbers(userId);
}

// Exécution
main().catch(console.error);
