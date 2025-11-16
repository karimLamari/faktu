# Architecture Stripe - Organisation Complète

## 📁 Structure Actuelle (Nettoyée)

```
src/
├── app/api/
│   ├── webhook/                    ⭐ WEBHOOK PRINCIPAL
│   │   └── route.ts               # Point d'entrée unique pour Stripe
│   │
│   ├── subscription/              ⭐ GESTION ABONNEMENTS
│   │   ├── create-checkout/      # Créer session checkout
│   │   ├── cancel/               # Annuler abonnement
│   │   ├── portal/               # Portail client Stripe
│   │   └── usage/                # Stats d'utilisation
│   │
│   └── stripe/                    ⭐ FUTURE: STRIPE CONNECT
│       └── README.md             # Documentation
│
└── lib/
    └── subscription/
        ├── stripe.ts             # Client Stripe + helpers
        ├── plans.ts              # Définition des plans
        └── checkAccess.ts        # Feature gating
```

## 🔄 Flux de Paiement Actuel

### 1. Checkout Flow
```
User clique "Upgrade"
    ↓
POST /api/subscription/create-checkout
    ↓
Création session Stripe
    ↓
Redirection vers Stripe Checkout
    ↓
User paie
    ↓
Stripe envoie webhook → POST /api/webhook
    ↓
DB mise à jour (plan + status)
    ↓
Redirection vers /dashboard/billing?success=true
```

### 2. Webhook Events Gérés

| Événement | Action | Handler |
|-----------|--------|---------|
| `checkout.session.completed` | Activer abonnement | `handleCheckoutCompleted()` |
| `customer.subscription.updated` | Mettre à jour plan/statut | `handleSubscriptionUpdated()` |
| `customer.subscription.deleted` | Retour au plan gratuit | `handleSubscriptionDeleted()` |
| `invoice.paid` | Confirmer paiement | `handleInvoicePaid()` |
| `invoice.payment_succeeded` | Confirmer paiement | `handleInvoicePaid()` |
| `invoice.payment_failed` | Marquer en retard | `handleInvoicePaymentFailed()` |

## 🧹 Nettoyage Effectué

### ❌ Supprimé (Doublons)
- `/api/subscription/webhook/` - Doublon du webhook principal
- `/api/webhooks/stripe/` - Doublon du webhook principal
- `/api/stripe/webhook/` - Dossier vide
- `/api/stripe/create-payment-link/` - Dossier vide

### ✅ Conservé
- `/api/webhook/` - **Point d'entrée unique** pour tous les webhooks Stripe
- `/api/subscription/*` - Routes de gestion des abonnements
- `/lib/subscription/stripe.ts` - Client Stripe centralisé

## 🎯 Configuration Stripe Dashboard

### Webhook Configuration
```
URL: https://blink.quxly.fr/api/webhook
Events:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.paid
  - invoice.payment_succeeded
  - invoice.payment_failed
```

### Environment Variables
```env
# Standard Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_ANNUAL=price_...
```

## 🚀 Stripe Connect - Architecture Future

### Modèle Recommandé: Standard Connect

```
Platform (Votre App)
    ↓
Connected Accounts (Vos Utilisateurs)
    ↓
End Customers (Clients de vos utilisateurs)
```

### Flux de Paiement avec Connect

```
Client final paie une facture
    ↓
Paiement va sur Connected Account (utilisateur)
    ↓
Platform Fee (10%) prélevée automatiquement
    ↓
Utilisateur reçoit 90%
    ↓
Webhook notifie platform et connected account
```

### Routes à Créer pour Stripe Connect

```
/api/stripe/connect/
├── onboard/
│   └── route.ts              # Créer lien d'onboarding
│
├── accounts/
│   ├── route.ts              # Liste des comptes connectés
│   └── [id]/
│       ├── route.ts          # Détails du compte
│       └── dashboard/
│           └── route.ts      # Lien vers dashboard Stripe
│
├── transfers/
│   └── create/
│       └── route.ts          # Transfert vers compte connecté
│
└── payouts/
    └── route.ts              # Liste des payouts
```

