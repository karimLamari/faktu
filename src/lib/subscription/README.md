# Subscription & Billing System Documentation

## Overview
Complete subscription management system with tiered pricing, feature gating, usage tracking, and Stripe integration. Supports Free, Pro, and Business plans with monthly and annual billing.

## Directory Structure

```
src/lib/subscription/
├── plans.ts              # Plan definitions and feature matrix
├── checkAccess.ts        # Feature gating and usage limit checks
├── stripe.ts             # Stripe client configuration
└── utils.ts              # Helper functions
```

---

## Subscription Plans

### Plan Comparison

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Price** | €0 | €10/mo or €100/yr | €25/mo or €250/yr |
| **Invoices/month** | 5 | 50 | Unlimited |
| **Quotes/month** | 5 | 50 | Unlimited |
| **Expenses/month** | 5 | 50 | Unlimited |
| **Clients** | 5 max | Unlimited | Unlimited |
| **Templates** | 1 | Unlimited | Unlimited |
| **Email Automation** | ❌ | ✅ | ✅ |
| **Payment Reminders** | ❌ | ✅ | ✅ |
| **OCR Scanning** | ❌ | ✅ | ✅ |
| **E-Signature** | ❌ | ✅ | ✅ |
| **Advanced Analytics** | ❌ | ✅ | ✅ |
| **CSV Export** | ❌ | ✅ | ✅ |
| **Multi-user** | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |

---

## Plan Definitions

### plans.ts

```typescript
export type PlanName = 'free' | 'pro' | 'business'

export interface PlanLimits {
  invoices: number | 'unlimited'
  quotes: number | 'unlimited'
  expenses: number | 'unlimited'
  clients: number | 'unlimited'
  templates: number | 'unlimited'
}

export interface PlanFeatures {
  emailAutomation: boolean
  reminders: boolean
  ocr: boolean
  eSignature: boolean
  advancedAnalytics: boolean
  csvExport: boolean
  multiUser: boolean
  apiAccess: boolean
}

export interface Plan {
  name: PlanName
  displayName: string
  description: string
  price: {
    monthly: number
    annual: number
  }
  stripePriceIds: {
    monthly: string
    annual: string
  }
  limits: PlanLimits
  features: PlanFeatures
}

export const PLANS: Record<PlanName, Plan> = {
  free: {
    name: 'free',
    displayName: 'Free',
    description: 'Perfect for getting started',
    price: {
      monthly: 0,
      annual: 0
    },
    stripePriceIds: {
      monthly: '',
      annual: ''
    },
    limits: {
      invoices: 5,
      quotes: 5,
      expenses: 5,
      clients: 5,
      templates: 1
    },
    features: {
      emailAutomation: false,
      reminders: false,
      ocr: false,
      eSignature: false,
      advancedAnalytics: false,
      csvExport: false,
      multiUser: false,
      apiAccess: false
    }
  },

  pro: {
    name: 'pro',
    displayName: 'Pro',
    description: 'For growing businesses',
    price: {
      monthly: 10,
      annual: 100  // 2 months free
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
      annual: process.env.STRIPE_PRICE_PRO_ANNUAL || ''
    },
    limits: {
      invoices: 50,
      quotes: 50,
      expenses: 50,
      clients: 'unlimited',
      templates: 'unlimited'
    },
    features: {
      emailAutomation: true,
      reminders: true,
      ocr: true,
      eSignature: true,
      advancedAnalytics: true,
      csvExport: true,
      multiUser: false,
      apiAccess: false
    }
  },

  business: {
    name: 'business',
    displayName: 'Business',
    description: 'For established companies',
    price: {
      monthly: 25,
      annual: 250  // 2 months free
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
      annual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL || ''
    },
    limits: {
      invoices: 'unlimited',
      quotes: 'unlimited',
      expenses: 'unlimited',
      clients: 'unlimited',
      templates: 'unlimited'
    },
    features: {
      emailAutomation: true,
      reminders: true,
      ocr: true,
      eSignature: true,
      advancedAnalytics: true,
      csvExport: true,
      multiUser: true,
      apiAccess: true
    }
  }
}

// Helper functions
export const getPlan = (planName: PlanName): Plan => {
  return PLANS[planName]
}

export const getAllPlans = (): Plan[] => {
  return Object.values(PLANS)
}

export const hasFeature = (planName: PlanName, feature: keyof PlanFeatures): boolean => {
  return PLANS[planName].features[feature]
}

export const getLimit = (planName: PlanName, resource: keyof PlanLimits): number | 'unlimited' => {
  return PLANS[planName].limits[resource]
}
```

