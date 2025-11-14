# 🎨 Guide des Layouts de Factures

## Vue d'ensemble

Le système de templates de factures propose maintenant **4 layouts visuels complètement différents**, pas seulement des variations de couleurs. Chaque layout a sa propre structure HTML et son propre style CSS.

---

## Les 4 Layouts disponibles

### 1. ✨ Moderne (modern)

**Caractéristiques :**
- Barre latérale colorée à gauche avec gradient
- Logo dans un badge circulaire
- Design épuré et spacieux
- En-tête de tableau avec gradient
- Style contemporain et professionnel

**Idéal pour :**
- Startups tech
- Agences digitales
- Freelances créatifs

**Code :** `src/lib/invoice-templates/layouts.ts` → `generateModernLayout()`

---

### 2. 🎩 Classique (classic)

**Caractéristiques :**
- Double bordure élégante autour du document
- Logo centré dans un cercle avec bordure
- Grille à deux colonnes pour infos entreprise/client
- Typographie serif (Georgia)
- Style traditionnel et formel

**Idéal pour :**
- Cabinets d'avocats
- Notaires
- Entreprises établies
- Services financiers

**Code :** `src/lib/invoice-templates/layouts.ts` → `generateClassicLayout()`

---

### 3. ⚪ Minimal (minimal)

**Caractéristiques :**
- Ultra épuré noir & blanc
- Bordures fines uniquement
- Espacement compact
- Typographie Helvetica
- Esthétique Swiss/Bauhaus

**Idéal pour :**
- Designers
- Architectes
- Consultants
- Minimalistes

**Code :** `src/lib/invoice-templates/layouts.ts` → `generateMinimalLayout()`

---

### 4. 🎨 Créatif (creative)

**Caractéristiques :**
- Barre d'accent colorée en haut
- Layout asymétrique avec badges colorés
- Cards arrondies avec gradients
- Style dynamique et moderne
- Accents de couleur partout

**Idéal pour :**
- Agences créatives
- Studios de design
- Entreprises innovantes
- Industries créatives

**Code :** `src/lib/invoice-templates/layouts.ts` → `generateCreativeLayout()`

---

## Architecture technique

### Fichiers principaux

```
src/
├── lib/
│   ├── invoice-templates/
│   │   ├── layouts.ts              # 🆕 4 générateurs de layouts
│   │   └── presets.ts               # Templates avec layoutType
│   └── templates/
│       └── invoice-pdf-generator.ts # Générateur qui utilise les layouts
├── models/
│   └── InvoiceTemplate.ts           # Model avec champ layoutType
└── components/
    └── invoice-templates/
        └── TemplateCustomizer.tsx   # UI avec sélecteur de layouts
```

### Flux de génération PDF

```
1. Utilisateur sélectionne un layoutType (modern/classic/minimal/creative)
   └─> TemplateCustomizer.tsx

2. Le template est sauvegardé avec layout.layoutType
   └─> InvoiceTemplate model

3. Lors de la génération PDF :
   └─> invoice-pdf-generator.ts
       └─> Vérifie layout.layoutType
           └─> Appelle INVOICE_LAYOUTS[layoutType]()
               └─> Génère HTML complet avec CSS inline
```

### Structure d'un layout

Chaque layout est une fonction qui :

```typescript
interface LayoutGeneratorParams {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
  itemsRows: string;      // HTML des lignes d'items
  tvaRows: string;        // HTML des lignes TVA
  colors: any;            // Couleurs personnalisables
  fonts: any;             // Typographie personnalisable
  layout: any;            // Config du layout
  sections: any;          // Sections visibles
  customText: any;        // Mentions légales
}

function generateModernLayout(params: LayoutGeneratorParams): string {
  return `<!DOCTYPE html>...`; // HTML complet avec inline CSS
}
```

---

## Personnalisation

### Dans l'UI

1. Aller dans **Paramètres** → **Modèles de factures**
2. Cliquer sur **Créer un nouveau modèle**
3. Onglet **Disposition** :
   - Sélectionner un **Type de mise en page** (Moderne/Classique/Minimal/Créatif)
   - Personnaliser les couleurs, polices, espacements
4. **Enregistrer et activer**

### Via l'API

```typescript
POST /api/invoice-templates

{
  "name": "Mon Template",
  "layout": {
    "layoutType": "modern", // ⬅️ NOUVEAU CHAMP
    "logoPosition": "left",
    "logoSize": "medium",
    "headerStyle": "modern",
    "borderRadius": 6,
    "spacing": "compact"
  },
  "colors": { ... },
  "fonts": { ... },
  "sections": { ... },
  "customText": { ... }
}
```

---

## Migration des templates existants

Un script de migration a été créé pour ajouter `layoutType: 'modern'` aux templates existants.

### Exécution :

```bash
npm run db:migrate-layout-type
```

### Ce que fait le script :

1. Connecte à MongoDB
2. Trouve tous les templates sans `layout.layoutType`
3. Ajoute `layout.layoutType: 'modern'` par défaut
4. Vérifie que tous les templates ont maintenant layoutType

**Fichier :** `scripts/migrate-add-layout-type.ts`

---

## Compatibilité

### Rétrocompatibilité

