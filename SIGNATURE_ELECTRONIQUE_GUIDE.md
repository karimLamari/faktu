# 📝 Guide de la Signature Électronique

## Vue d'ensemble

La signature électronique permet aux clients de signer des devis directement en ligne via un lien sécurisé. Cette fonctionnalité est **réservée au plan PRO et BUSINESS**.

---

## 🎯 Comment ça fonctionne

### 1. **Workflow de signature**

```
┌─────────────────┐
│ 1. Créer devis  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Envoyer      │
│    devis        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ 3. Générer lien signature   │ ← FONCTIONNALITÉ PRO
│    (bouton "✍️ Signature")  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│ 4. Copier lien  │
│    & envoyer au │
│    client       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Client signe │
│    via /sign    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Devis signé  │
│    status:      │
│    'accepted'   │
└─────────────────┘
```

---

## 🔧 Implémentation actuelle

### Fichiers impliqués

| Fichier | Description |
|---------|-------------|
| [src/app/sign/page.tsx](src/app/sign/page.tsx) | Page de signature (canvas + formulaire) |
| [src/app/api/sign/route.ts](src/app/api/sign/route.ts) | API pour récupérer/signer un devis |
| [src/app/api/quotes/[id]/generate-signature-link/route.ts](src/app/api/quotes/[id]/generate-signature-link/route.ts) | Génération du lien de signature |
| [src/components/quotes/QuoteCard.tsx](src/components/quotes/QuoteCard.tsx:187-198) | Bouton "✍️ Signature" |
| [src/models/Quote.ts](src/models/Quote.ts) | Modèle avec `signatureToken` |

---

## 📍 Où trouver le bouton de signature

### Emplacement actuel
Le bouton **"✍️ Signature"** apparaît dans **QuoteCard** uniquement si :

1. ✅ **Plan PRO ou BUSINESS** (ligne 44)
2. ✅ **Devis envoyé** (`status === 'sent'`)
3. ✅ **Devis non expiré** (`validUntil > now`)

**Fichier**: `src/components/quotes/QuoteCard.tsx:187-198`

```tsx
{canGenerateSignature && (
  <Button
    variant="outline"
    size="sm"
    onClick={handleGenerateSignatureLink}
    disabled={generatingLink}
    className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/50 text-violet-300"
  >
    <FiEdit className="w-4 h-4" />
    {generatingLink ? 'Génération...' : '✍️ Signature'}
  </Button>
)}
```

---

## 🐛 BUG IDENTIFIÉ

### Problème
Le code vérifie le plan d'abonnement via la session NextAuth au lieu de l'API `/api/subscription/usage`.

**Code actuel (ligne 43)** :
```typescript
const userPlan = (session?.user as any)?.subscription?.plan || 'free';
```

**Problème** : La session NextAuth ne contient pas `subscription.plan` !

### Structure de la session NextAuth
```typescript
{
  user: {
    id: "...",
    email: "...",
    name: "...",
    // ❌ PAS de subscription.plan ici
  }
}
```

### Structure de `/api/subscription/usage`
```typescript
{
  plan: 'free' | 'pro' | 'business',  // ✅ Le plan est ici
  usage: { ... },
  subscription: { status, ... }
}
```

---

## ✅ SOLUTION

### Option 1: Utiliser `useSubscription` hook (Recommandé)

**Avant** :
```tsx
export default function QuoteCard({ quote, ... }) {
  const { data: session } = useSession();
  const userPlan = (session?.user as any)?.subscription?.plan || 'free';
  const canGenerateSignature = userPlan === 'pro' && quote.status === 'sent' && !isExpired;
  // ...
}
```

**Après** :
```tsx
import { useSubscription } from '@/hooks/useSubscription';

export default function QuoteCard({ quote, ... }) {
  const { data: session } = useSession();
  const { data: subscriptionData, loading: subscriptionLoading } = useSubscription();

  const userPlan = subscriptionData?.plan || 'free';
  const canGenerateSignature = !subscriptionLoading &&
    (userPlan === 'pro' || userPlan === 'business') &&
    quote.status === 'sent' &&
    !isExpired;
  // ...
}
```

### Option 2: Passer le plan en props (Alternative)

Si vous voulez éviter de charger l'API dans chaque carte :

```tsx
// Dans QuotesPage
const { data: subscriptionData } = useSubscription();

<QuoteCard
  quote={quote}
  userPlan={subscriptionData?.plan || 'free'}
  // ... autres props
/>

// Dans QuoteCard.tsx
interface QuoteCardProps {
  quote: IQuote;
  userPlan: 'free' | 'pro' | 'business';
  // ... autres props
}

const canGenerateSignature = (userPlan === 'pro' || userPlan === 'business') && ...
```

---

## 🎨 Amélioration UI suggérée

### Afficher le badge PRO pour les utilisateurs FREE

Pour les utilisateurs FREE, afficher un bouton "Signature" désactivé avec un badge PRO :

