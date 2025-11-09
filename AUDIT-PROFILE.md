# 🔍 AUDIT - Paramètres Profil & Completion

## 📋 Vue d'ensemble

**Date de l'audit** : 4 novembre 2025  
**Scope** : Frontend + Backend du système de profil utilisateur  
**Objectif** : Identifier clarté des erreurs, distinction obligatoire/optionnel

---

## ✅ Points positifs

### Backend (API + Validation)

1. **Validation Zod robuste** (`src/lib/validations.ts`)
   - Schema `userProfileUpdateSchema` bien défini
   - Messages d'erreur personnalisés en français
   - Validation regex pour SIRET (14 chiffres), zipCode (5 chiffres), IBAN, phone

2. **Gestion d'erreur claire** (`src/app/api/user/profile/route.ts`)
   - Retourne un objet structuré avec `error`, `errors[]`, `details`
   - Logs console pour debug (`📝`, `✅`, `❌`)
   - Nettoyage des champs vides (conversion en `undefined`)

3. **Sécurité**
   - Vérification session avant toute opération
   - Email non modifiable (sécurité identité)

### Frontend (UI + UX)

1. **Interface organisée** (`ProfileForm.tsx`)
   - Sections claires avec icônes (👤 Personnel, 🏢 Entreprise, 📍 Adresse, 💳 Bancaire)
   - État loading/success/error bien géré
   - Animation feedback visuel (CheckCircle, AlertCircle)

2. **Indication optionnalité**
   - Section "Informations légales" marquée comme `(optionnelles)`
   - Texte d'aide sous certains champs (ex: "Si vide, votre nom complet sera utilisé")

3. **Modal de complétion** (`ProfileCompletionModal.tsx`)
   - Barre de progression dynamique
   - Liste des champs manquants
   - Call-to-action clair ("Compléter maintenant")

---

## ⚠️ Problèmes identifiés

### 🔴 CRITIQUE - Incohérence validation obligatoire/optionnel

#### Problème 1 : Schema Zod tous en `.optional()`

**Fichier** : `src/lib/validations.ts` (lignes 30-55)

```typescript
export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').optional(),        // ❌ MESSAGE TROMPREUR
  lastName: z.string().min(1, 'Nom requis').optional(),            // ❌ MESSAGE TROMPREUR
  companyName: z.string().min(1, 'Raison sociale requise').optional(), // ❌ MESSAGE TROMPREUR
  // ... tous les champs sont .optional()
});
```

**Impact** :
- Les messages disent "requis" mais Zod accepte `undefined`
- L'utilisateur peut sauvegarder un profil vide sans erreur
- Contradiction avec la logique `isProfileComplete`

**Comportement actuel** :
- ✅ L'utilisateur peut sauvegarder un formulaire vide → `200 OK`
- ❌ Mais ensuite, impossible de générer PDF/envoyer email (erreur "Profil incomplet")

#### Problème 2 : Définition `isProfileComplete` incohérente entre fichiers

**4 définitions différentes dans le code** :

```typescript
// 1. src/app/dashboard/settings/page.tsx (ligne 38)
const complete = !!(
  userProfile.companyName &&
  userProfile.legalForm &&
  userProfile.address?.street &&
  userProfile.address?.city &&
  userProfile.address?.zipCode
);

// 2. src/app/api/email/send-invoice/route.ts (ligne 106)
const isProfileComplete = !!(
  user?.companyName &&
  user?.legalForm &&
  user?.address?.street &&
  user?.address?.city &&
  user?.address?.zipCode
);

// 3. src/app/api/invoices/[id]/pdf/route.ts (ligne 366)
const isProfileComplete = !!(
  user?.companyName &&
  user?.legalForm &&
  user?.address?.street &&
  user?.address?.city &&
  user?.address?.zipCode
);

// Même définition répétée dans :
// - src/app/api/email/send-reminder/route.ts
// - src/app/api/email/send-quote/route.ts
// - src/app/api/quotes/[id]/pdf/route.ts
```

