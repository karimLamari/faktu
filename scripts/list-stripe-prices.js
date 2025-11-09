// Script pour lister les prix Stripe existants
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function listPrices() {
  try {
    console.log('🔍 Récupération des produits et prix Stripe...\n');

    // Lister tous les produits actifs
    const products = await stripe.products.list({ active: true, limit: 100 });
    
    console.log(`📦 ${products.data.length} produit(s) trouvé(s):\n`);

    for (const product of products.data) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📦 Produit: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Description: ${product.description || 'N/A'}`);
      
      // Lister les prix pour ce produit
      const prices = await stripe.prices.list({ product: product.id, active: true });
      
      console.log(`   💰 Prix (${prices.data.length}):`);
      for (const price of prices.data) {
        const amount = (price.unit_amount / 100).toFixed(2);
        const interval = price.recurring?.interval || 'one-time';
        const lookupKey = price.lookup_key || 'N/A';
        
        console.log(`      • ${amount}€/${interval}`);
        console.log(`        ID: ${price.id}`);
        console.log(`        Lookup Key: ${lookupKey}`);
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Variables d\'environnement suggérées:\n');

    // Trouver et suggérer les IDs appropriés
    for (const product of products.data) {
      const prices = await stripe.prices.list({ product: product.id, active: true });
      
      if (product.name.toLowerCase().includes('pro')) {
        for (const price of prices.data) {
          if (price.recurring?.interval === 'month') {
            console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=${price.id}`);
          } else if (price.recurring?.interval === 'year') {
            console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=${price.id}`);
          }
        }
      } else if (product.name.toLowerCase().includes('business')) {
        for (const price of prices.data) {
          if (price.recurring?.interval === 'month') {
            console.log(`NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY=${price.id}`);
          } else if (price.recurring?.interval === 'year') {
            console.log(`NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL=${price.id}`);
          }
        }
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Liste complète récupérée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('⚠️  Vérifiez que STRIPE_SECRET_KEY est correctement définie dans .env.local');
      console.error('   Elle doit commencer par sk_live_ (production) ou sk_test_ (test)');
    }
    process.exit(1);
  }
}

listPrices();
