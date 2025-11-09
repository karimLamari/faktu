// Script pour vérifier les variables d'environnement
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Vérification des variables d\'environnement Stripe:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const envVars = {
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
  'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY': process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
  'NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL': process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL,
  'NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY': process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY,
  'NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL': process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL,
};

let hasErrors = false;

for (const [key, value] of Object.entries(envVars)) {
  if (!value) {
    console.log(`❌ ${key}: MANQUANT`);
    hasErrors = true;
  } else {
    const displayValue = value.substring(0, 20) + '...';
    console.log(`✅ ${key}: ${displayValue}`);
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (hasErrors) {
  console.log('⚠️  Des variables sont manquantes ! Vérifiez votre .env.local\n');
  process.exit(1);
} else {
  console.log('✅ Toutes les variables Stripe sont présentes !\n');
  
  // Vérifier les Price IDs spécifiquement
  console.log('📋 Price IDs configurés:\n');
  console.log(`Pro Monthly:    ${process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY}`);
  console.log(`Pro Annual:     ${process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL}`);
  console.log(`Business Monthly: ${process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY}`);
  console.log(`Business Annual:  ${process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL}`);
  console.log('\n✅ Configuration OK pour le local !');
  console.log('\n⚠️  Pour Docker/Portainer, assurez-vous que ces MÊMES valeurs');
  console.log('   sont définies dans les Environment Variables de votre stack.\n');
}
