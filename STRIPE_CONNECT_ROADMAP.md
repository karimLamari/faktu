# 🚀 Roadmap Stripe Connect - Plan d'Implémentation Détaillé

## 📋 Vue d'Ensemble

**Objectif**: Permettre aux utilisateurs de recevoir des paiements directement sur leur compte Stripe via Connect, avec prélèvement automatique d'une commission plateforme.

**Durée Estimée**: 2-3 jours de développement

**Type de Connect**: Standard Accounts (recommandé)

---

## 📅 Planning par Phase

### Phase 1: Configuration Stripe Connect (30 min)
**Status**: ⏳ À faire

#### Actions:
1. **Activer Stripe Connect**
   - [ ] Aller sur https://dashboard.stripe.com/settings/connect
   - [ ] Cliquer sur "Get started with Connect"
   - [ ] Choisir "Standard" comme type de compte
   - [ ] Accepter les termes et conditions

2. **Configurer les URLs de redirection**
   - [ ] Redirect URI: `https://blink.quxly.fr/dashboard/connect/callback`
   - [ ] Refresh URL: `https://blink.quxly.fr/dashboard/connect/refresh`
   - [ ] Return URL: `https://blink.quxly.fr/dashboard/connect/complete`

3. **Récupérer le Client ID**
   - [ ] Copier le `STRIPE_CONNECT_CLIENT_ID` (ca_...)
   - [ ] L'ajouter dans `.env` et `.env.production`

4. **Ajouter les variables d'environnement**
   ```env
   # Stripe Connect
   STRIPE_CONNECT_CLIENT_ID=ca_...
   STRIPE_PLATFORM_FEE_PERCENT=10
   NEXT_PUBLIC_APP_URL=https://blink.quxly.fr
   ```

#### Livrable:
- ✅ Stripe Connect activé
- ✅ Client ID récupéré
- ✅ Variables d'env configurées

---

### Phase 2: Mise à jour du Modèle User (30 min)
**Status**: ⏳ À faire

#### Actions:

**Fichier**: `src/models/User.ts`

1. **Ajouter les champs Stripe Connect**
   ```typescript
   // Stripe Connect
   stripeConnectedAccountId?: string;
   stripeAccountType?: 'standard' | 'express' | 'custom';
   stripeOnboardingComplete?: boolean;
   stripeChargesEnabled?: boolean;
   stripePayoutsEnabled?: boolean;
   stripeDetailsSubmitted?: boolean;
   platformFeePercent?: number;

   connectedAccountDetails?: {
     businessName?: string;
     country?: string;
     currency?: string;
     email?: string;
   };

   // Timestamps
   stripeConnectedAt?: Date;
   stripeLastSyncedAt?: Date;
   ```

2. **Ajouter les index**
   ```typescript
   UserSchema.index({ stripeConnectedAccountId: 1 });
   ```

3. **Méthodes helper**
   ```typescript
   UserSchema.methods.isConnectEnabled = function(): boolean {
     return !!(
       this.stripeConnectedAccountId &&
       this.stripeOnboardingComplete &&
       this.stripeChargesEnabled
     );
   };

   UserSchema.methods.canReceivePayouts = function(): boolean {
     return !!(
       this.isConnectEnabled() &&
       this.stripePayoutsEnabled
     );
   };
   ```

#### Livrable:
- ✅ Modèle User mis à jour
- ✅ Migration créée (si nécessaire)

---

### Phase 3: Routes API - Onboarding (1h)
**Status**: ⏳ À faire

#### Route 1: `/api/stripe/connect/onboard/route.ts`