Le système est **100% rétrocompatible** :

- Si un template n'a **pas** de `layoutType` → utilise l'ancien système (fallback)
- Si un template **a** un `layoutType` → utilise le nouveau système de layouts

### Validation Zod

Le schema d'API a été mis à jour pour valider layoutType :

```typescript
layout: z.object({
  layoutType: z.enum(['modern', 'classic', 'minimal', 'creative']),
  // ... autres champs
})
```

---

## Ajout d'un nouveau layout

Pour ajouter un 5ème layout (ex: "premium") :

### 1. Créer le générateur dans `layouts.ts`

```typescript
export function generatePremiumLayout(params: LayoutGeneratorParams): string {
  const { invoice, client, user, colors, fonts, sections, customText, itemsRows, tvaRows } = params;

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Facture ${invoice.invoiceNumber}</title>
        <style>
          /* Votre CSS custom ici */
        </style>
      </head>
      <body>
        <!-- Votre HTML custom ici -->
      </body>
    </html>
  `;
}
```

### 2. L'ajouter au map des layouts

```typescript
export const INVOICE_LAYOUTS = {
  modern: generateModernLayout,
  classic: generateClassicLayout,
  minimal: generateMinimalLayout,
  creative: generateCreativeLayout,
  premium: generatePremiumLayout, // ⬅️ NOUVEAU
};
```

### 3. Mettre à jour le model TypeScript

Dans `src/models/InvoiceTemplate.ts` :

```typescript
layoutType: 'modern' | 'classic' | 'minimal' | 'creative' | 'premium'
```

### 4. Mettre à jour le schema Zod

Dans `src/app/api/invoice-templates/route.ts` :

```typescript
layoutType: z.enum(['modern', 'classic', 'minimal', 'creative', 'premium'])
```

### 5. Ajouter dans l'UI

Dans `src/components/invoice-templates/TemplateCustomizer.tsx` :

```typescript
{(['modern', 'classic', 'minimal', 'creative', 'premium'] as const).map((layoutType) => (
  // ... bouton
))}
```

---

## Tests recommandés

### Avant déploiement :

1. ✅ Créer un template de chaque type (modern/classic/minimal/creative)
2. ✅ Générer une facture PDF avec chaque template
3. ✅ Vérifier que les couleurs personnalisées s'appliquent
4. ✅ Vérifier que les sections on/off fonctionnent
5. ✅ Tester sur mobile (responsive)
6. ✅ Valider la conformité légale française

### Checklist PDF :

- [ ] Logo affiché correctement
- [ ] Infos entreprise complètes
- [ ] Infos client correctes
- [ ] Items avec quantité, prix, TVA
- [ ] Totaux calculés (HT, TVA, TTC)
- [ ] Mentions légales affichées
- [ ] Coordonnées bancaires présentes
- [ ] Format A4 (210x297mm)

---

## Dépannage

### Le layout ne change pas

**Problème :** Après avoir changé layoutType, le PDF reste identique

**Solution :**
1. Vérifier que le template a bien été sauvegardé avec layoutType
2. Effacer le cache navigateur
3. Vérifier les logs serveur
4. Tester avec `console.log(template.layout.layoutType)` dans `invoice-pdf-generator.ts`

### Erreur "layoutType is not defined"

**Problème :** Templates existants sans layoutType

**Solution :**
```bash
npm run db:migrate-layout-type
```

### PDF vide ou cassé

**Problème :** Erreur dans la génération HTML

**Solution :**
1. Vérifier les balises HTML fermées
2. Valider le CSS inline
3. Tester avec un template par défaut
4. Consulter les logs serveur

---

## Ressources

- **Layouts :** [src/lib/invoice-templates/layouts.ts](../src/lib/invoice-templates/layouts.ts)
- **Presets :** [src/lib/invoice-templates/presets.ts](../src/lib/invoice-templates/presets.ts)
- **Model :** [src/models/InvoiceTemplate.ts](../src/models/InvoiceTemplate.ts)
- **API :** [src/app/api/invoice-templates/route.ts](../src/app/api/invoice-templates/route.ts)
- **Générateur :** [src/lib/templates/invoice-pdf-generator.ts](../src/lib/templates/invoice-pdf-generator.ts)
- **Migration :** [scripts/migrate-add-layout-type.ts](../scripts/migrate-add-layout-type.ts)

---

## Notes importantes

### Conformité légale

Tous les layouts respectent les **obligations légales françaises** pour les factures :

- ✅ Numéro de facture unique et séquentiel
- ✅ Date d'émission et d'échéance
- ✅ Identité complète du vendeur (SIRET, adresse)
- ✅ Identité complète de l'acheteur
- ✅ Détails des prestations/produits
- ✅ Prix unitaire HT, quantité, TVA, total TTC
- ✅ Mentions légales (pénalités de retard, etc.)

### Performance

Les layouts génèrent du HTML avec **inline CSS** pour garantir :
- ✅ Rendu identique partout (pas de CSS externe)
- ✅ Compatibilité maximale avec les générateurs PDF
- ✅ Pas de dépendances externes
- ✅ Taille de fichier optimisée

---

**Version :** 1.0
**Dernière mise à jour :** 11/11/2025