---

## Access Control & Usage Tracking

### checkAccess.ts

```typescript
import { User } from '@/models/User'
import { getPlan, hasFeature as planHasFeature } from './plans'

/**
 * Check if user has access to a specific feature
 */
export const checkFeatureAccess = async (
  userId: string,
  feature: keyof PlanFeatures
): Promise<boolean> => {
  const user = await User.findById(userId)
  if (!user) return false

  const plan = getPlan(user.subscriptionPlan)
  return plan.features[feature]
}

/**
 * Check if user can create another invoice (usage limit)
 */
export const checkInvoiceLimit = async (userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number | 'unlimited'
  message?: string
}> => {
  const user = await User.findById(userId)
  if (!user) {
    return { allowed: false, current: 0, limit: 0, message: 'User not found' }
  }

  const plan = getPlan(user.subscriptionPlan)
  const limit = plan.limits.invoices

  // Unlimited plans always allow
  if (limit === 'unlimited') {
    return { allowed: true, current: user.usageStats.invoices.current, limit: 'unlimited' }
  }

  // Check usage vs limit
  const current = user.usageStats.invoices.current
  const allowed = current < limit

  return {
    allowed,
    current,
    limit,
    message: allowed ? undefined : `Monthly invoice limit reached (${limit})`
  }
}

/**
 * Check quote creation limit
 */
export const checkQuoteLimit = async (userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number | 'unlimited'
  message?: string
}> => {
  const user = await User.findById(userId)
  if (!user) {
    return { allowed: false, current: 0, limit: 0, message: 'User not found' }
  }

  const plan = getPlan(user.subscriptionPlan)
  const limit = plan.limits.quotes

  if (limit === 'unlimited') {
    return { allowed: true, current: user.usageStats.quotes.current, limit: 'unlimited' }
  }

  const current = user.usageStats.quotes.current
  const allowed = current < limit

  return {
    allowed,
    current,
    limit,
    message: allowed ? undefined : `Monthly quote limit reached (${limit})`
  }
}

/**
 * Check expense creation limit
 */
export const checkExpenseLimit = async (userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number | 'unlimited'
  message?: string
}> => {
  const user = await User.findById(userId)
  if (!user) {
    return { allowed: false, current: 0, limit: 0, message: 'User not found' }
  }

  const plan = getPlan(user.subscriptionPlan)
  const limit = plan.limits.expenses

  if (limit === 'unlimited') {
    return { allowed: true, current: user.usageStats.expenses.current, limit: 'unlimited' }
  }

  const current = user.usageStats.expenses.current
  const allowed = current < limit

  return {
    allowed,
    current,
    limit,
    message: allowed ? undefined : `Monthly expense limit reached (${limit})`
  }
}

/**
 * Check client creation limit
 */
export const checkClientLimit = async (userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number | 'unlimited'
  message?: string
}> => {
  const user = await User.findById(userId)
  if (!user) {
    return { allowed: false, current: 0, limit: 0, message: 'User not found' }
  }

  const plan = getPlan(user.subscriptionPlan)
  const limit = plan.limits.clients

  if (limit === 'unlimited') {
    return { allowed: true, current: user.usageStats.clients.current, limit: 'unlimited' }
  }

  const current = user.usageStats.clients.current
  const allowed = current < limit

  return {
    allowed,
    current,
    limit,
    message: allowed ? undefined : `Client limit reached (${limit})`
  }
}

/**
 * Increment invoice usage counter
 */
export const incrementInvoiceUsage = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  // Check if month has changed (reset usage)
  const now = new Date()
  const lastReset = user.usageStats.invoices.lastReset
  const shouldReset = !lastReset ||
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getFullYear() !== now.getFullYear()

  if (shouldReset) {
    user.usageStats.invoices.current = 1
    user.usageStats.invoices.lastReset = now
  } else {
    user.usageStats.invoices.current += 1
  }

  await user.save()
}

/**
 * Decrement invoice usage counter (on deletion)
 */
export const decrementInvoiceUsage = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  if (user.usageStats.invoices.current > 0) {
    user.usageStats.invoices.current -= 1
    await user.save()
  }
}

/**
 * Increment quote usage
 */
export const incrementQuoteUsage = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  const now = new Date()
  const lastReset = user.usageStats.quotes.lastReset
  const shouldReset = !lastReset ||
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getFullYear() !== now.getFullYear()

  if (shouldReset) {
    user.usageStats.quotes.current = 1
    user.usageStats.quotes.lastReset = now
  } else {
    user.usageStats.quotes.current += 1
  }

  await user.save()
}

/**
 * Decrement quote usage
 */
export const decrementQuoteUsage = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  if (user.usageStats.quotes.current > 0) {
    user.usageStats.quotes.current -= 1
    await user.save()
  }
}

/**
 * Increment expense usage
 */
export const incrementExpenseUsage = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  const now = new Date()
  const lastReset = user.usageStats.expenses.lastReset
  const shouldReset = !lastReset ||
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getFullYear() !== now.getFullYear()

  if (shouldReset) {
    user.usageStats.expenses.current = 1
    user.usageStats.expenses.lastReset = now
  } else {
    user.usageStats.expenses.current += 1
  }

  await user.save()
}

/**
 * Decrement expense usage
 */
export const decrementExpenseUsage = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  if (user.usageStats.expenses.current > 0) {
    user.usageStats.expenses.current -= 1
    await user.save()
  }
}

/**
 * Increment client usage
 */
export const incrementClientUsage = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  user.usageStats.clients.current += 1
  await user.save()
}

/**
 * Decrement client usage
 */
export const decrementClientUsage = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  if (user.usageStats.clients.current > 0) {
    user.usageStats.clients.current -= 1
    await user.save()
  }
}

/**
 * Get current usage stats for user
 */
export const getUsageStats = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user) return null

  const plan = getPlan(user.subscriptionPlan)

  return {
    plan: user.subscriptionPlan,
    invoices: {
      current: user.usageStats.invoices.current,
      limit: plan.limits.invoices,
      percentage: plan.limits.invoices === 'unlimited'
        ? 0
        : (user.usageStats.invoices.current / plan.limits.invoices) * 100
    },
    quotes: {
      current: user.usageStats.quotes.current,
      limit: plan.limits.quotes,
      percentage: plan.limits.quotes === 'unlimited'
        ? 0
        : (user.usageStats.quotes.current / plan.limits.quotes) * 100
    },
    expenses: {
      current: user.usageStats.expenses.current,
      limit: plan.limits.expenses,
      percentage: plan.limits.expenses === 'unlimited'
        ? 0
        : (user.usageStats.expenses.current / plan.limits.expenses) * 100
    },
    clients: {
      current: user.usageStats.clients.current,
      limit: plan.limits.clients,
      percentage: plan.limits.clients === 'unlimited'
        ? 0
        : (user.usageStats.clients.current / plan.limits.clients) * 100
    }
  }
}

/**
 * Reset all usage stats (for new month or manual reset)
 */
export const resetUsageStats = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) return

  const now = new Date()

  user.usageStats = {
    invoices: { current: 0, lastReset: now },
    quotes: { current: 0, lastReset: now },
    expenses: { current: 0, lastReset: now },
    clients: { current: 0, lastReset: now }
  }

  await user.save()
}
```