```tsx
{/* Toujours afficher le bouton, mais désactivé si FREE */}
<Button
  variant="outline"
  size="sm"
  onClick={canGenerateSignature ? handleGenerateSignatureLink : () => {
    alert('⚠️ Fonctionnalité réservée aux abonnés Pro\n\nPassez au plan Pro pour activer la signature électronique.');
  }}
  disabled={generatingLink || !canGenerateSignature}
  className={`${
    canGenerateSignature
      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/50 text-violet-300'
      : 'bg-gray-800/50 border-gray-600/50 text-gray-500 cursor-not-allowed'
  }`}
>
  <FiEdit className="w-4 h-4" />
  {generatingLink ? 'Génération...' : '✍️ Signature'}
  {!canGenerateSignature && userPlan === 'free' && (
    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-yellow-500 text-gray-900 rounded-full">
      PRO
    </span>
  )}
</Button>
```

---

## 🔐 Sécurité

### Token de signature
- **Génération** : Crypto-random 32 bytes (ligne 60)
- **Expiration** : 30 jours (ligne 61)
- **Stockage** : MongoDB dans le document Quote
- **Format URL** : `/sign?token={signatureToken}`

### Vérifications API
1. ✅ Plan PRO/BUSINESS requis
2. ✅ Devis envoyé (`status !== 'draft'`)
3. ✅ Devis non signé (`status !== 'accepted'`)
4. ✅ Token non expiré
5. ✅ Utilisateur authentifié (génération)
6. ⚠️ Pas d'auth requise pour signature (public)

---

## 📊 Données sauvegardées lors de la signature

```typescript
// Dans le modèle Quote
{
  signatureToken: string,          // Token généré
  signatureTokenExpiry: Date,      // Date d'expiration
  signedAt: Date,                  // Date de signature
  signedBy: string,                // Nom du signataire
  signatureData: string,           // Image base64 du canvas
  status: 'accepted'               // Statut mis à jour
}
```

---

## 🧪 Test de la fonctionnalité

### En tant qu'utilisateur PRO

1. Créer un devis
2. Envoyer le devis (status = 'sent')
3. ✅ Le bouton **"✍️ Signature"** doit apparaître
4. Cliquer sur "✍️ Signature"
5. ✅ Un lien doit être généré et copié
6. Ouvrir le lien dans un nouvel onglet
7. Signer avec le canvas
8. ✅ Le devis passe en status 'accepted'

### En tant qu'utilisateur FREE

1. Créer un devis
2. Envoyer le devis
3. ❌ Le bouton "✍️ Signature" **n'apparaît PAS** (bug actuel)
4. Devrait afficher : Badge "PRO" + Message upgrade

---

## 🚀 Roadmap / Améliorations possibles

### Court terme
- [ ] **Corriger le bug** : Utiliser `useSubscription` au lieu de `session`
- [ ] **Afficher badge PRO** pour utilisateurs FREE
- [ ] **Modal upgrade** au lieu d'une alerte
- [ ] **Notification email** quand devis signé

### Moyen terme
- [ ] **Envoi automatique** du lien par email
- [ ] **Templates d'email** personnalisables
- [ ] **Rappels automatiques** si non signé après X jours
- [ ] **Historique des signatures** (qui, quand, IP)

### Long terme
- [ ] **Signature qualifiée** (eIDAS)
- [ ] **Multi-signatures** (plusieurs signataires)
- [ ] **Signature côté entreprise** (double signature)
- [ ] **Intégration DocuSign/HelloSign**

---

## 📝 Checklist de correction

### 1. Corriger QuoteCard.tsx
- [ ] Importer `useSubscription`
- [ ] Remplacer `session?.user?.subscription?.plan`
- [ ] Ajouter support BUSINESS (`userPlan === 'business'`)
- [ ] Gérer le loading state
- [ ] Ajouter badge PRO pour FREE users

### 2. Tester
- [ ] User FREE : Voir badge PRO
- [ ] User PRO : Bouton fonctionnel
- [ ] User BUSINESS : Bouton fonctionnel
- [ ] Génération du lien
- [ ] Signature via le lien
- [ ] Statut mis à jour

### 3. Documentation
- [ ] Mettre à jour CSV_EXPORT_GUIDE.md
- [ ] Créer captures d'écran
- [ ] Documenter workflow client

---

## 🎯 Résumé

| Aspect | État actuel | État souhaité |
|--------|-------------|---------------|
| **Accès** | Plan PRO uniquement | PRO + BUSINESS |
| **Vérification plan** | ❌ Via session (broken) | ✅ Via useSubscription |
| **UI FREE users** | ❌ Bouton caché | ✅ Badge PRO visible |
| **Génération lien** | ✅ Fonctionne | ✅ OK |
| **Page signature** | ✅ Fonctionne | ✅ OK |
| **Canvas signature** | ✅ Fonctionne | ✅ OK |
| **Sauvegarde** | ✅ Fonctionne | ✅ OK |

**Conclusion** : La fonctionnalité existe et fonctionne, mais le bouton n'est pas visible car le plan n'est pas récupéré correctement. Il faut corriger `QuoteCard.tsx` pour utiliser `useSubscription()`.

---

**Version** : 1.0
**Date** : 2025-11-09
**Auteur** : Claude Code
