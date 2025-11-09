// Script pour créer les NOUVEAUX prix dans Stripe (10€ Pro, 25€ Business)
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function updatePrices() {
  try {
    console.log('🔄 Création des nouveaux prix Stripe...\n');

    // IMPORTANT: Récupère les IDs de produits existants depuis Stripe Dashboard
    // ou crée de nouveaux produits si besoin
    
    // Tu dois remplacer ces IDs par tes vrais Product IDs depuis Stripe
    const PRO_PRODUCT_ID = 'prod_TM7zrt6Um1MH4t'; // Ton produit Pro existant
    const BUSINESS_PRODUCT_ID = 'prod_TM7z9l4xDuO8X0'; // Ton produit Business existant

    console.log('📦 Utilisation des produits existants...');
    console.log(`Pro Product: ${PRO_PRODUCT_ID}`);
    console.log(`Business Product: ${BUSINESS_PRODUCT_ID}\n`);

    // Créer les nouveaux prix pour Pro (10€)
    console.log('Création des prix Pro (10€/mois, 100€/an)...');
    const proMonthly = await stripe.prices.create({
      product: PRO_PRODUCT_ID,
      unit_amount: 1000, // 10€
      currency: 'eur',
      recurring: { interval: 'month' },
      lookup_key: 'pro_monthly_v2',
    });
    console.log(`✅ Prix Pro Mensuel créé: ${proMonthly.id}`);

    const proAnnual = await stripe.prices.create({
      product: PRO_PRODUCT_ID,
      unit_amount: 10000, // 100€
      currency: 'eur',
      recurring: { interval: 'year' },
      lookup_key: 'pro_annual_v2',
    });
    console.log(`✅ Prix Pro Annuel créé: ${proAnnual.id}\n`);

    // Créer les nouveaux prix pour Business (25€)
    console.log('Création des prix Business (25€/mois, 250€/an)...');
    const businessMonthly = await stripe.prices.create({
      product: BUSINESS_PRODUCT_ID,
      unit_amount: 2500, // 25€
      currency: 'eur',
      recurring: { interval: 'month' },
      lookup_key: 'business_monthly_v2',
    });
    console.log(`✅ Prix Business Mensuel créé: ${businessMonthly.id}`);

    const businessAnnual = await stripe.prices.create({
      product: BUSINESS_PRODUCT_ID,
      unit_amount: 25000, // 250€
      currency: 'eur',
      recurring: { interval: 'year' },
      lookup_key: 'business_annual_v2',
    });
    console.log(`✅ Prix Business Annuel créé: ${businessAnnual.id}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 METTEZ À JOUR ces variables dans .env.local:\n');
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=${proMonthly.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=${proAnnual.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY=${businessMonthly.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL=${businessAnnual.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Tous les nouveaux prix ont été créés !');
    console.log('\n⚠️  IMPORTANT: Copie les Price IDs ci-dessus dans ton .env.local');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updatePrices();