---

## Stripe Integration

### stripe.ts

```typescript
import Stripe from 'stripe'

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true
})

/**
 * Create or retrieve Stripe customer for user
 */
export const getOrCreateStripeCustomer = async (user: IUser): Promise<string> => {
  // Return existing customer ID if available
  if (user.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    metadata: {
      userId: user._id.toString()
    }
  })

  // Save customer ID to user
  user.stripeCustomerId = customer.id
  await user.save()

  return customer.id
}

/**
 * Create Stripe checkout session for subscription
 */
export const createCheckoutSession = async (
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> => {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')

  const customerId = await getOrCreateStripeCustomer(user)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user._id.toString()
    }
  })

  return session
}

/**
 * Create Stripe billing portal session
 */
export const createPortalSession = async (
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  })

  return session
}

/**
 * Cancel subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

/**
 * Get subscription details
 */
export const getSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return subscription
}

/**
 * Update subscription plan
 */
export const updateSubscription = async (
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId
      }
    ],
    proration_behavior: 'create_prorations'
  })

  return updatedSubscription
}
```

---

## Workflow Examples

### 1. Creating Invoice (with limit check)

```typescript
// API route: POST /api/invoices
export async function POST(req: Request) {
  const session = await auth()
  const userId = session.user.id

  // Check invoice limit
  const limitCheck = await checkInvoiceLimit(userId)
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: limitCheck.message },
      { status: 403 }
    )
  }

  // Create invoice
  const invoice = await Invoice.create({
    userId,
    ...invoiceData
  })

  // Increment usage counter
  await incrementInvoiceUsage(userId)

  return NextResponse.json(invoice)
}
```

