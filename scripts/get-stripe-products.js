/**
 * Script pour récupérer tous les produits et prix Stripe
 * Usage: node scripts/get-stripe-products.js
 */

require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function getStripeProductsAndPrices() {
  try {
    console.log('🔍 Connexion à Stripe...\n');
    console.log('🔑 API Key:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...\n');

    // Récupérer tous les produits
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    console.log(`📦 ${products.data.length} produit(s) actif(s) trouvé(s)\n`);
    console.log('═'.repeat(80));

    // Pour chaque produit, récupérer ses prix
    for (const product of products.data) {
      console.log(`\n🏷️  PRODUIT: ${product.name}`);
      console.log(`   ID Produit: ${product.id}`);
      console.log(`   Description: ${product.description || 'N/A'}`);
      
      // Récupérer les prix pour ce produit
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      if (prices.data.length > 0) {
        console.log(`\n   💰 PRIX (${prices.data.length}):`);
        
        prices.data.forEach((price, index) => {
          const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
          const currency = price.currency?.toUpperCase() || 'N/A';
          const interval = price.recurring?.interval || 'one-time';
          const intervalCount = price.recurring?.interval_count || 1;
          
          console.log(`\n   [${index + 1}] Price ID: ${price.id}`);
          console.log(`       Montant: ${amount} ${currency}`);
          console.log(`       Type: ${price.type}`);
          
          if (price.recurring) {
            console.log(`       Récurrence: Tous les ${intervalCount} ${interval}${intervalCount > 1 ? 's' : ''}`);
          }
          
          console.log(`       Actif: ${price.active ? '✅' : '❌'}`);
        });
      } else {
        console.log(`   ⚠️  Aucun prix trouvé pour ce produit`);
      }
      
      console.log('\n' + '─'.repeat(80));
    }

    // Résumé pour .env
    console.log('\n\n📋 RÉSUMÉ POUR .ENV.LOCAL:\n');
    console.log('═'.repeat(80));
    
    for (const product of products.data) {
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });
      
      if (prices.data.length > 0) {
        console.log(`\n# ${product.name}`);
        
        prices.data.forEach((price) => {
          const interval = price.recurring?.interval || 'onetime';
          const varName = `NEXT_PUBLIC_STRIPE_PRICE_${product.name.toUpperCase().replace(/\s+/g, '_')}_${interval.toUpperCase()}`;
          console.log(`${varName}=${price.id}`);
        });
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ Script terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données Stripe:');
    console.error(error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Vérifiez votre clé API Stripe dans .env.local');
    }
    
    process.exit(1);
  }
}

// Exécuter le script
getStripeProductsAndPrices();
