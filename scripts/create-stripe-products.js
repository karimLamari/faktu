// Script pour créer les produits et prix dans Stripe
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    console.log('🔄 Création des produits Stripe...\n');

    // Pro Product
    console.log('Création du produit Pro...');
    const proProd = await stripe.products.create({
      name: 'BLINK Pro',
      description: '50 factures/mois + toutes les fonctionnalités premium',
    });
    console.log(`✅ Produit Pro créé: ${proProd.id}`);

    const proMonthly = await stripe.prices.create({
      product: proProd.id,
      unit_amount: 1000, // 19€
      currency: 'eur',
      recurring: { interval: 'month' },
      lookup_key: 'pro_monthly',
    });
    console.log(`✅ Prix Pro Mensuel créé: ${proMonthly.id}`);

    const proAnnual = await stripe.prices.create({
      product: proProd.id,
      unit_amount: 10000, // 190€
      currency: 'eur',
      recurring: { interval: 'year' },
      lookup_key: 'pro_annual',
    });
    console.log(`✅ Prix Pro Annuel créé: ${proAnnual.id}\n`);

    // Business Product
    console.log('Création du produit Business...');
    const businessProd = await stripe.products.create({
      name: 'BLINK Business',
      description: 'Factures illimitées + multi-users + API',
    });
    console.log(`✅ Produit Business créé: ${businessProd.id}`);

    const businessMonthly = await stripe.prices.create({
      product: businessProd.id,
      unit_amount: 2500, // 49€
      currency: 'eur',
      recurring: { interval: 'month' },
      lookup_key: 'business_monthly',
    });
    console.log(`✅ Prix Business Mensuel créé: ${businessMonthly.id}`);

    const businessAnnual = await stripe.prices.create({
      product: businessProd.id,
      unit_amount: 25000, // 490€
      currency: 'eur',
      recurring: { interval: 'year' },
      lookup_key: 'business_annual',
    });
    console.log(`✅ Prix Business Annuel créé: ${businessAnnual.id}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Ajoutez ces variables à votre .env.local:\n');
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=${proMonthly.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=${proAnnual.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY=${businessMonthly.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL=${businessAnnual.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Tous les produits ont été créés avec succès !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createProducts();