**Créer le fichier**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { stripe } from '@/lib/subscription/stripe';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Créer ou récupérer le compte connecté
    let accountId = user.stripeConnectedAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });

      user.stripeConnectedAccountId = account.id;
      user.stripeAccountType = 'standard';
      user.stripeConnectedAt = new Date();
      user.platformFeePercent = parseInt(process.env.STRIPE_PLATFORM_FEE_PERCENT || '10');
      await user.save();

      accountId = account.id;
    }

    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connect/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connect/complete`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Connect onboarding error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### Route 2: `/api/stripe/connect/refresh/route.ts`

```typescript
// Même logique que onboard pour regénérer le lien
export async function GET(req: NextRequest) {
  // Rediriger vers la même logique d'onboarding
  return POST(req);
}
```

#### Livrable:
- ✅ Route onboarding créée
- ✅ Création automatique compte Connect
- ✅ Liens de redirection configurés

---

### Phase 4: Routes API - Account Management (1h)
**Status**: ⏳ À faire

#### Route 3: `/api/stripe/connect/dashboard/route.ts`

**Générer un lien vers le dashboard Stripe**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { stripe } from '@/lib/subscription/stripe';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    if (!user?.stripeConnectedAccountId) {
      return NextResponse.json(
        { error: 'No connected account found' },
        { status: 400 }
      );
    }

    const loginLink = await stripe.accounts.createLoginLink(
      user.stripeConnectedAccountId
    );

    return NextResponse.json({ url: loginLink.url });
  } catch (error: any) {
    console.error('Dashboard link error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### Route 4: `/api/stripe/connect/account/route.ts`

**Récupérer les détails du compte**:
```typescript
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    if (!user?.stripeConnectedAccountId) {
      return NextResponse.json({ connected: false });
    }

    const account = await stripe.accounts.retrieve(
      user.stripeConnectedAccountId
    );

    // Mettre à jour le statut local
    user.stripeChargesEnabled = account.charges_enabled;
    user.stripePayoutsEnabled = account.payouts_enabled;
    user.stripeDetailsSubmitted = account.details_submitted;
    user.stripeOnboardingComplete = account.details_submitted;
    user.stripeLastSyncedAt = new Date();

    if (account.business_profile) {
      user.connectedAccountDetails = {
        businessName: account.business_profile.name || undefined,
        country: account.country || undefined,
        currency: account.default_currency || undefined,
        email: account.email || undefined,
      };
    }

    await user.save();

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
      country: account.country,
      currency: account.default_currency,
      businessName: account.business_profile?.name,
    });
  } catch (error: any) {
    console.error('Account fetch error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### Route 5: `/api/stripe/connect/disconnect/route.ts`

**Déconnecter le compte**:
```typescript
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    if (!user?.stripeConnectedAccountId) {
      return NextResponse.json(
        { error: 'No connected account' },
        { status: 400 }
      );
    }

    // Note: Ne pas supprimer le compte Stripe, juste déconnecter
    user.stripeConnectedAccountId = undefined;
    user.stripeOnboardingComplete = false;
    user.stripeChargesEnabled = false;
    user.stripePayoutsEnabled = false;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### Livrable:
- ✅ Route dashboard créée
- ✅ Route account status créée
- ✅ Route disconnect créée

---

### Phase 5: Webhooks Connect (1h)
**Status**: ⏳ À faire

#### Mettre à jour `/api/webhook/route.ts`

**Ajouter les handlers**:

```typescript
// Dans le switch statement existant, ajouter:

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

case 'transfer.created': {
  const transfer = event.data.object as Stripe.Transfer;
  await handleTransferCreated(transfer);
  break;
}

// Ajouter ces fonctions à la fin du fichier:

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    const user = await User.findOne({
      stripeConnectedAccountId: account.id
    });

    if (!user) {
      console.error('User not found for account:', account.id);
      return;
    }

    user.stripeChargesEnabled = account.charges_enabled;
    user.stripePayoutsEnabled = account.payouts_enabled;
    user.stripeDetailsSubmitted = account.details_submitted;
    user.stripeOnboardingComplete = account.details_submitted;
    user.stripeLastSyncedAt = new Date();

    if (account.business_profile) {
      user.connectedAccountDetails = {
        businessName: account.business_profile.name || undefined,
        country: account.country || undefined,
        currency: account.default_currency || undefined,
        email: account.email || undefined,
      };
    }

    await user.save();

    console.log(`✅ Account updated for user ${user._id}`);
  } catch (error: any) {
    console.error('❌ Error handleAccountUpdated:', error);
  }
}

async function handleAccountDeauthorized(account: Stripe.Account) {
  try {
    const user = await User.findOne({
      stripeConnectedAccountId: account.id
    });

    if (!user) return;

    user.stripeConnectedAccountId = undefined;
    user.stripeOnboardingComplete = false;
    user.stripeChargesEnabled = false;
    user.stripePayoutsEnabled = false;
    await user.save();

    console.log(`⚠️ Account deauthorized for user ${user._id}`);
  } catch (error: any) {
    console.error('❌ Error handleAccountDeauthorized:', error);
  }
}

