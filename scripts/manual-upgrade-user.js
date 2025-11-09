// Script pour upgrader manuellement un utilisateur (test sans webhook)
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function upgradeUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Remplacez par votre email ou ID utilisateur
    const userEmail = 'bimi.sushi31@gmail.com';
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }

    console.log('📝 Current user plan:', user.subscription?.plan || 'free');

    // Upgrade vers Pro
    const updateData = {
      'subscription.plan': 'pro',
      'subscription.status': 'trialing', // En période d'essai
      'subscription.currentPeriodStart': new Date(),
      'subscription.currentPeriodEnd': new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 jours
      'subscription.trialEndsAt': new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      'subscription.stripeSubscriptionId': 'sub_test_manual_' + Date.now(),
      'subscription.stripeCustomerId': 'cus_test_manual_' + Date.now(),
    };

    await User.updateOne({ _id: user._id }, { $set: updateData });

    console.log('✅ User upgraded to Pro plan (trial)');
    console.log('Trial ends at:', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString());

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

upgradeUser();