---

### 2. Feature Access Check

```typescript
// API route: POST /api/email/send-invoice
export async function POST(req: Request) {
  const session = await auth()
  const userId = session.user.id

  // Check if user has email automation feature
  const hasAccess = await checkFeatureAccess(userId, 'emailAutomation')
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Email automation requires Pro plan or higher' },
      { status: 403 }
    )
  }

  // Send email
  await sendInvoiceEmail(invoiceId, recipientEmail)

  return NextResponse.json({ success: true })
}
```

---

### 3. Upgrading to Pro Plan

```typescript
// API route: POST /api/subscription/create-checkout
export async function POST(req: Request) {
  const session = await auth()
  const userId = session.user.id
  const { planName, billingPeriod } = await req.json()

  // Get price ID
  const plan = getPlan(planName as PlanName)
  const priceId = billingPeriod === 'monthly'
    ? plan.stripePriceIds.monthly
    : plan.stripePriceIds.annual

  // Create checkout session
  const checkoutSession = await createCheckoutSession(
    userId,
    priceId,
    `${process.env.NEXT_PUBLIC_URL}/dashboard?upgrade=success`,
    `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?upgrade=cancelled`
  )

  return NextResponse.json({
    sessionId: checkoutSession.id,
    url: checkoutSession.url
  })
}
```

---

### 4. Stripe Webhook Handling

```typescript
// API route: POST /api/subscription/webhook
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutComplete(session)
      break

    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdate(subscription)
      break

    case 'customer.subscription.deleted':
      const canceledSub = event.data.object as Stripe.Subscription
      await handleSubscriptionCanceled(canceledSub)
      break

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentSucceeded(invoice)
      break

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(failedInvoice)
      break
  }

  return NextResponse.json({ received: true })
}

// Handle successful checkout
const handleCheckoutComplete = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId
  if (!userId) return

  const user = await User.findById(userId)
  if (!user) return

  // Extract plan from price ID
  const priceId = session.line_items?.data[0]?.price?.id
  let planName: PlanName = 'free'

  if (priceId === PLANS.pro.stripePriceIds.monthly || priceId === PLANS.pro.stripePriceIds.annual) {
    planName = 'pro'
  } else if (priceId === PLANS.business.stripePriceIds.monthly || priceId === PLANS.business.stripePriceIds.annual) {
    planName = 'business'
  }

  // Update user subscription
  user.subscriptionPlan = planName
  user.subscriptionStatus = 'active'
  user.stripeSubscriptionId = session.subscription as string
  user.subscriptionStartDate = new Date()

  await user.save()
}

// Handle subscription update
const handleSubscriptionUpdate = async (subscription: Stripe.Subscription) => {
  const user = await User.findOne({ stripeSubscriptionId: subscription.id })
  if (!user) return

  // Update status
  user.subscriptionStatus = subscription.status as any
  user.subscriptionEndDate = new Date(subscription.current_period_end * 1000)

  await user.save()
}

// Handle subscription canceled
const handleSubscriptionCanceled = async (subscription: Stripe.Subscription) => {
  const user = await User.findOne({ stripeSubscriptionId: subscription.id })
  if (!user) return

  // Downgrade to free
  user.subscriptionPlan = 'free'
  user.subscriptionStatus = 'canceled'
  user.subscriptionEndDate = new Date()

  await user.save()
}
```

---

## UI Components

### PlanSelector.tsx