### Schema User (Modifications pour Connect)

```typescript
interface IUser {
  // ... existing fields

  // Stripe Connect
  stripeConnectedAccountId?: string
  stripeAccountType?: 'standard' | 'express' | 'custom'
  stripeOnboardingComplete?: boolean
  stripeChargesEnabled?: boolean
  stripePayoutsEnabled?: boolean
  platformFeePercent?: number  // Default: 10
}
```

## 📊 Comparaison des Modèles

### Option 1: Standard Stripe (Actuel) ✅
**Avantages:**
- Simple à mettre en place
- Un seul compte Stripe (le vôtre)
- Contrôle total sur les fonds

**Inconvénients:**
- Vous gérez tous les paiements
- Responsabilité légale complète
- Besoin de reverser aux utilisateurs manuellement

### Option 2: Stripe Connect (Future)
**Avantages:**
- Chaque utilisateur a son propre compte Stripe
- Paiements directs aux utilisateurs
- Commission automatique (platform fee)
- Moins de responsabilité légale
- Évolutif pour marketplace

**Inconvénients:**
- Plus complexe à mettre en place
- Nécessite onboarding utilisateurs
- Frais Stripe légèrement plus élevés

## 🎯 Plan d'Implémentation Stripe Connect

### Phase 1: Setup ✅ FAIT
- [x] Nettoyer structure actuelle
- [x] Organiser routes Stripe
- [x] Documentation

### Phase 2: Connect Infrastructure (1-2 jours)
- [ ] Activer Stripe Connect dans Dashboard
- [ ] Créer modèle de données Connect
- [ ] Implémenter onboarding flow
- [ ] Créer route `/api/stripe/connect/onboard`

### Phase 3: Payment Splitting (2-3 jours)
- [ ] Modifier création de factures pour Connect
- [ ] Implémenter Application Fees
- [ ] Gérer les transferts
- [ ] Tester les payouts

### Phase 4: Dashboard & Monitoring (1 jour)
- [ ] Interface de gestion des comptes connectés
- [ ] Statistiques de commissions
- [ ] Logs de transferts
- [ ] Webhooks Connect

## 🔐 Sécurité

### Webhook Signature Verification ✅
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);
```

### Connected Account Ownership
```typescript
// Vérifier que l'utilisateur possède le compte connecté
const user = await User.findOne({
  _id: userId,
  stripeConnectedAccountId: accountId
});
```

### Platform Fee Validation
```typescript
// Limiter les fees à un maximum
const maxFee = 20; // 20%
const fee = Math.min(platformFeePercent, maxFee);
```

## 📈 Métriques à Suivre

### Actuellement
- Nombre d'abonnements actifs
- MRR (Monthly Recurring Revenue)
- Churn rate
- Revenus par plan

### Avec Stripe Connect
- Nombre de comptes connectés
- Volume de transactions
- Revenus de platform fees
- Taux de completion onboarding

## 🛠️ Outils de Test

### Stripe CLI (Webhook Testing)
```bash
# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhook

# Test specific event
stripe trigger checkout.session.completed
stripe trigger account.updated  # Pour Connect
```

### Test Cards
```
# Success
4242 4242 4242 4242

# Requires authentication
4000 0025 0000 3155

# Declined
4000 0000 0000 9995
```

## 📞 Support

### Issues Connus
- ✅ Webhook 404 → **RÉSOLU** via `/api/webhook`
- ✅ Doublons de routes → **NETTOYÉ**

### Prochaines Étapes
1. Tester le webhook en production
2. Vérifier les logs Stripe Dashboard
3. Décider du modèle Connect à implémenter
4. Préparer l'onboarding Connect

---

**Dernière mise à jour**: ${new Date().toISOString().split('T')[0]}
**Statut**: ✅ Structure nettoyée et prête pour Stripe Connect
