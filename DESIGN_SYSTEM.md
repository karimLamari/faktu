# 🎨 Système de Design - Invoice App

## Objectif
Uniformiser tous les composants pour un design professionnel et cohérent.

---

## 📏 STANDARDS DE BASE

### 🔹 Inputs & Form Controls

```tsx
// ✅ STANDARD UNIFORME
<input className="
  h-10                    // Hauteur fixe
  border                  // Bordure simple (pas border-2)
  border-gray-300         // Couleur neutre
  rounded-lg              // Arrondi moyen
  px-3                    // Padding horizontal
  text-sm                 // Taille de texte
  focus:border-blue-500   // Focus bleu
  focus:ring-2            // Ring au focus
  focus:ring-blue-500/20  // Ring semi-transparent
  transition-colors       // Transition douce
" />

// ❌ À ÉVITER
border-2 rounded-xl h-12 h-11
```

### 🔹 Buttons

Utiliser **TOUJOURS** le composant `<Button>` de shadcn/ui:

```tsx
// ✅ CORRECT
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">Action</Button>
<Button variant="outline" size="sm">Secondaire</Button>
<Button variant="destructive">Supprimer</Button>
<Button variant="ghost">Annuler</Button>

// Variantes disponibles:
// - default: Bouton primaire (bleu)
// - destructive: Actions dangereuses (rouge)
// - outline: Actions secondaires (bordure)
// - ghost: Actions tertiaires (transparent)
// - link: Lien texte

// Tailles:
// - sm: h-8
// - default: h-9
// - lg: h-10
// - icon: Bouton carré
```

### 🔹 Cards

```tsx
// ✅ STANDARD UNIFORME
<div className="
  bg-white
  border border-gray-200  // Bordure simple
  rounded-xl              // Arrondi standard pour cards
  shadow-sm               // Ombre légère par défaut
  hover:shadow-md         // Ombre moyenne au hover
  transition-all          // Transition douce
  duration-200           // 200ms
  p-6                     // Padding interne
">

// ❌ À ÉVITER
rounded-2xl shadow-lg shadow-2xl border-2
```

### 🔹 Modales

```tsx
// ✅ STANDARD UNIFORME
// Container de modale (backdrop)
<div className="
  fixed inset-0
  bg-black/60             // Overlay sombre
  backdrop-blur-sm        // Flou arrière-plan
  flex items-center justify-center
  z-50
  p-4                     // Padding pour mobile
">

// Contenu de modale
<div className="
  bg-white
  rounded-2xl             // Plus arrondi pour modales
  shadow-xl               // Ombre forte (pas 2xl)
  w-full max-w-4xl       // Largeur max adaptée
  max-h-[90vh]           // Hauteur max avec scroll
  overflow-hidden        // Pas de débordement
">

// ❌ À ÉVITER
shadow-2xl rounded-xl
```

### 🔹 Sections de Formulaires

```tsx
// ✅ STANDARD UNIFORME
<div className="
  bg-gray-50              // Background léger neutre
  border border-gray-200  // Bordure simple
  rounded-xl              // Arrondi standard
  p-4                     // Padding uniforme
  space-y-4              // Espacement entre enfants
">

// ❌ À ÉVITER
bg-blue-50 bg-green-50 p-5 border-2
```

### 🔹 Badges (Status)

```tsx
// ✅ STANDARD UNIFORME
<Badge className="
  flex items-center gap-1 // Icon + text
  text-xs font-semibold
  border                  // Bordure simple
  // Couleurs selon contexte (voir palette ci-dessous)
">

// Palette de statuts:
// - Draft: bg-gray-100 text-gray-800 border-gray-300
// - Sent: bg-blue-100 text-blue-800 border-blue-300
// - Paid/Success: bg-green-100 text-green-800 border-green-300
// - Overdue/Error: bg-red-100 text-red-800 border-red-300
// - Warning: bg-orange-100 text-orange-800 border-orange-300
// - Info: bg-indigo-100 text-indigo-800 border-indigo-300
```

---

## 🎨 PALETTE DE COULEURS