**Impact** :
- ✅ Heureusement, toutes les définitions sont identiques
- ❌ Mais duplication de code = risque d'incohérence future
- ❌ Si on doit changer la logique, il faut modifier 6 fichiers

#### Problème 3 : Champs obligatoires non marqués visuellement

**Fichier** : `src/components/profile/ProfileForm.tsx`

**Manque** :
- Aucune astérisque `*` rouge sur les champs obligatoires
- Aucun texte "Champ requis" sous les inputs
- L'utilisateur ne sait pas quoi remplir en priorité

**Exemple actuel** :
```tsx
<Label htmlFor="companyName">Raison sociale</Label>
<Input id="companyName" name="companyName" value={profile.companyName || ''} onChange={onChange} />
<p className="text-xs text-gray-500">Si vide, votre nom complet sera utilisé</p>
```

**Problème** : Le texte suggère que c'est optionnel, mais c'est obligatoire pour PDF/Email !

#### Problème 4 : Messages d'erreur backend non affichés côté frontend

**Fichier** : `src/app/dashboard/settings/page.tsx` (ligne 77)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ...
  try {
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour'); // ❌ MESSAGE GÉNÉRIQUE
    setSuccess(true);
  } catch (err: any) {
    setError(err.message); // ❌ Perd les détails Zod
  }
}
```

**Impact** :
- Si Zod retourne `{ errors: ['SIRET doit contenir 14 chiffres', 'Code postal invalide'] }`
- L'utilisateur voit juste : "Erreur lors de la mise à jour" (pas utile !)
- Les vrais messages d'erreur sont perdus

#### Problème 5 : Validation côté frontend absente

**Manque** :
- Aucune validation en temps réel (pas de regex check côté client)
- L'utilisateur doit soumettre pour voir les erreurs
- Expérience utilisateur frustrante (aller-retour API inutile)

**Exemples** :
- SIRET : Pas de limite à 14 caractères pendant la saisie (il y a `maxLength={14}` mais pas de message si invalide)
- Code postal : Pas de vérification des 5 chiffres avant submit
- IBAN : Aucune indication si le format est incorrect

---

## 📊 Tableau récapitulatif des champs

| Champ | Validation Zod | Message | Réellement obligatoire ? | Visuel Frontend | Note |
|-------|---------------|---------|-------------------------|-----------------|------|
| `firstName` | `.min(1).optional()` | "Prénom requis" | ✅ OUI (pour isProfileComplete) | ❌ Pas d'astérisque | Incohérent |
| `lastName` | `.min(1).optional()` | "Nom requis" | ✅ OUI (pour isProfileComplete) | ❌ Pas d'astérisque | Incohérent |
| `companyName` | `.min(1).optional()` | "Raison sociale requise" | ✅ OUI (pour PDF/Email) | ❌ Pas d'astérisque | **CRITIQUE** |
| `legalForm` | `.enum().optional()` | - | ✅ OUI (pour PDF/Email) | ❌ Pas d'astérisque | **CRITIQUE** |
| `siret` | `.regex(/^\d{14}$/).optional()` | "SIRET doit contenir 14 chiffres" | ❌ NON | ✅ Placeholder "14 chiffres" | OK mais message pas affiché |
| `address.street` | `.min(1).optional()` | "Adresse requise" | ✅ OUI (pour PDF/Email) | ❌ Pas d'astérisque | **CRITIQUE** |
| `address.city` | `.min(1).optional()` | "Ville requise" | ✅ OUI (pour PDF/Email) | ❌ Pas d'astérisque | **CRITIQUE** |
| `address.zipCode` | `.regex(/^\d{5}$/).optional()` | "Code postal invalide" | ✅ OUI (pour PDF/Email) | ❌ Pas d'astérisque | **CRITIQUE** |
| `address.country` | `.min(1).optional()` | "Pays requis" | ❌ NON (défaut: "France") | ✅ Placeholder "Pays" | OK |
| `phone` | `.regex().optional()` | "Numéro invalide" | ❌ NON | ✅ Placeholder | OK |
| `iban` | `.min(10).max(34).optional()` | - | ❌ NON | ✅ Texte aide | OK |
| `logo` | `.string().optional()` | - | ❌ NON | ✅ Upload | OK |
| `rcsCity` | Non dans schema | - | ❌ NON | ✅ Label "optionnelles" | ⚠️ Pas validé |
| `capital` | Non dans schema | - | ❌ NON | ✅ Label "optionnelles" | ⚠️ Pas validé |
| `tvaNumber` | Non dans schema | - | ❌ NON | ✅ Label "optionnelles" | ⚠️ Pas validé |
| `insuranceCompany` | Non dans schema | - | ❌ NON | ✅ Aucun label | ⚠️ Pas validé |
| `insurancePolicy` | Non dans schema | - | ❌ NON | ✅ Aucun label | ⚠️ Pas validé |

---

## 🚀 Recommandations (par priorité)

### 🔴 PRIORITÉ 1 : Clarifier champs obligatoires (BREAKING)

**Action 1** : Créer un schema strict pour les champs critiques

```typescript
// src/lib/validations.ts - NOUVEAU
export const userProfileRequiredFields = z.object({
  companyName: z.string().min(1, 'Raison sociale requise'),
  legalForm: z.enum(['SARL', 'EURL', 'SASU', 'Auto-entrepreneur', 'Profession libérale'], {
    errorMap: () => ({ message: 'Forme juridique requise' })
  }),
  address: z.object({
    street: z.string().min(1, 'Adresse requise'),
    city: z.string().min(1, 'Ville requise'),
    zipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
    country: z.string().default('France'),
  }),
});

