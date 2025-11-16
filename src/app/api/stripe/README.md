# Stripe Integration Structure

## Overview
This directory will contain all Stripe-related API routes, including Stripe Connect for marketplace functionality.

## Current Structure

```
/api/
├── webhook/                    # Main Stripe webhook (Standard & Connect)
│   └── route.ts               # Handles all Stripe events
│
├── subscription/              # Subscription management (Standard Stripe)
│   ├── create-checkout/      # Create checkout session
│   ├── cancel/               # Cancel subscription
│   ├── portal/               # Billing portal
│   └── usage/                # Usage stats
│
└── stripe/                    # Future: Stripe Connect
    ├── connect/              # Connect account management
    │   ├── onboard/         # Connect onboarding
    │   ├── dashboard/       # Connect dashboard link
    │   └── accounts/        # Account operations
    │
    ├── transfers/           # Platform transfers
    │   └── create/         # Create transfer to connected account
    │
    └── payouts/            # Connected account payouts
        └── list/           # List payouts
```

## Webhook Events

### Standard Stripe Events
Handled by `/api/webhook/route.ts`:
- `checkout.session.completed` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Cancellation
- `invoice.paid` - Payment success
- `invoice.payment_failed` - Payment failure

### Stripe Connect Events (Future)
Will be handled by `/api/webhook/route.ts`:
- `account.updated` - Connected account changes
- `account.application.deauthorized` - Account disconnected
- `payout.paid` - Payout completed
- `payout.failed` - Payout failed
- `transfer.created` - Transfer to connected account

## Environment Variables

```env
# Standard Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Connect (Future)
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_PLATFORM_FEE_PERCENT=10
```

## Implementation Phases

### Phase 1: Current (Standard Stripe) ✅
- [x] Subscription billing
- [x] Checkout sessions
- [x] Customer portal
- [x] Webhook handling

### Phase 2: Stripe Connect (Planned)
- [ ] Connect onboarding
- [ ] Connected account management
- [ ] Platform fees and transfers
- [ ] Split payments
- [ ] Marketplace invoicing

## Stripe Connect Use Cases

### Option 1: Marketplace Model
Users can sell invoices/services to their clients:
- Platform takes commission (e.g., 10%)
- Direct payment to connected accounts
- Automatic split at payment time

### Option 2: White Label
Users can use their own Stripe account:
- Full control over payments
- Platform subscription separate
- Users handle their own payout schedule

## Next Steps for Stripe Connect

1. **Enable Stripe Connect** in Dashboard
2. **Choose platform type**:
   - Standard (recommended): Full control
   - Express: Simplified onboarding
   - Custom: Complete white label

3. **Create onboarding flow**
4. **Implement payment splitting**
5. **Add Connect webhooks**

## Documentation
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Platform Guide](https://stripe.com/docs/connect/platform-fees)