### Couleurs Primaires

```css
/* Bleu - Actions principales, liens */
primary: hsl(217 91% 60%)       // #3B82F6
primary-hover: hsl(217 91% 50%)

/* Vert - Succès, validations */
success: hsl(142 71% 45%)       // #22C55E
success-hover: hsl(142 71% 35%)

/* Rouge - Erreurs, suppressions */
danger: hsl(0 72% 51%)          // #DC2626
danger-hover: hsl(0 72% 41%)

/* Orange - Alertes, en attente */
warning: hsl(25 95% 53%)        // #F97316
warning-hover: hsl(25 95% 43%)
```

### Neutrals (Gris)

```css
gray-50: hsl(210 20% 98%)   // Backgrounds très légers
gray-100: hsl(210 14% 96%)  // Backgrounds légers
gray-200: hsl(210 16% 93%)  // Bordures claires
gray-300: hsl(210 14% 89%)  // Bordures standard
gray-600: hsl(210 12% 37%)  // Textes secondaires
gray-700: hsl(210 15% 24%)  // Textes normaux
gray-900: hsl(210 22% 9%)   // Titres, textes importants
```

### Usage des couleurs

- **Textes**: `text-gray-900` (titres), `text-gray-700` (corps), `text-gray-600` (secondaire)
- **Backgrounds**: `bg-gray-50` (sections), `bg-white` (cards)
- **Bordures**: `border-gray-200` (claires), `border-gray-300` (standard)

---

## 📐 SPACING & SIZING

### Espacements

```tsx
// Padding interne des composants
p-2: 0.5rem  (8px)   // Très petit
p-3: 0.75rem (12px)  // Petit
p-4: 1rem    (16px)  // Standard ✅ (utiliser par défaut)
p-5: 1.25rem (20px)  // ❌ À éviter (non standard)
p-6: 1.5rem  (24px)  // Large (cards)

// Gaps entre éléments
gap-2: 0.5rem  (8px)   // Petit
gap-3: 0.75rem (12px)  // Standard inputs inline
gap-4: 1rem    (16px)  // Standard sections ✅
gap-6: 1.5rem  (24px)  // Large

// Margins
mb-4: 1rem    (16px)  // Entre sections ✅
mb-6: 1.5rem  (24px)  // Entre grandes sections
```

### Hauteurs des inputs

```tsx
h-8: 2rem    (32px)  // Petit (buttons sm)
h-9: 2.25rem (36px)  // Standard buttons
h-10: 2.5rem (40px)  // Inputs standard ✅ (utiliser partout)
h-11: 2.75rem (44px) // ❌ Non standard
h-12: 3rem   (48px)  // ❌ Trop grand pour inputs
```

### Border Radius

```tsx
rounded-md: 0.375rem (6px)   // Boutons (Button component)
rounded-lg: 0.5rem   (8px)   // Inputs, petits éléments ✅
rounded-xl: 0.75rem  (12px)  // Cards ✅
rounded-2xl: 1rem    (16px)  // Modales ✅
rounded-3xl: 1.5rem  (24px)  // ❌ Trop arrondi
```

---

## 🔍 RÈGLES D'APPLICATION

### 1. **Tous les Inputs**
- Hauteur: `h-10`
- Bordure: `border` (pas `border-2`)
- Arrondi: `rounded-lg`
- Focus: `focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`

### 2. **Toutes les Cards**
- Arrondi: `rounded-xl`
- Ombre: `shadow-sm hover:shadow-md`
- Bordure: `border border-gray-200`
- Padding: `p-6`

### 3. **Toutes les Modales**
- Container: `rounded-2xl shadow-xl`
- Header coloré: Utiliser gradient subtil
- Boutons: Utiliser `<Button>` component, jamais custom

### 4. **Sections de formulaires**
- Background: `bg-gray-50` (neutre)
- Bordure: `border border-gray-200`
- Padding: `p-4`
- Arrondi: `rounded-xl`