export const userProfileUpdateSchema = z.object({
  // Champs personnels
  firstName: z.string().min(1, 'Prénom requis').optional(),
  lastName: z.string().min(1, 'Nom requis').optional(),
  
  // Champs entreprise OBLIGATOIRES
  companyName: z.string().min(1, 'Raison sociale requise'),
  legalForm: z.enum(['SARL', 'EURL', 'SASU', 'Auto-entrepreneur', 'Profession libérale']),
  address: z.object({
    street: z.string().min(1, 'Adresse requise'),
    city: z.string().min(1, 'Ville requise'),
    zipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
    country: z.string().default('France'),
  }),
  
  // Champs optionnels
  siret: z.string().regex(/^\d{14}$/, 'SIRET doit contenir 14 chiffres').optional(),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Numéro invalide').optional(),
  iban: z.string().min(10).max(34).optional(),
  logo: z.string().optional(),
  
  // ... autres champs optionnels
});
```

**Impact** : Force l'utilisateur à remplir les champs essentiels avant de pouvoir sauvegarder.

---

### 🟠 PRIORITÉ 2 : Centraliser logique `isProfileComplete`

**Action 2** : Créer une fonction utilitaire unique

```typescript
// src/lib/utils/profile.ts - NOUVEAU FICHIER
import { User } from '@/models/User';

/**
 * Vérifie si un profil utilisateur est complet pour générer des factures
 * Requis pour : PDF, Email, Rappels
 */
export function isProfileComplete(user: {
  companyName?: string;
  legalForm?: string;
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
  };
}): boolean {
  return !!(
    user.companyName &&
    user.legalForm &&
    user.address?.street &&
    user.address?.city &&
    user.address?.zipCode
  );
}

/**
 * Retourne la liste des champs manquants pour un profil
 */
export function getMissingProfileFields(user: any): string[] {
  const missing: string[] = [];
  if (!user.companyName) missing.push('Raison sociale');
  if (!user.legalForm) missing.push('Forme juridique');
  if (!user.address?.street) missing.push('Adresse');
  if (!user.address?.city) missing.push('Ville');
  if (!user.address?.zipCode) missing.push('Code postal');
  return missing;
}
```

**Puis remplacer dans tous les fichiers** :

```typescript
// src/app/api/invoices/[id]/pdf/route.ts
import { isProfileComplete } from '@/lib/utils/profile';

// AVANT (lignes 366-374)
const isProfileComplete = !!(
  user?.companyName &&
  user?.legalForm &&
  user?.address?.street &&
  user?.address?.city &&
  user?.address?.zipCode
);

