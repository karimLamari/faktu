# 📁 Organisation de l'Architecture Templates

## Structure Actuelle (Dispersée)

```
src/
├── components/
│   └── invoice-templates/      ❌ DISPERSÉ
│       ├── TemplateCustomizer.tsx
│       ├── TemplatePreview.tsx
│       ├── TemplatePreviewOptimized.tsx
│       ├── TemplateSelector.tsx
│       └── PDFViewerWrapper.tsx
│
└── lib/
    ├── invoice-templates/       ❌ DISPERSÉ
    │   ├── presets.ts
    │   ├── legal-mentions.ts
    │   └── validation.ts
    │
    └── templates/               ❌ DISPERSÉ
        ├── invoice-pdf-react.tsx
        ├── ModerneTemplate.tsx
        ├── ClassiqueTemplate.tsx
        ├── MinimalisteTemplate.tsx
        ├── CreatifTemplate.tsx
        ├── invoice-template-common.ts
        └── quote-pdf-react.tsx
```

## Structure Proposée (Centralisée)

```
src/lib/invoice-templates/
├── index.ts                     ✅ Point d'entrée unique
├── types.ts                     ✅ Types centralisés
├── config/
│   ├── presets.ts              ✅ Configurations templates
│   └── legal-mentions.ts       ✅ Mentions légales
│
├── core/
│   ├── router.tsx              ✅ Router InvoicePDF
│   ├── validation.ts           ✅ Validation Zod
│   └── utils.ts                ✅ Utilitaires (calculateVAT, format, etc.)
│
├── templates/
│   ├── ModerneTemplate.tsx
│   ├── ClassiqueTemplate.tsx
│   ├── MinimalisteTemplate.tsx
│   └── CreatifTemplate.tsx
│
└── components/                  ✅ Composants UI centralisés
    ├── TemplateCustomizer.tsx
    ├── TemplatePreview.tsx
    ├── TemplateSelector.tsx
    └── PDFViewerWrapper.tsx
```

## Imports Simplifiés

### Avant (Dispersé)
```typescript
import { modernTemplate } from '@/lib/invoice-templates/presets';
import { InvoicePDF } from '@/lib/templates/invoice-pdf-react';
import { TemplateCustomizer } from '@/components/invoice-templates/TemplateCustomizer';
import { calculateVATByRate } from '@/lib/templates/invoice-template-common';
```

### Après (Centralisé)
```typescript
import {
  modernTemplate,
  InvoicePDF,
  TemplateCustomizer,
  calculateVATByRate
} from '@/lib/invoice-templates';
```

## Migration Steps

1. ✅ Créer nouvelle structure `src/lib/invoice-templates/`
2. ✅ Déplacer fichiers vers sous-dossiers appropriés
3. ✅ Créer `index.ts` avec exports centralisés
4. ✅ Mettre à jour tous les imports dans le codebase
5. ✅ Supprimer anciens dossiers vides
6. ✅ Tester que tout compile

## Bénéfices

- ✅ 1 seul point d'entrée pour tout ce qui concerne les templates
- ✅ Imports simplifiés et cohérents
- ✅ Structure claire et maintenable
- ✅ Facilite l'ajout de nouveaux templates
- ✅ Tests plus faciles à organiser