async function handlePayoutPaid(payout: Stripe.Payout) {
  // TODO: Log payout pour analytics
  console.log(`✅ Payout paid: ${payout.id} - ${payout.amount / 100} ${payout.currency}`);
}

async function handlePayoutFailed(payout: Stripe.Payout) {
  // TODO: Notifier l'utilisateur
  console.log(`❌ Payout failed: ${payout.id}`);
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  // TODO: Log transfer pour analytics
  console.log(`💸 Transfer created: ${transfer.id} - ${transfer.amount / 100} ${transfer.currency}`);
}
```

#### Configurer les événements dans Stripe Dashboard

**Ajouter ces événements au webhook**:
- `account.updated`
- `account.application.deauthorized`
- `payout.paid`
- `payout.failed`
- `transfer.created`

#### Livrable:
- ✅ Webhooks Connect implémentés
- ✅ Synchronisation automatique statut compte
- ✅ Événements configurés dans Stripe

---

### Phase 6: UI Components Connect (2h)
**Status**: ⏳ À faire

#### Composant 1: `src/components/stripe/ConnectButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const ConnectStripeButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to create onboarding link');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleConnect} disabled={loading} size="lg">
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Connecter mon compte Stripe
    </Button>
  );
};
```

#### Composant 2: `src/components/stripe/ConnectStatus.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { ConnectStripeButton } from './ConnectButton';

interface AccountStatus {
  connected: boolean;
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  requirements?: any;
  businessName?: string;
  country?: string;
  currency?: string;
}

