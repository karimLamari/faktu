# 📋 CAHIER DES CHARGES - GESTION DES DEVIS

**Projet :** blink - Module Devis  
**Version :** 1.0  
**Date :** 25 octobre 2025  
**Auteur :** Équipe blink

---

## 🎯 OBJECTIFS

Ajouter un système complet de gestion des devis permettant :
- Créer des devis professionnels
- Convertir un devis en facture en un clic
- Suivre l'état des devis (en attente, accepté, refusé, expiré)
- Gérer le cycle commercial complet : Devis → Facture → Paiement

---

## 🏗️ ARCHITECTURE TECHNIQUE

### 1. Modèle de données - `Quote.ts`

**Nouveau modèle MongoDB :**

```typescript
export interface IQuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  unit: 'unit' | 'hour' | 'day' | 'month' | 'kg';
}

export interface IQuote extends Document {
  userId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  quoteNumber: string; // Format: DEVIS-2025-0001
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  issueDate: Date;
  validUntil: Date; // Date d'expiration du devis
  convertedToInvoiceId?: mongoose.Types.ObjectId; // Lien vers facture créée
  convertedAt?: Date; // Date de conversion
  sentAt?: Date;
  
  items: IQuoteItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  
  notes?: string; // Notes publiques (visibles par client)
  privateNotes?: string; // Notes privées (internes)
  terms?: string; // Conditions du devis
  
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Différences avec Invoice :**
- Champ `quoteNumber` au lieu de `invoiceNumber`
- Statuts spécifiques : `accepted`, `rejected`, `expired`, `converted`
- Champ `validUntil` (durée de validité du devis)
- Champs `convertedToInvoiceId` et `convertedAt`
- Pas de champs de paiement (amountPaid, balanceDue, paymentMethod, etc.)

**Indexes :**
```typescript
QuoteSchema.index({ userId: 1, status: 1 });
QuoteSchema.index({ userId: 1, clientId: 1 });
QuoteSchema.index({ userId: 1, issueDate: -1 });
QuoteSchema.index({ quoteNumber: 1 }, { unique: true });
```

---

### 2. Service de numérotation - `quote-numbering.ts`

**Fichier :** `src/lib/services/quote-numbering.ts`

```typescript
// Génération automatique du numéro de devis
// Format: DEVIS-2025-0001, DEVIS-2025-0002...
export async function getNextQuoteNumber(userId: string): Promise<{quoteNumber: string}>
```

**Logique :**
- Préfixe : `DEVIS` (configurable par utilisateur plus tard)
- Format : `DEVIS-[ANNÉE]-[NUMÉRO]`
- Numérotation séquentielle par année
- Stockage dans `User.quoteNumbering` (nouveau champ)

---

### 3. APIs REST - `/api/quotes`

#### **POST /api/quotes** - Créer un devis
**Body :**
```json
{
  "clientId": "string",
  "issueDate": "2025-10-25",
  "validUntil": "2025-11-25",
  "items": [
    {
      "description": "Développement site web",
      "quantity": 1,
      "unitPrice": 5000,
      "taxRate": 20,
      "unit": "unit"
    }
  ],
  "notes": "Devis valable 30 jours",
  "terms": "Paiement à 30 jours"
}
```

**Réponse :** Devis créé avec numéro auto-généré

---

#### **GET /api/quotes** - Liste des devis
**Query params :**
- `status` : filtrer par statut
- `clientId` : filtrer par client
- `search` : recherche par numéro ou client

**Réponse :**
```json
[
  {
    "_id": "...",
    "quoteNumber": "DEVIS-2025-0001",
    "status": "sent",
    "clientId": {...},
    "total": 6000,
    ...
  }
]
```

---

#### **GET /api/quotes/[id]** - Détails d'un devis
**Réponse :** Devis complet avec populate du client

---

#### **PATCH /api/quotes/[id]** - Modifier un devis
**Body :** Champs à modifier (sauf quoteNumber)

**Règles de validation :**
- Un devis `converted` ne peut plus être modifié
- Un devis `accepted` ou `rejected` ne peut plus être modifié (seulement converti)

---

#### **DELETE /api/quotes/[id]** - Supprimer un devis
**Règles :**
- Un devis `converted` ne peut pas être supprimé
- Suppression logique possible (ajouter champ `deleted: boolean`)

---

#### **POST /api/quotes/[id]/convert** - Convertir en facture ⭐

**Action principale du module !**

**Processus :**
1. Vérifier que le devis existe et appartient à l'utilisateur
2. Vérifier que le statut est `accepted` ou `sent`
3. Créer une nouvelle facture avec :
   - `clientId` : même client
   - `items` : copie exacte des items du devis
   - `issueDate` : date du jour
   - `dueDate` : calculée selon délai de paiement client
   - `status` : `draft`
   - Montants copiés (subtotal, taxAmount, total)
   - `notes` et `terms` copiés
4. Mettre à jour le devis :
   - `status` = `converted`
   - `convertedToInvoiceId` = ID de la facture créée
   - `convertedAt` = Date actuelle
5. Retourner la facture créée

**Body :**
```json
{
  "issueDate": "2025-10-25", // Optionnel, défaut = aujourd'hui
  "dueDate": "2025-11-25"    // Optionnel, calculé selon client.paymentTerms
}
```

**Réponse :**
```json
{
  "success": true,
  "quote": { ...quote mis à jour... },
  "invoice": { ...nouvelle facture... }
}
```

---

#### **POST /api/quotes/[id]/pdf** - Générer PDF
Similaire à `/api/invoices/[id]/pdf` mais avec template devis

---

#### **POST /api/quotes/[id]/send** - Envoyer par email
Similaire à l'envoi de facture avec template email spécifique

---

### 4. Templates PDF - `quote-pdf-template.ts`

**Fichier :** `src/lib/templates/quote-pdf-template.ts`

**Adaptation du template Invoice :**
- Titre : **"DEVIS"** au lieu de "FACTURE"
- Numéro : `DEVIS-2025-0001`
- Champ "Valable jusqu'au" : afficher `validUntil`
- Pas de section paiement
- Section conditions du devis
- Mention légale : "Ce devis est valable jusqu'au [DATE]"

---

### 5. Templates Email - `quote-email.ts`

**Fichier :** `src/lib/templates/quote-email.ts`

**Sujet :** `Devis n°${quoteNumber} - ${companyName}`

**Corps HTML :**
```html
<h2>Nouveau devis</h2>
<p>Bonjour,</p>
<p>Veuillez trouver ci-joint le devis n°${quoteNumber} d'un montant de ${total}€.</p>
<p>Ce devis est valable jusqu'au ${validUntil}.</p>
<p><strong>Récapitulatif :</strong></p>
<ul>
  <li>Montant HT : ${subtotal}€</li>
  <li>TVA : ${taxAmount}€</li>
  <li>Total TTC : ${total}€</li>