### 5. **Boutons**
- **TOUJOURS** utiliser `<Button>` component
- Jamais de `rounded-xl` custom
- Jamais de `px-4 py-2 bg-blue-500` custom

### 6. **Icons**
- Taille standard: `w-4 h-4` ou `w-5 h-5`
- Gap avec texte: `gap-1.5` (small) ou `gap-2` (standard)
- Source: `react-icons/fi` (Feather) ou `lucide-react`

---

## 🚫 CE QU'IL FAUT ÉVITER

### ❌ Classes inconsistantes à bannir

```tsx
// Inputs
border-2      → Utiliser: border
rounded-xl    → Utiliser: rounded-lg
h-11, h-12    → Utiliser: h-10

// Cards
rounded-2xl   → Utiliser: rounded-xl
shadow-lg     → Utiliser: shadow-sm hover:shadow-md
border-2      → Utiliser: border

// Modales
shadow-2xl    → Utiliser: shadow-xl

// Sections
p-5           → Utiliser: p-4
border-2      → Utiliser: border

// Boutons custom
px-4 py-2 bg-blue-500 rounded-xl
→ Utiliser: <Button variant="default">
```

### ❌ Couleurs de backgrounds à éviter

```tsx
// NE PAS utiliser de backgrounds colorés pour sections
bg-blue-50 bg-green-50 bg-purple-50
→ Utiliser: bg-gray-50 (neutre) ou bg-white
```

### ❌ Emojis

```tsx
// BANNIR tous les emojis du code
categoryEmojis: Record<string, string> // ❌
→ Utiliser: react-icons/fi ou lucide-react
```

---

## ✅ CHECKLIST DE VALIDATION

Avant de commit un composant, vérifier:

- [ ] Inputs: `h-10`, `border`, `rounded-lg`
- [ ] Cards: `rounded-xl`, `shadow-sm hover:shadow-md`
- [ ] Modales: `rounded-2xl`, `shadow-xl`
- [ ] Boutons: `<Button>` component utilisé
- [ ] Sections: `p-4`, `border`, `bg-gray-50`
- [ ] Pas de `border-2`, `h-11`, `h-12`
- [ ] Pas de `rounded-2xl` sur cards
- [ ] Pas d'emojis (🚫)
- [ ] Icons de `react-icons/fi` ou `lucide-react`
- [ ] Couleurs selon palette définie

---

## 📁 FICHIERS À CORRIGER

### Priorité 1 (Inputs inconsistants)
- [ ] InvoiceFormModal.tsx: border-2 → border, h-12 → h-10, rounded-xl → rounded-lg
- [ ] QuoteFormModal.tsx: border-2 → border, h-11/h-12 → h-10, rounded-xl/lg/md → rounded-lg
- [ ] ServiceFormModal.tsx: Vérifier inputs
- [ ] ClientForm.tsx: Vérifier inputs

### Priorité 2 (Cards inconsistantes)
- [ ] InvoiceCard.tsx: rounded-2xl → rounded-xl
- [ ] ClientCard.tsx: rounded-2xl → rounded-xl
- [ ] QuoteCard.tsx: ✅ Déjà correct (rounded-xl)
- [ ] ExpenseCard.tsx: ✅ Déjà correct + supprimer emojis

### Priorité 3 (Modales)
- [ ] EmailModals.tsx: Uniformiser structure
- [ ] ConvertQuoteModal.tsx: Vérifier cohérence
- [ ] QuotePreviewModal.tsx: Vérifier cohérence

### Priorité 4 (Sections & Autres)
- [ ] ManagementLayout.tsx: Vérifier stats cards padding
- [ ] Tous les formulaires: bg-blue-50/green-50 → bg-gray-50

---

## 🎯 RÉSULTAT ATTENDU

Un design **100% cohérent** où:
- Tous les inputs sont identiques
- Toutes les cards sont identiques
- Toutes les modales suivent le même pattern
- Tous les boutons utilisent le Button component
- Aucun emoji n'est présent
- Les couleurs sont utilisées de manière stratégique et prévisible

**Impact**: Application professionnelle, maintenable, et scalable.
