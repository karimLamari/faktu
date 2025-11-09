# CORRECTIONS URGENTES - PLANS

## PRIORITE 1 - A CORRIGER MAINTENANT (7min total)

### 1. API Signature Electronique (5min)

**Fichier:** src/app/api/quotes/[id]/generate-signature-link/route.ts
**Lignes:** 27-33

REMPLACER:
```typescript
if (!planFeatures.electronicSignature) {
  return NextResponse.json({
    error: 'Fonctionnalite non disponible',
    message: 'La signature electronique est disponible uniquement pour le plan Pro.',
    upgradeUrl: '/dashboard/pricing'
  }, { status: 403 });
}
```

PAR:
```typescript
if (!planFeatures.electronicSignature) {
  return NextResponse.json({
    error: 'Fonctionnalite non disponible',
    message: 'La signature electronique est disponible uniquement pour les plans Pro et Business.',
    featureBlocked: true,
    plan: plan,
    requiredPlan: 'pro',
    upgradeUrl: '/dashboard/pricing'
  }, {
    status: 403,
    headers: {
      'X-Feature-Required': 'electronicSignature',
      'X-Upgrade-Plan': 'pro'
    }
  });
}
```

### 2. Message anglais (2min)

**Fichier:** src/app/api/invoices/route.ts
**Ligne:** 23

REMPLACER:
```typescript
error: 'Invoice limit reached',
```

PAR:
```typescript
error: 'Limite de factures atteinte',
```

## PRIORITE 2 - CETTE SEMAINE (25min total)

### 3. Race condition subscriptionLoading (5min)

**Fichier:** src/components/invoices/InvoiceList.tsx
**Ligne:** 454

REMPLACER:
```typescript
<Button
  onClick={() => setShowExportMenu(!showExportMenu)}
  disabled={isExporting || filteredInvoices.length === 0}
```

PAR:
```typescript
<Button
  onClick={() => setShowExportMenu(!showExportMenu)}
  disabled={isExporting || filteredInvoices.length === 0 || subscriptionLoading}
```

ET ligne 458:
```typescript
{isExporting ? 'Export en cours...' : 'Exporter CSV'}
```

PAR:
```typescript
{subscriptionLoading ? 'Chargement...' : (isExporting ? 'Export en cours...' : 'Exporter CSV')}
```

### 4. ExpenseManagement simplifier (10min)

**Fichier:** src/components/expenses/ExpenseManagement.tsx
**Lignes:** 128-152

REMPLACER toute la logique catch par:
```typescript
} catch (error: any) {
  const errData = error.response?.data;

  if (error.response?.status === 403) {
    // Feature bloquee
    if (errData?.featureBlocked || errData?.error === 'Fonctionnalite non disponible' || errData?.upgradeUrl) {
      showError(errData?.message || 'Fonctionnalite non disponible');
      setShowLimitModal(false);
      setUpgradeFeature(errData?.message || 'Fonctionnalite payante');
      setUpgradeRequiredPlan(errData?.requiredPlan || 'pro');
      setShowUpgradeModal(true);
    }
    // Limite atteinte
    else if (errData?.limitReached) {
      showError(errData?.error || 'Limite de depenses atteinte');
      setShowUpgradeModal(false);
      setLimitModalType('expenses');
      setShowLimitModal(true);
    }
  }
  throw error;
}
```

### 5. InvoiceCard props subscriptionData (10min)

**Fichier:** src/components/invoices/InvoiceCard.tsx

**A. Supprimer lignes 44-50:**
```typescript
subscriptionData?: {
  plan: string;
  usage: {
    invoices: { current: number; limit: number | 'unlimited' };
  };
};
```

**B. Ajouter import ligne 1:**
```typescript
import { useSubscription } from '@/hooks/useSubscription';
```

**C. Remplacer ligne 78:**
```typescript
const userPlan = subscriptionData?.plan || 'free';
```

PAR:
```typescript
const { data: subscriptionData } = useSubscription();
const userPlan = subscriptionData?.plan || 'free';
```

**D. Supprimer prop dans InvoiceList.tsx ligne 518:**
Supprimer toute mention de subscriptionData dans InvoiceCard

## VERIFICATION

Apres corrections:
- [ ] API signature retourne featureBlocked
- [ ] QuoteCard ouvre modal upgrade pour signature
- [ ] Messages tous en francais
- [ ] Bouton CSV desactive pendant loading
- [ ] ExpenseManagement logique simplifiee
- [ ] InvoiceCard utilise useSubscription

## TESTS

Tester apres corrections:
1. User FREE clique signature -> Modal Upgrade s'ouvre
2. User FREE clique export CSV pendant loading -> Bouton desactive
3. User FREE cree expense limite -> Modal LimitReached
4. Verifier console: pas d'erreurs 'Invoice limit reached'

Temps total: 32min
Fin