</ul>
<p>Cordialement,<br>${companyName}</p>
```

---

### 6. Validation Zod - `validations.ts`

**Ajout dans `src/lib/validations.ts` :**

```typescript
export const quoteItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().min(0.001, 'Quantité doit être positive'),
  unitPrice: z.number().min(0, 'Prix doit être positif'),
  taxRate: z.number().min(0).max(100, 'Taux de TVA invalide'),
  unit: z.enum(['unit', 'hour', 'day', 'month', 'kg']).default('unit'),
});

export const quoteSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  items: z.array(quoteItemSchema).min(1, 'Au moins un article requis'),
  issueDate: z.union([z.string(), z.date()]),
  validUntil: z.union([z.string(), z.date()]),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).optional(),
  subtotal: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  notes: z.string().optional(),
  privateNotes: z.string().optional(),
  terms: z.string().optional(),
});

export const convertQuoteSchema = z.object({
  issueDate: z.union([z.string(), z.date()]).optional(),
  dueDate: z.union([z.string(), z.date()]).optional(),
});
```

---

## 🎨 INTERFACE UTILISATEUR

### 1. Page Devis - `/dashboard/quotes/page.tsx`

**Structure similaire à `/dashboard/invoices/page.tsx`**

**Composants :**
- `QuoteList.tsx` : Liste des devis avec filtres
- `QuoteCard.tsx` : Carte d'affichage d'un devis
- `QuoteFormModal.tsx` : Modal de création/édition
- `QuoteFilters.tsx` : Filtres (statut, client, date)
- `QuotePreview.tsx` : Prévisualisation avant PDF

---

### 2. Composant `QuoteList.tsx`

**Features :**
- Tableau responsive avec colonnes :
  - N° Devis
  - Client
  - Date d'émission
  - Valable jusqu'au
  - Montant
  - Statut (badge coloré)
  - Actions
- Filtres :
  - Par statut (draft, sent, accepted, rejected, expired, converted)
  - Par client (dropdown)
  - Recherche par numéro
- Actions :
  - 👁️ Voir
  - ✏️ Modifier (si draft ou sent)
  - 📧 Envoyer par email
  - 📄 Télécharger PDF
  - ✅ Marquer comme accepté
  - ❌ Marquer comme refusé
  - 🔄 **Convertir en facture** (bouton principal)
  - 🗑️ Supprimer

---

### 3. Composant `QuoteFormModal.tsx`

**Formulaire de création/édition :**

**Sections :**
1. **Informations générales**
   - Client (select)
   - Date d'émission (date picker)
   - Valable jusqu'au (date picker) - Par défaut +30 jours
   
2. **Lignes du devis**
   - Même interface que InvoiceFormModal
   - Description, Qté, Prix unitaire, TVA, Unité
   - Calculs automatiques (HT, TVA, TTC)
   - Bouton "+ Ajouter une ligne"

3. **Notes et conditions**
   - Notes publiques (textarea)
   - Notes privées (textarea)
   - Conditions du devis (textarea avec suggestions)

4. **Récapitulatif**
   - Total HT
   - Total TVA
   - Total TTC

**Validation :**
- Client obligatoire
- Date d'expiration > Date d'émission
- Au moins une ligne
- Tous les champs ligne obligatoires

---

### 4. Badge de Statut

**Codes couleur :**
```tsx
const statusConfig = {
  draft: { label: '📝 Brouillon', color: 'gray' },
  sent: { label: '📤 Envoyé', color: 'blue' },
  accepted: { label: '✅ Accepté', color: 'green' },
  rejected: { label: '❌ Refusé', color: 'red' },
  expired: { label: '⏰ Expiré', color: 'orange' },
  converted: { label: '🔄 Converti', color: 'purple' }
}
```

---

### 5. Modal de Conversion

**Composant :** `ConvertQuoteModal.tsx`

**Affichage :**
```
┌─────────────────────────────────────┐
│  🔄 Convertir le devis en facture   │
├─────────────────────────────────────┤
│                                     │
│  Devis : DEVIS-2025-0001            │
│  Client : ABC Corp                  │
│  Montant : 6 000,00 €               │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Date d'émission de la facture │ │
│  │ [25/10/2025]                  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Date d'échéance               │ │
│  │ [25/11/2025]                  │ │
│  │ (Calculé selon délai client)  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ℹ️ Une facture sera créée avec    │
│     les mêmes articles et montants │
│                                     │
│  [Annuler]  [✅ Convertir]         │
└─────────────────────────────────────┘
```

**Actions :**
1. Cliquer sur "Convertir" dans la liste
2. Modal s'ouvre avec dates pré-remplies
3. Utilisateur peut ajuster les dates
4. Clic sur "Convertir" :
   - Appel API `/api/quotes/[id]/convert`
   - Affichage notification succès
   - Redirection vers la facture créée (optionnel)
   - Mise à jour de la liste des devis

---

### 6. Navigation

**Ajout dans le menu Dashboard :**
```tsx
<Link href="/dashboard/quotes">
  📋 Devis