```tsx
import { PLANS } from '@/lib/subscription/plans'

export const PlanSelector: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanName>('pro')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual')

  const handleUpgrade = async () => {
    const response = await fetch('/api/subscription/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName: selectedPlan, billingPeriod })
    })

    const { url } = await response.json()
    window.location.href = url
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Object.values(PLANS).map(plan => (
        <div
          key={plan.name}
          className={cn(
            'border-2 rounded-lg p-6',
            selectedPlan === plan.name ? 'border-primary' : 'border-gray-200'
          )}
        >
          <h3 className="text-2xl font-bold">{plan.displayName}</h3>
          <p className="text-gray-600">{plan.description}</p>

          <div className="my-4">
            <span className="text-4xl font-bold">
              €{billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual}
            </span>
            <span className="text-gray-600">
              /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>

          <ul className="space-y-2 mb-6">
            <li>✓ {plan.limits.invoices} invoices/month</li>
            <li>✓ {plan.limits.quotes} quotes/month</li>
            <li>✓ {plan.limits.clients} clients</li>
            {plan.features.emailAutomation && <li>✓ Email automation</li>}
            {plan.features.ocr && <li>✓ OCR scanning</li>}
          </ul>

          <Button
            onClick={() => {
              setSelectedPlan(plan.name)
              if (plan.name !== 'free') handleUpgrade()
            }}
            disabled={plan.name === 'free'}
          >
            {plan.name === 'free' ? 'Current Plan' : 'Upgrade'}
          </Button>
        </div>
      ))}
    </div>
  )
}
```

---

### UsageIndicator.tsx

```tsx
export const UsageIndicator: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: usage } = useQuery({
    queryKey: ['usage', userId],
    queryFn: () => fetch('/api/subscription/usage').then(r => r.json())
  })

  if (!usage) return null

  return (
    <div className="space-y-4">
      <UsageBar
        label="Invoices"
        current={usage.invoices.current}
        limit={usage.invoices.limit}
      />
      <UsageBar
        label="Quotes"
        current={usage.quotes.current}
        limit={usage.quotes.limit}
      />
      <UsageBar
        label="Expenses"
        current={usage.expenses.current}
        limit={usage.expenses.limit}
      />
    </div>
  )
}

const UsageBar: React.FC<{ label: string, current: number, limit: number | 'unlimited' }> = ({
  label,
  current,
  limit
}) => {
  const percentage = limit === 'unlimited' ? 0 : (current / limit) * 100

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span className="text-sm text-gray-600">
          {current} / {limit === 'unlimited' ? '∞' : limit}
        </span>
      </div>
      {limit !== 'unlimited' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full',
              percentage < 80 ? 'bg-green-500' : percentage < 100 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
```

---

## Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_ANNUAL=price_...
```

---

## Testing

### Mock Usage Check
```typescript
describe('Subscription Limits', () => {
  it('should block invoice creation when limit reached', async () => {
    const user = await User.create({
      email: 'test@example.com',
      subscriptionPlan: 'free',
      usageStats: {
        invoices: { current: 5, lastReset: new Date() }
      }
    })

    const check = await checkInvoiceLimit(user._id)
    expect(check.allowed).toBe(false)
    expect(check.message).toContain('limit reached')
  })

  it('should allow invoice creation for Pro plan', async () => {
    const user = await User.create({
      email: 'test@example.com',
      subscriptionPlan: 'pro',
      usageStats: {
        invoices: { current: 10, lastReset: new Date() }
      }
    })

    const check = await checkInvoiceLimit(user._id)
    expect(check.allowed).toBe(true)
  })
})
```

---

## Future Enhancements

1. **Usage Alerts** - Email notifications at 80% and 100% usage
2. **Team Plans** - Multi-user support with role-based access
3. **Metered Billing** - Pay-per-use overage charges
4. **Trials** - 14-day free trial for Pro/Business
5. **Discounts** - Coupon codes and promotional pricing
6. **Annual Discounts** - Dynamic discount calculations
7. **Custom Plans** - Enterprise custom pricing
8. **Add-ons** - Optional features (extra storage, API calls)
9. **Usage Analytics** - Detailed usage dashboards
10. **Plan Recommendations** - Suggest upgrades based on usage patterns
