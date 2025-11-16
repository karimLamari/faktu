# Stripe Connect - Implementation Guide

## Overview
Stripe Connect allows your users to have their own Stripe accounts while you manage the platform. This enables marketplace functionality with automatic commission splitting.

## Architecture Choice

### Recommended: Standard Accounts
**Best for**: Most platforms
- Full Stripe Dashboard access for users
- Complete control over their funds
- Platform collects application fees
- Users handle disputes and chargebacks

## Implementation Steps

### Step 1: Enable Stripe Connect
1. Go to https://dashboard.stripe.com/settings/connect
2. Enable Connect
3. Choose "Standard" account type
4. Set redirect URI: `https://yourdomain.com/dashboard/connect/callback`
5. Get your Connect Client ID

### Step 2: Add Environment Variables
```env
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_PLATFORM_FEE_PERCENT=10
```

### Step 3: Update User Model
```typescript
// Add to User schema
stripeConnectedAccountId?: string
stripeAccountType?: 'standard' | 'express' | 'custom'
stripeOnboardingComplete?: boolean
stripeChargesEnabled?: boolean
stripePayoutsEnabled?: boolean
platformFeePercent?: number  // Default: 10
connectedAccountDetails?: {
  businessName?: string
  country?: string
  currency?: string
  defaultCurrency?: string
}
```

## Routes to Create

### `/api/stripe/connect/onboard`
Create onboarding link for users.

```typescript
import { stripe } from '@/lib/subscription/stripe';

export async function POST(req: Request) {
  const session = await auth();
  const user = await User.findById(session.user.id);

  // Create or retrieve account
  let accountId = user.stripeConnectedAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'standard',
      email: user.email,
    });

    user.stripeConnectedAccountId = account.id;
    await user.save();
    accountId = account.id;
  }

  // Create account link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/connect/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/connect/complete`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: accountLink.url });
}
```

### `/api/stripe/connect/dashboard`
Generate login link to Stripe Dashboard.

```typescript
export async function POST(req: Request) {
  const session = await auth();
  const user = await User.findById(session.user.id);

  if (!user.stripeConnectedAccountId) {
    return NextResponse.json(
      { error: 'No connected account' },
      { status: 400 }
    );
  }

  const loginLink = await stripe.accounts.createLoginLink(
    user.stripeConnectedAccountId
  );

  return NextResponse.json({ url: loginLink.url });
}
```

### `/api/stripe/connect/accounts/[id]`
Get connected account details.

```typescript
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = await User.findById(session.user.id);

  // Verify ownership
  if (user.stripeConnectedAccountId !== params.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const account = await stripe.accounts.retrieve(params.id);

  return NextResponse.json({
    id: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: account.requirements,
  });
}
```

## Webhook Events for Connect

Add to `/api/webhook/route.ts`:

```typescript
case 'account.updated': {
  const account = event.data.object as Stripe.Account;
  await handleAccountUpdated(account);
  break;
}

case 'account.application.deauthorized': {
  const account = event.data.object as Stripe.Account;
  await handleAccountDeauthorized(account);
  break;
}

case 'payout.paid': {
  const payout = event.data.object as Stripe.Payout;
  await handlePayoutPaid(payout);
  break;
}

case 'payout.failed': {
  const payout = event.data.object as Stripe.Payout;
  await handlePayoutFailed(payout);
  break;
}
```

### Handler Functions

```typescript
async function handleAccountUpdated(account: Stripe.Account) {
  await User.findOneAndUpdate(
    { stripeConnectedAccountId: account.id },
    {
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeOnboardingComplete: account.details_submitted,
      'connectedAccountDetails.businessName': account.business_profile?.name,
      'connectedAccountDetails.country': account.country,
      'connectedAccountDetails.currency': account.default_currency,
    }
  );
}

async function handleAccountDeauthorized(account: Stripe.Account) {
  await User.findOneAndUpdate(
    { stripeConnectedAccountId: account.id },
    {
      stripeConnectedAccountId: undefined,
      stripeOnboardingComplete: false,
      stripeChargesEnabled: false,
      stripePayoutsEnabled: false,
    }
  );
}
```

## Payment Flow with Connect

### Create Invoice Payment with Application Fee

```typescript
// In invoice payment creation
const paymentIntent = await stripe.paymentIntents.create({
  amount: invoice.total * 100, // Convert to cents
  currency: 'eur',
  application_fee_amount: Math.floor(invoice.total * 100 * (platformFeePercent / 100)),
  transfer_data: {
    destination: connectedAccountId,
  },
  metadata: {
    invoiceId: invoice._id.toString(),
    userId: user._id.toString(),
  },
});
```

### Split Payment Example

```
Invoice Total: 1000€
Platform Fee (10%): 100€
User Receives: 900€

Stripe Fees: ~2.9% + 0.30€ = ~29.30€
Platform Net: 100€ - 29.30€ = 70.70€
User Net: 900€
```

## UI Components

### Connect Button

```tsx
'use client';

export const ConnectStripeButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe/connect/onboard', {
      method: 'POST',
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <Button onClick={handleConnect} disabled={loading}>
      {loading ? 'Redirecting...' : 'Connect Stripe Account'}
    </Button>
  );
};
```

### Account Status

```tsx
export const ConnectedAccountStatus: React.FC<{ user: User }> = ({ user }) => {
  if (!user.stripeConnectedAccountId) {
    return <ConnectStripeButton />;
  }

  return (
    <div>
      <Badge variant={user.stripeOnboardingComplete ? 'success' : 'warning'}>
        {user.stripeOnboardingComplete ? 'Connected' : 'Incomplete'}
      </Badge>

      {user.stripeChargesEnabled && (
        <Badge variant="success">Charges Enabled</Badge>
      )}

      {user.stripePayoutsEnabled && (
        <Badge variant="success">Payouts Enabled</Badge>
      )}

      <Button onClick={() => openDashboard()}>
        View Stripe Dashboard
      </Button>
    </div>
  );
};
```

## Testing

### Test Connected Account
```bash
# Create test connected account
stripe accounts create --type=standard

# Create test transfer
stripe transfers create \
  --amount=1000 \
  --currency=eur \
  --destination=acct_xxx
```

### Test Webhooks
```bash
stripe listen --forward-to localhost:3000/api/webhook

# Trigger events
stripe trigger account.updated
stripe trigger payout.paid
```

## Migration Path

1. **Phase 1**: Setup infrastructure
   - Add Connect routes
   - Update User model
   - Test onboarding flow

2. **Phase 2**: Migrate existing users
   - Offer Connect onboarding
   - Keep existing payments working
   - Gradual rollout

3. **Phase 3**: Full Connect
   - All new invoices use Connect
   - Commission tracking
   - Analytics dashboard

## Best Practices

1. **Always verify account ownership** before operations
2. **Handle incomplete onboarding** gracefully
3. **Monitor webhook failures** for Connect events
4. **Validate fees** before creating charges
5. **Store account details** for offline access
6. **Handle deauthorization** properly

## Troubleshooting

### Account not receiving payouts
- Check `payouts_enabled` status
- Verify bank account connected
- Check requirements in Stripe Dashboard

### Onboarding not completing
- Check all required fields submitted
- Verify business verification
- Contact Stripe support if stuck

### Platform fees not showing
- Ensure using `application_fee_amount`
- Check Connect settings in Dashboard
- Verify account is Standard type

## Resources

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Standard Accounts Guide](https://stripe.com/docs/connect/standard-accounts)
- [Platform Fees](https://stripe.com/docs/connect/charges)
- [Webhooks](https://stripe.com/docs/connect/webhooks)
