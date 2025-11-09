// Script pour downgrade vers FREE (test)
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function downgradeToFree() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    const userEmail = 'bimi.sushi31@gmail.com';
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }

    console.log('📝 Current user plan:', user.subscription?.plan || 'free');

    // Downgrade vers FREE
    const updateData = {
      'subscription.plan': 'free',
      'subscription.status': 'active',
      'subscription.currentPeriodStart': null,
      'subscription.currentPeriodEnd': null,
      'subscription.trialEndsAt': null,
      'subscription.stripeSubscriptionId': null,
      'subscription.stripeCustomerId': null,
    };

    await User.updateOne({ _id: user._id }, { $set: updateData });

    console.log('✅ User downgraded to FREE plan');
    console.log('Limits: 5 invoices/month, 5 clients');

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

downgradeToFree();