// APRÈS
if (!isProfileComplete(user)) {
  const missingFields = getMissingProfileFields(user);
  return NextResponse.json({ 
    error: 'Profil incomplet',
    message: 'Veuillez compléter les champs suivants : ' + missingFields.join(', ')
  }, { status: 400 });
}
```

**Fichiers à modifier** :
- ✅ `src/app/api/invoices/[id]/pdf/route.ts`
- ✅ `src/app/api/quotes/[id]/pdf/route.ts`
- ✅ `src/app/api/email/send-invoice/route.ts`
- ✅ `src/app/api/email/send-quote/route.ts`
- ✅ `src/app/api/email/send-reminder/route.ts`
- ✅ `src/app/dashboard/settings/page.tsx`

---

### 🟡 PRIORITÉ 3 : Améliorer affichage erreurs frontend

**Action 3** : Afficher les erreurs Zod individuellement

```typescript
// src/app/dashboard/settings/page.tsx
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  setFieldErrors({});
  setSuccess(false);
  
  try {
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      // Parser les erreurs Zod
      if (data.details) {
        const errors: Record<string, string> = {};
        data.details.forEach((issue: any) => {
          const path = issue.path.join('.');
          errors[path] = issue.message;
        });
        setFieldErrors(errors);
        setError('Veuillez corriger les erreurs ci-dessous');
      } else {
        setError(data.error || 'Erreur lors de la mise à jour');
      }
      return;
    }
    
    setSuccess(true);
    setEditMode(false);
  } catch (err: any) {
    setError('Erreur réseau : ' + err.message);
  } finally {
    setIsLoading(false);
  }
};
```

**Puis dans ProfileForm** :

```tsx
// src/components/profile/ProfileForm.tsx
interface ProfileFormProps {
  // ...
  fieldErrors?: Record<string, string>; // NOUVEAU
}

// Dans le rendu :
<div className="space-y-2">
  <Label htmlFor="companyName" className="flex items-center gap-1">
    Raison sociale 
    <span className="text-red-500">*</span>
  </Label>
  <Input 
    id="companyName" 
    name="companyName" 
    value={profile.companyName || ''} 
    onChange={onChange}
    className={fieldErrors?.companyName ? 'border-red-500' : ''}
  />
  {fieldErrors?.companyName && (
    <p className="text-xs text-red-600 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {fieldErrors.companyName}
    </p>
  )}