export const ConnectStatus: React.FC = () => {
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/stripe/connect/account');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openDashboard = async () => {
    try {
      const res = await fetch('/api/stripe/connect/dashboard', {
        method: 'POST',
      });
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!status?.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compte Stripe Connect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connectez votre compte Stripe pour recevoir des paiements directement
            de vos clients.
          </p>
          <ConnectStripeButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Compte Stripe Connect
          <Badge variant={status.detailsSubmitted ? 'default' : 'secondary'}>
            {status.detailsSubmitted ? 'Activé' : 'En attente'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            {status.chargesEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>Paiements activés</span>
          </div>

          <div className="flex items-center space-x-2">
            {status.payoutsEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>Virements activés</span>
          </div>
        </div>

        {status.businessName && (
          <div>
            <p className="text-sm text-muted-foreground">Entreprise</p>
            <p className="font-medium">{status.businessName}</p>
          </div>
        )}

        {status.country && (
          <div>
            <p className="text-sm text-muted-foreground">Pays</p>
            <p className="font-medium">{status.country.toUpperCase()}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={openDashboard} variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Dashboard Stripe
          </Button>

          {!status.detailsSubmitted && (
            <Button onClick={() => window.location.href = '/api/stripe/connect/onboard'}>
              Terminer l'onboarding
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

#### Page 3: `src/app/dashboard/connect/page.tsx`

```typescript
import { ConnectStatus } from '@/components/stripe/ConnectStatus';

export default function ConnectPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Stripe Connect</h1>
      <ConnectStatus />
    </div>
  );
}
```

#### Page 4: `src/app/dashboard/connect/complete/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ConnectCompletePage() {
  const router = useRouter();

  useEffect(() => {
    // Refresh account status
    fetch('/api/stripe/connect/account').then(() => {
      setTimeout(() => {
        router.push('/dashboard/connect');
      }, 2000);
    });
  }, [router]);

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Connexion réussie !</h1>
          <p className="text-muted-foreground">
            Votre compte Stripe est maintenant connecté.
            Redirection en cours...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Livrable:
- ✅ Composants UI créés
- ✅ Pages Connect créées
- ✅ Flow utilisateur complet

---

### Phase 7: Payment Flow avec Fees (2h)
**Status**: ⏳ À faire

#### Option A: Application Fee (Recommandé)

**Modifier la création de factures pour utiliser Connect**

Créer: `src/lib/stripe/createConnectPayment.ts`

```typescript
import { stripe } from '@/lib/subscription/stripe';
import type { Invoice, User } from '@/types';

export async function createConnectPaymentIntent(
  invoice: Invoice,
  user: User
) {
  if (!user.stripeConnectedAccountId) {
    throw new Error('User has no connected account');
  }

  if (!user.isConnectEnabled?.()) {
    throw new Error('Connected account is not enabled for charges');
  }

  const platformFeePercent = user.platformFeePercent || 10;
  const totalAmount = Math.round(invoice.total * 100); // En centimes
  const applicationFeeAmount = Math.round(totalAmount * (platformFeePercent / 100));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: user.currency?.toLowerCase() || 'eur',
    application_fee_amount: applicationFeeAmount,
    transfer_data: {
      destination: user.stripeConnectedAccountId,
    },
    metadata: {
      invoiceId: invoice._id.toString(),
      userId: user._id.toString(),
      platformFee: applicationFeePercent.toString(),
    },
    description: `Facture ${invoice.invoiceNumber}`,
  });

  return paymentIntent;
}
```

#### Route de paiement: `/api/invoices/[id]/pay/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { createConnectPaymentIntent } from '@/lib/stripe/createConnectPayment';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await Invoice.findById(params.id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const user = await User.findById(invoice.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Créer le payment intent avec Connect
    const paymentIntent = await createConnectPaymentIntent(invoice, user);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### Livrable:
- ✅ Logic de paiement avec fees
- ✅ Route de création payment intent
- ✅ Commission automatique

---

### Phase 8: Tests et Validation (1h)
**Status**: ⏳ À faire

#### Checklist de Tests

**Tests Onboarding**:
- [ ] Créer un compte Connect via l'UI
- [ ] Compléter l'onboarding Stripe
- [ ] Vérifier que le statut se met à jour
- [ ] Tester le lien vers dashboard Stripe

**Tests Webhooks**:
- [ ] Test `account.updated` en local avec Stripe CLI
- [ ] Test `account.application.deauthorized`
- [ ] Vérifier la synchronisation DB

**Tests Paiement**:
- [ ] Créer une facture avec Connect
- [ ] Effectuer un paiement test
- [ ] Vérifier la répartition des fonds
- [ ] Confirmer la commission plateforme

**Commandes Stripe CLI**:
```bash
# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/webhook

# Trigger events
stripe trigger account.updated
stripe trigger payout.paid

# Test payment
stripe payment_intents create \
  --amount=10000 \
  --currency=eur \
  --application-fee-amount=1000 \
  --transfer-data[destination]=acct_xxx
```

#### Livrable:
- ✅ Tous les tests passent
- ✅ Documentation mise à jour
- ✅ Prêt pour production

---

## 📊 Résumé des Livrables

| Phase | Fichiers Créés | Durée |
|-------|---------------|-------|
| 1. Config | `.env` modifié | 30min |
| 2. Model | `User.ts` modifié | 30min |
| 3. Onboarding | 2 routes | 1h |
| 4. Management | 3 routes | 1h |
| 5. Webhooks | `webhook/route.ts` modifié | 1h |
| 6. UI | 4 composants + 2 pages | 2h |
| 7. Payment | 2 fichiers | 2h |
| 8. Tests | - | 1h |
| **TOTAL** | **~15 fichiers** | **9h** |

---

## 🎯 Ordre d'Exécution Recommandé

1. **Jour 1 Matin** (3h):
   - Phase 1: Configuration
   - Phase 2: Modèle User
   - Phase 3: Routes Onboarding

2. **Jour 1 Après-midi** (4h):
   - Phase 4: Routes Management
   - Phase 5: Webhooks
   - Phase 6: UI (début)

3. **Jour 2 Matin** (3h):
   - Phase 6: UI (fin)
   - Phase 7: Payment Flow

4. **Jour 2 Après-midi** (2h):
   - Phase 8: Tests
   - Debug et polish
   - Documentation

---

## 🚨 Points d'Attention

### Sécurité
- ⚠️ Toujours vérifier l'ownership du compte Connect
- ⚠️ Valider les signatures webhook
- ⚠️ Limiter les fees à un maximum (ex: 20%)

### Performance
- ⚠️ Cacher les statuts de compte (pas query Stripe à chaque fois)
- ⚠️ Utiliser les webhooks pour sync automatique
- ⚠️ Index MongoDB sur `stripeConnectedAccountId`

### UX
- ⚠️ Messages clairs si onboarding incomplet
- ⚠️ Gérer les erreurs Stripe gracieusement
- ⚠️ Loading states partout

---

## 📞 Support & Resources

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Testing Guide](https://stripe.com/docs/connect/testing)
- [Webhooks Reference](https://stripe.com/docs/api/events)

---

**Prêt à démarrer ?** 🚀

Dis-moi par quelle phase tu veux commencer !