</Link>
```

**Badge avec nombre de devis en attente :**
```tsx
📋 Devis (3) // 3 devis en attente (sent)
```

---

### 7. Dashboard - Statistiques Devis

**Ajout dans `DashboardOverview.tsx` :**

**Nouvelles cards :**
- 📋 **Devis en attente** : Nombre de devis envoyés
- ✅ **Taux d'acceptation** : % devis acceptés / envoyés
- 💰 **CA potentiel** : Somme des devis envoyés

**Section "Derniers devis" :**
- Liste des 5 derniers devis
- Lien "Voir tous les devis"

---

## 🔄 CYCLE DE VIE D'UN DEVIS

```
1. CRÉATION (draft)
   ↓
2. ENVOI (sent) ← Envoi email au client
   ↓
3a. ACCEPTÉ (accepted) → CONVERSION EN FACTURE
   ↓
   CONVERTI (converted) ✅
   
3b. REFUSÉ (rejected) ❌
   
3c. EXPIRÉ (expired) ⏰
   ↓
   Réactivation possible → Nouveau devis
```

---

## 📊 GESTION DES EXPIRATIONS

**Système automatique de détection des devis expirés :**

**Cron Job / Scheduled Task :**
- Fréquence : 1x par jour (minuit)
- Endpoint : `/api/cron/expire-quotes`
- Action : 
  ```typescript
  await Quote.updateMany(
    {
      status: 'sent',
      validUntil: { $lt: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
  ```

**Alternative sans cron :**
- Vérification dynamique à l'affichage
- Middleware sur GET `/api/quotes`

---

## 🧪 TESTS À RÉALISER

### Tests unitaires
- ✅ Validation Zod des schémas
- ✅ Génération numéro de devis
- ✅ Conversion devis → facture
- ✅ Calculs (subtotal, taxAmount, total)

### Tests d'intégration
- ✅ Création d'un devis
- ✅ Envoi par email
- ✅ Conversion en facture
- ✅ Génération PDF
- ✅ Gestion des statuts

### Tests E2E
- ✅ Parcours complet : Création → Envoi → Acceptation → Conversion
- ✅ Modification d'un devis draft
- ✅ Expiration automatique

---

## 📝 RÈGLES MÉTIER

1. **Un devis ne peut être modifié que si :**
   - Statut = `draft` ou `sent`
   - Non converti

2. **Un devis peut être supprimé que si :**
   - Statut ≠ `converted`
   - Ou suppression logique (soft delete)

3. **Conversion possible uniquement si :**
   - Statut = `sent` ou `accepted`
   - Non expiré
   - Non déjà converti

4. **Expiration automatique si :**
   - Statut = `sent`
   - `validUntil` < Date actuelle

5. **Numérotation :**
   - Séquentielle par année
   - Pas de réutilisation de numéros
   - Format configurable par utilisateur

---

## 🚀 PLAN DE DÉVELOPPEMENT

### Phase 1 : Modèle & APIs (2-3 jours)
- [x] Créer modèle `Quote.ts`
- [ ] Service `quote-numbering.ts`
- [ ] API CRUD `/api/quotes`
- [ ] API conversion `/api/quotes/[id]/convert`
- [ ] Validation Zod

### Phase 2 : Interface (2-3 jours)
- [ ] Page `/dashboard/quotes`
- [ ] Composant `QuoteList.tsx`
- [ ] Composant `QuoteFormModal.tsx`
- [ ] Composant `ConvertQuoteModal.tsx`
- [ ] Filtres et recherche

### Phase 3 : PDF & Email (1-2 jours)
- [ ] Template PDF devis
- [ ] Template email devis
- [ ] API génération PDF
- [ ] API envoi email

### Phase 4 : Features avancées (1-2 jours)
- [ ] Gestion expirations
- [ ] Dashboard stats devis
- [ ] Historique conversions
- [ ] Export CSV

### Phase 5 : Tests & Polish (1 jour)
- [ ] Tests unitaires
- [ ] Tests E2E
- [ ] Corrections bugs
- [ ] Documentation

**TOTAL : 7-11 jours**

---

## 📦 LIVRABLES

1. ✅ Modèle `Quote` opérationnel
2. ✅ APIs REST complètes
3. ✅ Interface de gestion des devis
4. ✅ Conversion devis → facture
5. ✅ Génération PDF
6. ✅ Envoi email
7. ✅ Documentation utilisateur
8. ✅ Tests complets

---

## 🎯 CRITÈRES DE SUCCÈS

- ✅ Création d'un devis en < 2 minutes
- ✅ Conversion devis → facture en 1 clic
- ✅ PDF généré automatiquement
- ✅ Email envoyé automatiquement
- ✅ Taux d'acceptation visible
- ✅ Aucune perte de données lors conversion
- ✅ Interface intuitive (même UX que factures)

---

## 🔮 ÉVOLUTIONS FUTURES (V2)

1. **Signatures électroniques**
   - Client signe le devis en ligne
   - Validation juridique
   - Archivage sécurisé

2. **Devis multi-versions**
   - Versioning des devis
   - Comparaison de versions
   - Historique des modifications

3. **Templates de devis**
   - Bibliothèque de devis types
   - Duplication rapide
   - Variables personnalisables

4. **Relances automatiques**
   - Relance si pas de réponse après X jours
   - Templates de relance
   - Statistiques de conversion

5. **Acceptation en ligne**
   - Lien public pour accepter/refuser
   - Page dédiée client
   - Signature en ligne

---

**FIN DU CAHIER DES CHARGES DEVIS**