</div>
```

---

### 🟢 PRIORITÉ 4 : Validation temps réel côté client

**Action 4** : Ajouter validation instantanée avec Zod

```typescript
// src/app/dashboard/settings/page.tsx
import { userProfileUpdateSchema } from '@/lib/validations';

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  // Mise à jour de l'état
  if (name.startsWith('address.')) {
    const key = name.split('.')[1];
    setProfile((prev) => ({ 
      ...prev, 
      address: { ...prev.address, [key]: value } 
    }));
  } else {
    setProfile((prev) => ({ ...prev, [name]: value }));
  }
  
  // Validation instantanée du champ modifié
  try {
    const fieldSchema = userProfileUpdateSchema.shape[name as keyof typeof userProfileUpdateSchema.shape];
    if (fieldSchema) {
      fieldSchema.parse(value);
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  } catch (zodErr: any) {
    if (zodErr.errors?.[0]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: zodErr.errors[0].message,
      }));
    }
  }
};
```

---

### 🔵 PRIORITÉ 5 : Ajouter champs manquants au schema Zod

**Action 5** : Inclure tous les champs du frontend dans la validation

```typescript
// src/lib/validations.ts
export const userProfileUpdateSchema = z.object({
  // ... champs existants ...
  
  // Informations légales (optionnelles)
  rcsCity: z.string().min(1).optional(),
  capital: z.number().min(0).optional(),
  tvaNumber: z.string().regex(/^[A-Z]{2}\d{11}$/, 'Format TVA invalide (ex: FR12345678901)').optional(),
  
  // Assurance RC Pro (optionnelle)
  insuranceCompany: z.string().min(1).optional(),
  insurancePolicy: z.string().min(1).optional(),
  
  // Coordonnées bancaires détaillées (optionnelles)
  bankName: z.string().optional(),
  bic: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Format BIC invalide').optional(),
  bankCode: z.string().regex(/^\d{5}$/, 'Code banque invalide (5 chiffres)').optional(),
  branchCode: z.string().regex(/^\d{5}$/, 'Code guichet invalide (5 chiffres)').optional(),
});
```

---

## 📝 Modifications proposées (résumé technique)

| Fichier | Action | Ligne(s) | Impact |
|---------|--------|----------|--------|
| `src/lib/validations.ts` | Rendre `companyName`, `legalForm`, `address` **non optionnels** | 30-40 | 🔴 BREAKING |
| `src/lib/utils/profile.ts` | **CRÉER** fonction `isProfileComplete()` | New | 🟠 Refactor |
| `src/app/api/*/route.ts` | Remplacer logique par `isProfileComplete(user)` | Multiple | 🟠 Refactor |
| `src/components/profile/ProfileForm.tsx` | Ajouter `*` rouge sur champs obligatoires | Multiple | 🟡 UX |
| `src/components/profile/ProfileForm.tsx` | Afficher `fieldErrors` individuels | Props | 🟡 UX |
| `src/app/dashboard/settings/page.tsx` | Parser erreurs API et validation temps réel | 77-90 | 🟡 UX |
| `src/lib/validations.ts` | Ajouter `rcsCity`, `capital`, `tvaNumber`, etc. | 55+ | 🔵 Complétude |

---

## ⚡ Estimation effort

| Priorité | Temps estimé | Difficulté | Impact UX |
|----------|--------------|------------|-----------|
| P1 - Schema strict | 30 min | 🟠 Moyen | ⭐⭐⭐⭐⭐ |
| P2 - Centralisation | 45 min | 🟡 Facile | ⭐⭐⭐⭐ |
| P3 - Erreurs frontend | 1h | 🟠 Moyen | ⭐⭐⭐⭐⭐ |
| P4 - Validation temps réel | 1h | 🔴 Complexe | ⭐⭐⭐⭐ |
| P5 - Champs manquants | 20 min | 🟡 Facile | ⭐⭐ |

**Total** : ~3h30

---

## 🎯 Conclusion

### État actuel : ⚠️ 6/10

**Forces** :
- ✅ Validation backend robuste (Zod)
- ✅ Sécurité API bien gérée
- ✅ UI organisée et claire

**Faiblesses critiques** :
- ❌ Incohérence validation `.optional()` vs messages "requis"
- ❌ Logique `isProfileComplete` dupliquée 6 fois
- ❌ Erreurs backend perdues côté frontend
- ❌ Aucune indication visuelle des champs obligatoires
- ❌ Pas de validation temps réel

### État après fixes : 🎉 9/10

Avec les 5 priorités implémentées :
- ✅ Validation cohérente obligatoire/optionnel
- ✅ Code centralisé et maintenable
- ✅ Messages d'erreur clairs et précis
- ✅ Feedback temps réel pour l'utilisateur
- ✅ 100% des champs validés

---

## 📚 Annexes

### A1. Exemple de message d'erreur actuel vs proposé

**Actuel** :
```
❌ Erreur lors de la mise à jour
```

**Proposé** :
```
❌ Veuillez corriger les erreurs ci-dessous :
• Raison sociale : Ce champ est requis
• SIRET : Doit contenir 14 chiffres
• Code postal : Format invalide (5 chiffres attendus)
```

### A2. Exemple de validation temps réel

**Sans validation** :
1. User tape "1234" dans SIRET → aucune indication
2. User clique "Enregistrer" → attend 500ms
3. API retourne erreur → User doit corriger et re-soumettre

**Avec validation** :
1. User tape "1234" dans SIRET → bordure rouge + "Doit contenir 14 chiffres" instantané
2. User corrige → bordure verte ✓
3. User clique "Enregistrer" → succès immédiat

---

**Audit réalisé par** : GitHub Copilot  
**Fichiers analysés** : 10+ fichiers TypeScript/React  
**Lignes de code examinées** : ~2000 lignes
