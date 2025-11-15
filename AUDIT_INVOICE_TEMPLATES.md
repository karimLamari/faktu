# 🎨 AUDIT COMPLET - SYSTÈME DE TEMPLATES DE FACTURES

**Date :** 15 novembre 2025  
**Version App :** BLINK Invoice v2.0  
**Auditeur :** GitHub Copilot

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture du Système](#architecture-du-système)
3. [Modèle de Données](#modèle-de-données)
4. [API Routes](#api-routes)
5. [Workflow Complet](#workflow-complet)
6. [Templates Disponibles](#templates-disponibles)
7. [Génération PDF](#génération-pdf)
8. [Validation & Sécurité](#validation--sécurité)
9. [Problèmes Identifiés](#problèmes-identifiés)
10. [Recommandations](#recommandations)

---

## 🎯 VUE D'ENSEMBLE

### Système Actuel

Le système de templates de factures permet aux utilisateurs de personnaliser l'apparence de leurs factures PDF avec :
- ✅ 4 templates prédéfinis (Moderne, Classique, Minimaliste, Créatif)
- ✅ Personnalisation complète (couleurs, polices, layout, sections)
- ✅ Système de template par défaut par utilisateur
- ✅ Limites par plan (FREE: 1, PRO: 5, BUSINESS: unlimited)
- ✅ Génération PDF avec @react-pdf/renderer

### Technologies Utilisées

```typescript
- MongoDB + Mongoose (persistance)
- Zod (validation)
- @react-pdf/renderer (génération PDF)
- Next.js 15 App Router (API)
- TypeScript (typage fort)
```

---

## 🏗️ ARCHITECTURE DU SYSTÈME

### Structure des Dossiers

```
src/
├── models/
│   └── InvoiceTemplate.ts          # ✅ Modèle MongoDB complet
├── lib/
│   ├── invoice-templates/
│   │   ├── index.ts                # ✅ Exports centralisés
│   │   ├── types.ts                # ✅ Re-exports des types
│   │   ├── config/
│   │   │   ├── presets.ts          # ✅ 4 templates prédéfinis
│   │   │   └── legal-mentions.ts   # ✅ Mentions légales
│   │   ├── core/
│   │   │   ├── router.tsx          # ✅ Routeur de templates
│   │   │   ├── validation.ts       # ✅ Schémas Zod
│   │   │   └── utils.ts            # ✅ Helpers (TVA, format)
│   │   ├── templates/
│   │   │   ├── ModerneTemplate.tsx    # ✅ Sidebar layout
│   │   │   ├── ClassiqueTemplate.tsx  # ✅ Vertical formel
│   │   │   ├── MinimalisteTemplate.tsx # ✅ Centré épuré
│   │   │   └── CreatifTemplate.tsx    # ✅ Diagonal asymétrique
│   │   └── components/
│   │       ├── TemplatePreview.tsx     # ✅ Aperçu navigateur
│   │       ├── TemplateSelector.tsx    # ✅ Sélecteur UI
│   │       └── TemplateCustomizer.tsx  # ✅ Éditeur complet
│   └── services/
│       └── pdf-generator.tsx       # ✅ Service génération PDF
└── app/
    ├── api/
    │   └── invoice-templates/
    │       ├── route.ts            # ✅ GET, POST, DELETE
    │       └── [id]/
    │           └── route.ts        # ✅ GET, PATCH
    ├── dashboard/
    │   └── settings/
    │       └── invoice-templates/
    │           └── page.tsx        # ✅ UI gestion templates
    └── api/invoices/[id]/pdf/
        └── route.ts                # ✅ Génération PDF facture
```

---

## 📊 MODÈLE DE DONNÉES

### Interface TypeScript (`IInvoiceTemplate`)

```typescript
interface IInvoiceTemplate extends Document {
  // Identité
  userId: ObjectId;           // ✅ Référence User (indexed)
  name: string;               // ✅ Nom du template (1-100 chars)
  description?: string;       // ✅ Description optionnelle (max 500)
  isDefault: boolean;         // ✅ Template par défaut (indexed)
  
  // Configuration visuelle
  colors: ITemplateColors;    // ✅ 5 couleurs (primary, secondary, accent, text, bg)
  fonts: ITemplateFonts;      // ✅ Polices + tailles (heading, body, small)
  layout: ITemplateLayout;    // ✅ Position logo, style header, spacing
  sections: ITemplateSections; // ✅ 7 sections activables (logo, bank, legal...)
  customText: ITemplateCustomText; // ✅ Textes personnalisés (titre, labels, mentions)
  
  // Timestamps
  createdAt: Date;            // ✅ Auto (Mongoose timestamps)
  updatedAt: Date;            // ✅ Auto (Mongoose timestamps)
}
```

### Sous-structures Détaillées

#### 1️⃣ **ITemplateColors**
```typescript
{
  primary: string;      // Couleur principale (header, titres)
  secondary: string;    // Couleur secondaire (sous-titres, labels)
  accent: string;       // Couleur d'accent (montants, badges)
  text: string;         // Couleur texte principal
  background: string;   // Couleur fond
}
// Validation: Regex /^#[0-9A-F]{6}$/i
```

#### 2️⃣ **ITemplateFonts**
```typescript
{
  heading: string;      // Police titres (ex: "Helvetica")
  body: string;         // Police corps de texte
  size: {
    base: number;       // Taille base (8-16)
    heading: number;    // Taille titres (16-36)
    small: number;      // Taille petits textes (6-12)
  }
}
```

#### 3️⃣ **ITemplateLayout**
```typescript
{
  logoPosition: 'left' | 'center' | 'right';
  logoSize: 'small' | 'medium' | 'large';
  headerStyle: 'modern' | 'classic' | 'minimal';
  borderRadius: number;    // 0-20
  spacing: 'compact' | 'normal' | 'relaxed';
}
```

#### 4️⃣ **ITemplateSections**
```typescript
{
  showLogo: boolean;              // Afficher logo entreprise
  showBankDetails: boolean;       // Coordonnées bancaires
  showPaymentTerms: boolean;      // Modalités de paiement
  showLegalMentions: boolean;     // Mentions légales
  showItemDetails: boolean;       // Détails lignes facture
  showCompanyDetails: boolean;    // Infos entreprise
  showClientDetails: boolean;     // Infos client
}
```

#### 5️⃣ **ITemplateCustomText**
```typescript
{
  invoiceTitle: string;           // "FACTURE" par défaut
  paymentTermsLabel: string;      // "Modalités de paiement"
  bankDetailsLabel: string;       // "Coordonnées Bancaires"
  legalMentions: string;          // Texte des mentions légales
  legalMentionsType?: string;     // 'micro-entreprise' | 'societe-standard' | ...
  footerText?: string;            // Texte pied de page optionnel
}
```

### Schema Mongoose

✅ **Validations actives :**
- Longueurs min/max sur strings
- Enums stricts sur valeurs fixes
- Regex pour couleurs hexadécimales
- Index composé `{ userId: 1, isDefault: 1 }`
- Index simple sur `userId` et `isDefault`

✅ **Middleware pre-save :**
```typescript
// Garantit un seul template isDefault=true par utilisateur
InvoiceTemplateSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Désactive tous les autres templates par défaut via transaction
    await InvoiceTemplate.updateMany(
      { userId: this.userId, _id: { $ne: this._id }, isDefault: true },
      { $set: { isDefault: false } }
    );
  }
  next();
});
```

### ⚠️ **PROBLÈME IDENTIFIÉ #1**
Le champ `legalMentionsType` n'est **pas validé** dans le schema Zod de l'API mais existe dans le modèle Mongoose.

---

## 🔌 API ROUTES

### 1. **GET /api/invoice-templates**

**Fonction :** Récupère tous les templates de l'utilisateur  
**Auth :** ✅ Requise (session)  
**Filtrage :** ✅ Par userId automatique  
**Tri :** `isDefault: -1, createdAt: -1` (défaut en premier)

```typescript
// Réponse
[
  {
    _id: "67...",
    userId: "68...",
    name: "Moderne",
    isDefault: true,
    colors: { ... },
    fonts: { ... },
    layout: { ... },
    sections: { ... },
    customText: { ... },
    createdAt: "2025-11-15T...",
    updatedAt: "2025-11-15T..."
  },
  // ... autres templates
]
```

**✅ Sécurité :** Filtrage userId correct  
**✅ Performance :** Index utilisé efficacement

---

### 2. **POST /api/invoice-templates**

**Fonction :** Crée un nouveau template  
**Auth :** ✅ Requise  
**Validation :** ✅ Zod complète  
**Limites :** ✅ Vérifiées (FREE: 1, PRO: 5, BUSINESS: ∞)

```typescript
// Body requis (tous les champs obligatoires)
{
  name: string,
  description?: string,
  isDefault?: boolean,
  colors: { primary, secondary, accent, text, background },
  fonts: { heading, body, size: { base, heading, small } },
  layout: { logoPosition, logoSize, headerStyle, borderRadius, spacing },
  sections: { showLogo, showBankDetails, ... },
  customText: { invoiceTitle, paymentTermsLabel, ... }
}
```

**Logique limites :**
```typescript
const templateLimit = PLANS[plan].templates;
const existingCount = await InvoiceTemplate.countDocuments({ userId });

if (templateLimit !== 'unlimited' && existingCount >= templateLimit) {
  return 403 { error: 'Limite de modèles atteinte', ... };
}
```

**✅ Points positifs :**
- Vérification limites avant création
- Validation Zod stricte
- Retour explicite avec limite actuelle

**⚠️ PROBLÈME IDENTIFIÉ #2**
Le champ `customText.legalMentionsType` n'est pas validé dans le schema Zod mais accepté par Mongoose.

---

### 3. **PATCH /api/invoice-templates/[id]**

**Fonction :** Met à jour un template existant  
**Auth :** ✅ Requise  
**Validation :** ✅ Zod partielle (`.partial()`)  
**Ownership :** ✅ Vérifiée (`userId` filtré)

```typescript
// Body (tous champs optionnels)
{
  name?: string,
  isDefault?: boolean,
  colors?: { ... },
  // ... autres champs
}
```

**Logique isDefault :**
```typescript
if (validatedData.isDefault) {
  // Désactive TOUS les autres templates par défaut
  await InvoiceTemplate.updateMany(
    { userId: session.user.id, _id: { $ne: id }, isDefault: true },
    { $set: { isDefault: false } }
  );
}
```

**✅ Points positifs :**
- Mise à jour atomique du flag isDefault
- Validation partielle flexible
- Retour du document mis à jour (`{ new: true }`)

**⚠️ PROBLÈME IDENTIFIÉ #3**
Pas de transaction ici contrairement au middleware pre-save du modèle. Risque de race condition minime mais existant.

---

### 4. **DELETE /api/invoice-templates** (via query param)

**Fonction :** Supprime un template  
**Auth :** ✅ Requise  
**Ownership :** ✅ Vérifiée  
**Méthode :** Query param `?id=...`

```typescript
// URL: /api/invoice-templates?id=67...
const templateId = searchParams.get('id');
await InvoiceTemplate.deleteOne({ _id: templateId });
```

**⚠️ PROBLÈME IDENTIFIÉ #4**
**Pas de vérification si le template supprimé était le template par défaut !**  
Si on supprime le template avec `isDefault: true`, aucun template par défaut ne subsiste pour cet utilisateur.

**Recommandation :**
```typescript
// Avant suppression
const template = await InvoiceTemplate.findOne({ _id, userId });
if (template.isDefault) {
  // Définir un autre template comme défaut OU créer un template par défaut automatiquement
  const nextTemplate = await InvoiceTemplate.findOne({ userId, _id: { $ne: _id } });
  if (nextTemplate) {
    nextTemplate.isDefault = true;
    await nextTemplate.save();
  }
}
await InvoiceTemplate.deleteOne({ _id });
```

---

### 5. **GET /api/invoice-templates/[id]**

**Fonction :** Récupère un template spécifique  
**Auth :** ✅ Requise  
**Validation ID :** ✅ `mongoose.Types.ObjectId.isValid(id)`  
**Ownership :** ✅ Filtrée

```typescript
const template = await InvoiceTemplate.findOne({ 
  _id: id, 
  userId: session.user.id 
});
```

**✅ Implémentation correcte et sécurisée**

---

## 🔄 WORKFLOW COMPLET

### 📌 Étape 1 : Création d'un Template (UI)

**Page :** `/dashboard/settings/invoice-templates`

```typescript
// Composant: TemplateCustomizer
1. User sélectionne un preset (Moderne, Classique, Minimal, Créatif)
2. User personnalise :
   - Couleurs (color pickers)
   - Polices (dropdowns)
   - Layout (position logo, style header)
   - Sections visibles (toggles)
   - Textes personnalisés (textareas)
3. Aperçu en temps réel avec TemplatePreview
4. Submit → POST /api/invoice-templates
```

**✅ Validation côté client :** React Hook Form + Zod  
**✅ Aperçu temps réel :** `<TemplatePreview>` avec données sample

---

### 📌 Étape 2 : Récupération des Templates

```typescript
// Dans InvoiceList ou InvoiceCard
useEffect(() => {
  const fetchTemplates = async () => {
    const response = await fetch('/api/invoice-templates');
    const templates = await response.json();
    setTemplates(templates);
    
    // Template par défaut
    const defaultTemplate = templates.find(t => t.isDefault);
    setCurrentTemplate(defaultTemplate || DEFAULT_TEMPLATE);
  };
  fetchTemplates();
}, []);
```

**Fallback :** Si aucun template utilisateur, utiliser `DEFAULT_TEMPLATE` (Moderne)

---

### 📌 Étape 3 : Génération PDF Facture

**Route API :** `GET /api/invoices/[id]/pdf`

```typescript
// WORKFLOW COMPLET
1. Auth & récupération invoice/client/user
2. Vérification profil complet (isProfileComplete)
3. Récupération template par défaut
   const userTemplate = await InvoiceTemplate.findOne({ 
     userId, 
     isDefault: true 
   });
4. Fallback si pas de template
   const template = userTemplate || DEFAULT_TEMPLATE;
5. Validation template (validateTemplate)
6. Génération PDF via pdf-generator
   const pdfBuffer = await generateInvoicePdf({ 
     invoice, 
     client, 
     user, 
     template 
   });
7. Retour PDF en stream
```

**✅ Points positifs :**
- Vérification profil avant génération
- Fallback template automatique
- Validation template avant usage

---

### 📌 Étape 4 : Routage du Template (router.tsx)

```typescript
export const InvoicePDF: React.FC = ({ invoice, client, user, template }) => {
  switch (template.name) {
    case 'Classique':
      return <ClassiqueTemplate {...props} />;
    case 'Minimaliste':
      return <MinimalisteTemplate {...props} />;
    case 'Créatif':
      return <CreatifTemplate {...props} />;
    case 'Moderne':
    default:
      return <ModerneTemplate {...props} />;
  }
};
```

**✅ Architecture propre :** Chaque template gère ses propres styles  
**✅ Fallback :** Template Moderne par défaut

---

### 📌 Étape 5 : Rendu PDF (@react-pdf/renderer)

**Exemple : ModerneTemplate**

```typescript
export const ModerneTemplate: React.FC = ({ invoice, client, user, template }) => {
  const { colors, sections, customText, fonts, layout } = template;
  
  // Calculs dynamiques
  const vatByRate = calculateVATByRate(invoice);
  
  // Styles StyleSheet.create()
  const styles = StyleSheet.create({
    page: { flexDirection: 'row', ... },
    sidebar: { width: '30%', backgroundColor: colors.primary, ... },
    mainContent: { width: '70%', ... },
    // ... 50+ styles
  });
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar gauche colorée */}
        <View style={styles.sidebar}>
          {sections.showLogo && <Image src={...} />}
          <Text style={styles.sidebarCompanyName}>{user.companyName}</Text>
          {/* ... coordonnées entreprise */}
        </View>
        
        {/* Contenu principal */}
        <View style={styles.mainContent}>
          <Text style={styles.invoiceTitle}>{customText.invoiceTitle}</Text>
          <Text>{invoice.invoiceNumber}</Text>
          {/* ... tableau items, totaux, TVA */}
        </View>
      </Page>
    </Document>
  );
};
```

**✅ Fonctionnalités :**
- Utilisation complète des props template
- Conditions sur `sections.*` pour afficher/masquer
- Styles dynamiques basés sur `colors`, `fonts`, `layout`
- Calcul TVA par taux
- Formatage currency/percentage

---

## 🎨 TEMPLATES DISPONIBLES

### 1. **MODERNE** (Template par défaut)

**Structure :** Sidebar layout  
**Style :** Épuré, couleurs vives, sans-serif  
**Layout :**
- 30% gauche : Sidebar colorée (infos entreprise, logo, coordonnées)
- 70% droite : Contenu facture (items, totaux)

**Couleurs par défaut :**
```typescript
{
  primary: '#2563eb',    // Bleu vif
  secondary: '#64748b',  // Gris
  accent: '#10b981',     // Vert
  text: '#1e293b',       // Noir profond
  background: '#ffffff'  // Blanc
}
```

**Sections par défaut :** Toutes activées  
**Police :** Helvetica  
**Distinction :** Sidebar latérale unique

---

### 2. **CLASSIQUE**

**Structure :** Vertical formel  
**Style :** Traditionnel, bordures doubles décoratives  
**Layout :**
- Header centré avec bordure supérieure épaisse
- Logo centré
- Mise en page verticale symétrique
- Bordure double décorative

**Couleurs par défaut :**
```typescript
{
  primary: '#1e40af',    // Bleu marine
  secondary: '#6b7280',  // Gris neutre
  accent: '#059669',     // Vert émeraude
  text: '#111827',       // Noir
  background: '#ffffff'
}
```

**Police :** Times (serif)  
**Distinction :** Formel, bordures décoratives

---

### 3. **MINIMALISTE**

**Structure :** Centré vertical, list-based (pas de tableau)  
**Style :** Épuré, espaces blancs, sans bordures  
**Layout :**
- Logo centré petit
- Liste verticale des items (pas de tableau)
- Totaux en fin de page
- Maximum d'espaces blancs

**Couleurs par défaut :**
```typescript
{
  primary: '#475569',    // Gris ardoise
  secondary: '#94a3b8',  // Gris clair
  accent: '#0ea5e9',     // Bleu ciel
  text: '#334155',       // Gris foncé
  background: '#ffffff'
}
```

**Police :** Helvetica Light  
**Distinction :** Pas de tableau, liste simple

---

### 4. **CRÉATIF**

**Structure :** Asymétrique avec header diagonal  
**Style :** Moderne, dynamique, barre d'accent diagonale  
**Layout :**
- Header diagonal avec dégradé
- Logo en haut à gauche
- Barre d'accent colorée sur le côté
- Mise en page décalée

**Couleurs par défaut :**
```typescript
{
  primary: '#7c3aed',    // Violet
  secondary: '#8b5cf6',  // Violet clair
  accent: '#ec4899',     // Rose
  text: '#1e293b',       // Noir profond
  background: '#ffffff'
}
```

**Police :** Helvetica  
**Distinction :** Header diagonal unique

---

## 📄 GÉNÉRATION PDF

### Service : `pdf-generator.tsx`

```typescript
export async function generateInvoicePdf({
  invoice,
  client,
  user,
  template,
}: {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}): Promise<Buffer> {
  try {
    const pdfBuffer = await renderToBuffer(
      <InvoicePDF invoice={invoice} client={client} user={user} template={template} />
    );
    return pdfBuffer;
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}
```

**✅ Points positifs :**
- Utilise `@react-pdf/renderer` (performant)
- Gestion erreur avec contexte
- Type Buffer retourné directement

**⚠️ PROBLÈME IDENTIFIÉ #5**
Pas de validation que `template` est bien du type `TemplatePreset` avant génération. Si template corrompu en DB, crash possible.

---

### Helpers Utilitaires (`core/utils.ts`)

#### 1. **calculateVATByRate**
```typescript
export function calculateVATByRate(invoice: any): Record<string, { rate: number; amount: number }> {
  const vatByRate: Record<string, { rate: number; amount: number }> = {};
  
  invoice.items.forEach((item: any) => {
    const rate = item.vatRate || 0;
    const rateKey = `${rate}`;
    const vatAmount = (item.total * rate) / 100;
    
    if (!vatByRate[rateKey]) {
      vatByRate[rateKey] = { rate, amount: 0 };
    }
    vatByRate[rateKey].amount += vatAmount;
  });
  
  return vatByRate;
}
```

**Usage :** Afficher TVA par taux dans PDF (ex: TVA 20% : 40.00 €, TVA 5.5% : 5.50 €)

#### 2. **formatCurrency**
```typescript
export function formatCurrency(amount: number): string {
  return amount.toFixed(2).replace('.', ',') + ' €';
}
```

#### 3. **formatPercentage**
```typescript
export function formatPercentage(percent: number): string {
  return `${percent}%`;
}
```

**✅ Formatage français correct**

---

## 🔒 VALIDATION & SÉCURITÉ

### Validation Zod (API)

**Fichier :** `src/app/api/invoice-templates/route.ts`

```typescript
const templateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
    accent: z.string().regex(/^#[0-9A-F]{6}$/i),
    text: z.string().regex(/^#[0-9A-F]{6}$/i),
    background: z.string().regex(/^#[0-9A-F]{6}$/i),
  }),
  fonts: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    size: z.object({
      base: z.number().min(8).max(16),
      heading: z.number().min(16).max(36),
      small: z.number().min(6).max(12),
    }),
  }),
  layout: z.object({
    logoPosition: z.enum(['left', 'center', 'right']),
    logoSize: z.enum(['small', 'medium', 'large']),
    headerStyle: z.enum(['modern', 'classic', 'minimal']),
    borderRadius: z.number().min(0).max(20),
    spacing: z.enum(['compact', 'normal', 'relaxed']),
  }),
  sections: z.object({
    showLogo: z.boolean(),
    showBankDetails: z.boolean(),
    showPaymentTerms: z.boolean(),
    showLegalMentions: z.boolean(),
    showItemDetails: z.boolean(),
    showCompanyDetails: z.boolean(),
    showClientDetails: z.boolean(),
  }),
  customText: z.object({
    invoiceTitle: z.string().min(1),
    paymentTermsLabel: z.string().min(1),
    bankDetailsLabel: z.string().min(1),
    legalMentions: z.string(),
    footerText: z.string().optional(),
  }),
});
```

**✅ Validation stricte :**
- Regex couleurs hexadécimales
- Min/max sur tailles polices
- Enums sur valeurs fixes

**❌ MANQUE :**
- `customText.legalMentionsType` non validé

---

### Validation Template avant PDF

**Fichier :** `src/lib/invoice-templates/core/validation.ts`

```typescript
export function validateTemplate(
  template: any, 
  fallback: TemplatePreset
): TemplatePreset {
  try {
    // Valide chaque section
    const validColors = TemplateColorsSchema.parse(template.colors);
    const validFonts = TemplateFontsSchema.parse(template.fonts);
    const validLayout = TemplateLayoutSchema.parse(template.layout);
    const validSections = TemplateSectionsSchema.parse(template.sections);
    const validCustomText = TemplateCustomTextSchema.parse(template.customText);
    
    return {
      name: template.name || fallback.name,
      description: template.description,
      colors: validColors,
      fonts: validFonts,
      layout: validLayout,
      sections: validSections,
      customText: validCustomText,
    };
  } catch (error) {
    console.error('❌ Template invalide, fallback utilisé:', error);
    return fallback;
  }
}
```

**✅ Sécurité robuste :** Fallback automatique si template corrompu

---

### Sécurité API

#### ✅ **Authentification**
Toutes les routes vérifient la session :
```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}
```

#### ✅ **Filtrage userId**
Toutes les requêtes filtrent par `userId` :
```typescript
const templates = await InvoiceTemplate.find({ userId: session.user.id });
```

#### ✅ **Validation ObjectId**
```typescript
if (!mongoose.Types.ObjectId.isValid(id)) {
  return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
}
```

#### ✅ **Limites par plan**
Vérification avant création :
```typescript
const existingCount = await InvoiceTemplate.countDocuments({ userId });
if (templateLimit !== 'unlimited' && existingCount >= templateLimit) {
  return 403;
}
```

---

## ⚠️ PROBLÈMES IDENTIFIÉS

### 🔴 CRITIQUE

Aucun problème critique identifié. Le système est fonctionnel et sécurisé.

---

### 🟠 IMPORTANT

#### **Problème #1 : Champ `legalMentionsType` non validé**

**Localisation :** `src/app/api/invoice-templates/route.ts`

**Impact :** Le champ existe dans le modèle Mongoose mais n'est pas validé dans Zod. Un utilisateur pourrait envoyer n'importe quelle valeur.

**Solution :**
```typescript
// Dans templateSchema (POST) et templatePartialSchema (PATCH)
customText: z.object({
  // ... autres champs
  legalMentionsType: z.enum([
    'micro-entreprise',
    'societe-standard',
    'profession-liberale',
    'artisan-commercant',
    'association'
  ]).optional(),
})
```

---

#### **Problème #2 : Pas de transaction dans PATCH isDefault**

**Localisation :** `src/app/api/invoice-templates/[id]/route.ts`

**Impact :** Risque de race condition si deux requêtes simultanées tentent de définir `isDefault: true`.

**Solution :**
```typescript
if (validatedData.isDefault) {
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    await InvoiceTemplate.updateMany(
      { userId: session.user.id, _id: { $ne: id }, isDefault: true },
      { $set: { isDefault: false } },
      { session }
    );
    
    await InvoiceTemplate.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: validatedData },
      { new: true, runValidators: true, session }
    );
  });
}
```

---

#### **Problème #3 : Suppression template par défaut**

**Localisation :** `src/app/api/invoice-templates/route.ts` (DELETE)

**Impact :** Si on supprime le template avec `isDefault: true`, aucun template par défaut ne subsiste.

**Solution :**
```typescript
const template = await InvoiceTemplate.findOne({ _id: templateId, userId });
if (!template) {
  return NextResponse.json({ error: 'Modèle non trouvé' }, { status: 404 });
}

// Si c'est le template par défaut, en définir un autre
if (template.isDefault) {
  const nextTemplate = await InvoiceTemplate.findOne({ 
    userId, 
    _id: { $ne: templateId } 
  }).sort({ createdAt: -1 });
  
  if (nextTemplate) {
    nextTemplate.isDefault = true;
    await nextTemplate.save();
  }
}

await InvoiceTemplate.deleteOne({ _id: templateId });
```

---

#### **Problème #4 : Pas de validation type TemplatePreset avant génération PDF**

**Localisation :** `src/lib/services/pdf-generator.tsx`

**Impact :** Si template corrompu en DB (malgré validation), crash possible lors de génération PDF.

**Solution :**
```typescript
export async function generateInvoicePdf({
  invoice,
  client,
  user,
  template,
}: {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}): Promise<Buffer> {
  try {
    // Validation défensive
    const validatedTemplate = validateTemplate(template, DEFAULT_TEMPLATE);
    
    const pdfBuffer = await renderToBuffer(
      <InvoicePDF 
        invoice={invoice} 
        client={client} 
        user={user} 
        template={validatedTemplate} 
      />
    );
    return pdfBuffer;
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}
```

---

### 🟡 MINEUR

#### **Problème #5 : Logs console.error en production**

**Localisation :** Multiples fichiers (`pdf-generator.tsx`, routes API)

**Impact :** Logs verbeux en production.

**Solution :** Utiliser un logger conditionnel :
```typescript
if (process.env.NODE_ENV === 'development') {
  console.error('Error generating invoice PDF:', error);
}
// En production, logger vers Sentry ou service externe
```

---

#### **Problème #6 : Pas de pagination sur GET /api/invoice-templates**

**Localisation :** `src/app/api/invoice-templates/route.ts`

**Impact :** Si un utilisateur BUSINESS a 100+ templates, la requête pourrait être lente.

**Solution :**
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;
  
  const templates = await InvoiceTemplate.find({ userId })
    .sort({ isDefault: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await InvoiceTemplate.countDocuments({ userId });
  
  return NextResponse.json({
    templates,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}
```

---

## ✅ RECOMMANDATIONS

### 🎯 Priorité HAUTE

1. **Ajouter validation `legalMentionsType`** dans schemas Zod API
2. **Implémenter transaction** pour PATCH isDefault
3. **Gérer suppression template par défaut** (réassigner automatiquement)
4. **Ajouter validation défensive** dans `generateInvoicePdf()`

---

### 🎯 Priorité MOYENNE

5. **Implémenter pagination** sur GET /api/invoice-templates
6. **Ajouter tests unitaires** pour chaque template (rendu PDF)
7. **Logger erreurs vers service externe** (Sentry) au lieu de console.error
8. **Ajouter index MongoDB** sur `{ userId: 1, createdAt: -1 }` pour tri optimisé

---

### 🎯 Priorité BASSE

9. **Créer endpoint GET /api/invoice-templates/default** pour récupérer uniquement le template par défaut
10. **Ajouter champ `usageCount`** dans InvoiceTemplate pour tracker utilisation
11. **Implémenter soft delete** pour templates (champ `deletedAt`)
12. **Ajouter preview PNG/JPEG** des templates en plus du PDF

---

## 📊 TABLEAU DE SYNTHÈSE

| Composant | État | Validation | Sécurité | Performance | Recommandations |
|-----------|------|------------|----------|-------------|-----------------|
| **Modèle InvoiceTemplate** | ✅ Complet | ✅ Mongoose OK | ✅ Index OK | ✅ Optimisé | RAS |
| **API GET /templates** | ✅ Fonctionnel | ✅ Auth OK | ✅ Filtrage OK | ⚠️ Pas pagination | Ajouter pagination |
| **API POST /templates** | ⚠️ Validation partielle | ⚠️ legalMentionsType | ✅ Limites OK | ✅ OK | Valider legalMentionsType |
| **API PATCH /templates/[id]** | ⚠️ Race condition | ⚠️ Pas transaction | ✅ Ownership OK | ✅ OK | Ajouter transaction |
| **API DELETE /templates** | ⚠️ Gestion isDefault | ✅ Auth OK | ✅ Ownership OK | ✅ OK | Réassigner isDefault |
| **pdf-generator.tsx** | ⚠️ Pas validation défensive | ⚠️ Type any | ✅ OK | ✅ OK | Valider template avant PDF |
| **Templates (4)** | ✅ Complets | ✅ Props OK | ✅ OK | ✅ OK | Ajouter tests |
| **router.tsx** | ✅ Fonctionnel | ✅ Fallback OK | ✅ OK | ✅ OK | RAS |
| **validation.ts** | ✅ Complet | ✅ Zod strict | ✅ Fallback OK | ✅ OK | RAS |

---

## 🏁 CONCLUSION

### Points Forts ✅

1. **Architecture propre** : Séparation claire modèle/API/templates/génération PDF
2. **Sécurité robuste** : Auth, filtrage userId, validation Zod
3. **Fallback intelligent** : Template par défaut si aucun template utilisateur
4. **Validation complète** : Zod + Mongoose validators
5. **Performance** : Index MongoDB, génération PDF optimisée avec @react-pdf/renderer
6. **Flexibilité** : 4 templates différents, personnalisation complète
7. **Limites par plan** : FREE/PRO/BUSINESS respectées

### Points à Améliorer ⚠️

1. **Validation incomplète** : `legalMentionsType` non validé
2. **Gestion isDefault** : Pas de transaction PATCH, pas de réassignation DELETE
3. **Validation défensive** : Manquante dans `generateInvoicePdf()`
4. **Pagination** : Absente sur GET /api/invoice-templates
5. **Tests** : Manquants pour templates PDF
6. **Logs production** : `console.error` à remplacer par logger externe

### Recommandation Globale

Le système est **fonctionnel et sécurisé** mais nécessite quelques améliorations pour être **production-ready** à 100%. Les problèmes identifiés sont **non bloquants** mais devraient être corrigés pour éviter edge cases.

**Score Global :** 8.5/10 ⭐

---

**Fin de l'audit - 15 novembre 2025**
