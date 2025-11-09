# 🔍 CAHIER DES CHARGES - OCR FACTURES (Dépenses)

**Projet :** blink - Module OCR & Gestion des Dépenses  
**Version :** 1.0  
**Date :** 25 octobre 2025  
**Auteur :** Équipe blink

---

## 🎯 OBJECTIFS

Ajouter un système d'OCR (Optical Character Recognition) pour :
- **Scanner automatiquement les factures reçues** (dépenses)
- **Extraire les données clés** (fournisseur, date, montant, TVA)
- **Valider et corriger manuellement** les données extraites
- **Archiver les justificatifs** pour conformité comptable
- **Calculer les dépenses** et générer des rapports

**Différenciation forte :** Inspiré de Dext (Receipt Bank) mais simplifié et adapté aux TPE françaises.

---

## 🏗️ ARCHITECTURE TECHNIQUE

### 1. Stack Technologique

**OCR Engine :**
- **Tesseract.js** (v4+) - OCR JavaScript open-source
- Reconnaissance de texte français/anglais
- Exécution côté client (browser) ou serveur (Node.js)

**Alternative :** Google Cloud Vision API (payant, plus précis)

**Traitement d'image :**
- **Sharp** (déjà installé) - Redimensionnement, compression
- Conversion en niveaux de gris pour améliorer OCR
- Rotation automatique si nécessaire

**Stockage :**
- **MongoDB GridFS** ou **AWS S3** pour les fichiers
- Métadonnées dans MongoDB

**Upload :**
- **Multipart form-data** avec taille max 10MB
- Formats acceptés : JPG, PNG, PDF

---

### 2. Modèle de données - `Expense.ts`

**Nouveau modèle MongoDB :**

```typescript
export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  supplierId?: mongoose.Types.ObjectId; // Lien vers fournisseur (nouveau modèle)
  
  // Métadonnées du document
  documentType: 'invoice' | 'receipt' | 'other';
  documentNumber?: string; // N° facture fournisseur
  
  // Données extraites par OCR
  supplierName: string; // Nom du fournisseur
  issueDate: Date; // Date de la facture
  amount: number; // Montant TTC
  amountHT?: number; // Montant HT (si extrait)
  taxAmount?: number; // Montant TVA
  taxRate?: number; // Taux de TVA (ex: 20)
  
  // Catégorisation
  category: 'equipment' | 'supplies' | 'services' | 'rent' | 'utilities' | 'transport' | 'meals' | 'other';
  subcategory?: string;
  
  // Statut de traitement
  status: 'pending' | 'validated' | 'rejected' | 'archived';
  ocrConfidence: number; // Score de confiance OCR (0-100)
  isManuallyValidated: boolean; // Validé manuellement
  
  // Notes et pièce jointe
  notes?: string;
  privateNotes?: string;
  
  // Fichier original
  fileUrl: string; // URL du fichier uploadé
  fileName: string;
  fileSize: number; // En bytes
  fileMimeType: string;
  
  // Données OCR brutes (pour debug)
  ocrRawText?: string;
  ocrProcessedAt?: Date;
  
  // Comptabilité
  accountingCode?: string; // Code comptable (ex: 6063)
  isPaid: boolean;
  paymentDate?: Date;
  paymentMethod?: 'bank_transfer' | 'check' | 'cash' | 'card' | 'online' | 'other';
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes :**
```typescript
ExpenseSchema.index({ userId: 1, issueDate: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });
ExpenseSchema.index({ userId: 1, status: 1 });
ExpenseSchema.index({ supplierName: 'text' }); // Recherche texte
```

---

### 3. Modèle Fournisseur - `Supplier.ts`

**Nouveau modèle (similaire à Client) :**

```typescript
export interface ISupplier extends Document {
  userId: mongoose.Types.ObjectId;
  name: string; // Nom du fournisseur
  siret?: string;
  address?: IAddress;
  email?: string;
  phone?: string;
  website?: string;
  defaultCategory?: string; // Catégorie par défaut
  notes?: string;
  isActive: boolean;
  
  // Stats auto-calculées
  totalSpent?: number; // Total dépensé
  expenseCount?: number; // Nombre de dépenses
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. Service OCR - `ocr-processor.ts`

**Fichier :** `src/lib/services/ocr-processor.ts`

```typescript
import Tesseract from 'tesseract.js';

export interface OcrResult {
  rawText: string;
  confidence: number;
  extractedData: {
    supplierName?: string;
    documentNumber?: string;
    issueDate?: string;
    amountTTC?: number;
    amountHT?: number;
    taxAmount?: number;
    taxRate?: number;
  };
}

/**
 * Traite une image/PDF et extrait les données
 */
export async function processOCR(fileBuffer: Buffer): Promise<OcrResult> {
  // 1. Prétraitement de l'image (Sharp)
  const processedImage = await preprocessImage(fileBuffer);
  
  // 2. OCR avec Tesseract
  const { data } = await Tesseract.recognize(
    processedImage,
    'fra+eng', // Langues français + anglais
    {
      logger: info => console.log(info), // Progress
    }
  );
  
  // 3. Extraction des données structurées
  const extractedData = extractInvoiceData(data.text);
  
  return {
    rawText: data.text,
    confidence: data.confidence,
    extractedData,
  };
}

/**
 * Prétraite l'image pour améliorer OCR
 */
async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .grayscale() // Niveaux de gris
    .normalize() // Améliore le contraste
    .resize(2000, 2000, { fit: 'inside' }) // Redimensionne
    .toBuffer();
}

/**
 * Extrait les données d'une facture depuis le texte OCR
 */
function extractInvoiceData(text: string): OcrResult['extractedData'] {
  const data: OcrResult['extractedData'] = {};
  
  // Extraction du nom du fournisseur (première ligne non vide généralement)
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0) {
    data.supplierName = lines[0].trim();
  }
  
  // Extraction de la date (patterns français)
  const datePatterns = [
    /(\d{2})\/(\d{2})\/(\d{4})/,  // 25/10/2025
    /(\d{2})-(\d{2})-(\d{4})/,    // 25-10-2025
    /(\d{4})-(\d{2})-(\d{2})/,    // 2025-10-25
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.issueDate = match[0];
      break;
    }
  }
  
  // Extraction des montants (patterns français avec € et virgules)
  const amountPatterns = [
    /total\s*ttc?\s*[:=]?\s*(\d+[,.]?\d*)\s*€?/i,
    /montant\s*ttc?\s*[:=]?\s*(\d+[,.]?\d*)\s*€?/i,
    /(\d+[,.]?\d*)\s*€\s*ttc?/i,
  ];
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = match[1].replace(',', '.');
      data.amountTTC = parseFloat(amount);
      break;
    }
  }
  
  // Extraction TVA
  const tvaPatterns = [
    /tva\s*(\d+)%?\s*[:=]?\s*(\d+[,.]?\d*)/i,
    /(\d+)%\s*tva/i,
  ];
  for (const pattern of tvaPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.taxRate = parseInt(match[1]);
      if (match[2]) {
        data.taxAmount = parseFloat(match[2].replace(',', '.'));
      }
      break;
    }
  }
  
  // Extraction N° facture
  const invoiceNumberPatterns = [
    /facture\s*n°?\s*[:=]?\s*([A-Z0-9-]+)/i,
    /n°\s*facture\s*[:=]?\s*([A-Z0-9-]+)/i,
    /invoice\s*#?\s*[:=]?\s*([A-Z0-9-]+)/i,
  ];
  for (const pattern of invoiceNumberPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.documentNumber = match[1];
      break;
    }
  }
  
  // Calcul HT si TTC et TVA connus
  if (data.amountTTC && data.taxAmount) {
    data.amountHT = data.amountTTC - data.taxAmount;
  } else if (data.amountTTC && data.taxRate) {
    data.amountHT = data.amountTTC / (1 + data.taxRate / 100);
    data.taxAmount = data.amountTTC - data.amountHT;
  }
  
  return data;
}
```

---

### 5. Service de stockage - `file-storage.ts`

**Fichier :** `src/lib/services/file-storage.ts`

**Option 1 : MongoDB GridFS** (gratuit)
```typescript
import { GridFSBucket } from 'mongodb';

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const bucket = new GridFSBucket(db, { bucketName: 'expenses' });
  const uploadStream = bucket.openUploadStream(filename, {
    contentType: mimeType,
  });
  
  uploadStream.write(file);
  uploadStream.end();
  
  return uploadStream.id.toString(); // ID du fichier
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  const bucket = new GridFSBucket(db, { bucketName: 'expenses' });
  const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
  
  const chunks: Buffer[] = [];
  for await (const chunk of downloadStream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}
```

**Option 2 : AWS S3** (payant, plus scalable)
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function uploadToS3(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const s3 = new S3Client({ region: 'eu-west-1' });
  const key = `expenses/${Date.now()}-${filename}`;
  
  await s3.send(new PutObjectCommand({
    Bucket: 'blink-expenses',
    Key: key,
    Body: file,
    ContentType: mimeType,
  }));
  
  return `https://blink-expenses.s3.amazonaws.com/${key}`;
}
```

**Recommandation :** Démarrer avec GridFS, migrer vers S3 si nécessaire.

---

## 📡 APIs REST

### 1. **POST /api/expenses/upload** - Upload & OCR

**Endpoint principal !**

**Body :** Multipart form-data
```
file: [Binary file]
```

**Process :**
1. Valider le fichier (type, taille max 10MB)
2. Stocker le fichier (GridFS ou S3)
3. Lancer l'OCR en background (async)
4. Créer l'Expense avec status `pending`
5. Retourner l'Expense avec données préliminaires

**Réponse :**
```json
{
  "_id": "...",
  "status": "pending",
  "fileUrl": "...",
  "ocrProcessedAt": null,
  "message": "Traitement OCR en cours..."
}
```

**Note :** OCR peut prendre 5-30 secondes selon la qualité de l'image.

---

### 2. **GET /api/expenses/[id]/ocr-status** - Statut OCR

**Polling endpoint** pour vérifier si OCR terminé.

**Réponse :**
```json
{
  "status": "completed",
  "ocrConfidence": 85,
  "extractedData": {
    "supplierName": "Fournisseur XYZ",
    "issueDate": "2025-10-25",
    "amountTTC": 1200,
    "taxRate": 20
  }
}
```

---

### 3. **PATCH /api/expenses/[id]** - Valider/Corriger

**Body :** Corrections manuelles
```json
{
  "supplierName": "Nom corrigé",
  "issueDate": "2025-10-25",
  "amount": 1200,
  "category": "equipment",
  "status": "validated",
  "isManuallyValidated": true
}
```

---

### 4. **GET /api/expenses** - Liste des dépenses

**Query params :**
- `status` : pending, validated, archived
- `category` : equipment, services, etc.
- `startDate` / `endDate` : période
- `supplierId` : filtrer par fournisseur

**Réponse :**
```json
[
  {
    "_id": "...",
    "supplierName": "Fournisseur ABC",
    "issueDate": "2025-10-25",
    "amount": 1200,
    "category": "equipment",
    "status": "validated",
    "fileUrl": "...",
    ...
  }
]
```

---

### 5. **GET /api/expenses/[id]** - Détails

**Réponse :** Expense complet avec URL du fichier

---

### 6. **DELETE /api/expenses/[id]** - Supprimer

Supprime l'expense ET le fichier associé.

---

### 7. **POST /api/expenses/bulk-upload** - Upload multiple

Upload de plusieurs fichiers en une fois.

---

### 8. **GET /api/expenses/stats** - Statistiques

**Réponse :**
```json
{
  "totalSpent": 25000,
  "totalExpenses": 45,
  "byCategory": {
    "equipment": 5000,
    "services": 8000,
    "transport": 2000,
    ...
  },
  "byMonth": [
    { "month": "2025-10", "amount": 3000 },
    { "month": "2025-09", "amount": 2500 }
  ],
  "pendingValidation": 5
}
```

---

## 🎨 INTERFACE UTILISATEUR

### 1. Page Dépenses - `/dashboard/expenses/page.tsx`

**Layout :**
```
┌────────────────────────────────────────┐
│  📤 Scanner une facture                │ ← Bouton upload principal
├────────────────────────────────────────┤
│  Filtres : [Catégorie] [Statut] [Date]│
├────────────────────────────────────────┤
│  📊 Stats : 25 000€ dépensés (45 docs) │
├────────────────────────────────────────┤
│  Liste des dépenses                    │
│  ┌──────────────────────────────────┐ │
│  │ 🏢 Fournisseur ABC | 25/10/2025  │ │
│  │ 💰 1 200,00 € | ⚙️ Équipement    │ │
│  │ [Voir] [Modifier] [Télécharger]  │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ 🏪 Fournisseur XYZ | 20/10/2025  │ │
│  │ 💰 850,00 € | 🔧 Services        │ │
│  │ [Voir] [Modifier] [Télécharger]  │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

### 2. Modal Upload - `ExpenseUploadModal.tsx`

**Zone de drag & drop :**
```
┌─────────────────────────────────────┐
│  📤 Scanner une facture ou un reçu  │
├─────────────────────────────────────┤
│                                     │
│     🖼️                              │
│                                     │
│   Glissez-déposez vos fichiers     │
│   ou cliquez pour sélectionner      │
│                                     │
│   Formats : JPG, PNG, PDF           │
│   Taille max : 10 MB                │
│                                     │
└─────────────────────────────────────┘
   [Annuler]     [📤 Importer]
```

**Après upload :**
```
⏳ Traitement en cours...
━━━━━━━━━━━━━━━━━━━━━ 75%
Extraction des données...
```

---

### 3. Modal Validation - `ExpenseValidationModal.tsx`

**Affichage après OCR :**
```
┌─────────────────────────────────────┐
│  ✅ Valider la dépense              │
├─────────────────────────────────────┤
│  📄 Fichier : facture-abc.pdf       │
│  🎯 Confiance OCR : 85%             │
├─────────────────────────────────────┤
│                                     │
│  Fournisseur * ⚠️                  │
│  [Fournisseur ABC        ]  ✏️      │
│   ↳ OCR détecté : "Fourn. ABC"     │
│                                     │
│  Date d'émission * ✅               │
│  [25/10/2025             ]          │
│                                     │
│  Montant TTC * ✅                   │
│  [1 200,00 €             ]          │
│                                     │
│  TVA                                │
│  Taux : [20%] Montant : [200,00 €] │
│                                     │
│  Catégorie *                        │
│  [⚙️ Équipement          ▼]        │
│                                     │
│  Notes                              │
│  [                       ]          │
│                                     │
│  ℹ️ Les champs avec ⚠️ nécessitent │
│     une vérification manuelle       │
│                                     │
│  [❌ Rejeter]  [✅ Valider]         │
└─────────────────────────────────────┘
```

**Indicateurs visuels :**
- ✅ Vert : Donnée extraite avec haute confiance (>80%)
- ⚠️ Orange : Donnée douteuse (50-80%) - vérification recommandée
- ❌ Rouge : Donnée non trouvée (<50%) - saisie manuelle requise

---

### 4. Composant `ExpenseCard.tsx`

**Carte individuelle :**
```tsx
<div className="bg-white p-4 rounded-lg shadow">
  <div className="flex justify-between">
    <div>
      <h3 className="font-bold">🏢 {supplierName}</h3>
      <p className="text-sm text-gray-500">
        {category} • {issueDate}
      </p>
    </div>
    <div className="text-right">
      <p className="font-bold text-lg">{amount} €</p>
      <Badge status={status} />
    </div>
  </div>
  <div className="mt-4 flex gap-2">
    <Button size="sm" onClick={onView}>👁️ Voir</Button>
    <Button size="sm" onClick={onEdit}>✏️ Modifier</Button>
    <Button size="sm" onClick={onDownload}>📥 Télécharger</Button>
  </div>
</div>
```

---

### 5. Visualiseur de document - `DocumentViewer.tsx`

**Modal pour voir le fichier original :**
```
┌─────────────────────────────────────┐
│  [←]  facture-abc.pdf          [✕]  │
├─────────────────────────────────────┤
│                                     │
│     [Aperçu du document]            │
│                                     │
│     Image/PDF affiché ici           │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [⬇️ Télécharger] [📧 Envoyer email]│
└─────────────────────────────────────┘
```

---

### 6. Dashboard - Stats Dépenses

**Ajout dans `DashboardOverview.tsx` :**

**Nouvelle card :**
```tsx
<StatsCard
  icon={<TrendingDown />}
  title="Dépenses du mois"
  value="3 500 €"
  subtitle="12 factures"
  color="red"
/>
```

**Section graphique :**
- Graphique ligne : Dépenses par mois
- Graphique camembert : Dépenses par catégorie
- Top 5 fournisseurs

---

## 🔧 CONFIGURATION & OPTIMISATION

### 1. Variables d'environnement

**Ajout dans `.env` :**
```env
# OCR
OCR_ENGINE=tesseract # ou google-vision
TESSERACT_LANG=fra+eng

# Storage
STORAGE_TYPE=gridfs # ou s3
AWS_S3_BUCKET=blink-expenses
AWS_S3_REGION=eu-west-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Limites
MAX_FILE_SIZE=10485760 # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

---

### 2. Optimisation OCR

**Améliorer la précision :**
1. **Prétraitement d'image :**
   - Niveaux de gris
   - Augmentation du contraste
   - Détection et rotation automatique
   - Suppression du bruit

2. **Configuration Tesseract :**
   ```typescript
   {
     tessedit_pageseg_mode: '1', // Auto page segmentation
     tessedit_char_whitelist: '0123456789€,.- ',
     preserve_interword_spaces: '1',
   }
   ```

3. **Post-processing :**
   - Correction orthographique fournisseurs connus
   - Validation des formats (dates, montants)
   - Machine learning pour améliorer avec le temps

---

### 3. Performance

**OCR asynchrone avec queue :**
```typescript
// Utiliser Bull (job queue Redis)
import Queue from 'bull';

const ocrQueue = new Queue('ocr-processing', {
  redis: { host: 'localhost', port: 6379 }
});

ocrQueue.process(async (job) => {
  const { expenseId, fileBuffer } = job.data;
  const result = await processOCR(fileBuffer);
  
  await Expense.findByIdAndUpdate(expenseId, {
    ocrRawText: result.rawText,
    ocrConfidence: result.confidence,
    ...result.extractedData,
    ocrProcessedAt: new Date(),
  });
});

// Dans l'API upload
export async function POST(req: NextRequest) {
  // 1. Upload fichier
  const fileUrl = await uploadFile(file);
  
  // 2. Créer expense en attente
  const expense = await Expense.create({
    userId,
    fileUrl,
    status: 'pending',
  });
  
  // 3. Ajouter à la queue
  await ocrQueue.add({ expenseId: expense._id, fileBuffer });
  
  return NextResponse.json(expense);
}
```

---

## 🧪 TESTS

### Tests unitaires
- ✅ Extraction de dates (formats multiples)
- ✅ Extraction de montants (formats FR/EN)
- ✅ Extraction de fournisseurs
- ✅ Calculs TVA

### Tests d'intégration
- ✅ Upload + OCR complet
- ✅ Validation manuelle
- ✅ Recherche dans dépenses
- ✅ Export comptable

### Tests E2E
- ✅ Parcours complet : Upload → OCR → Validation → Archive
- ✅ Correction de données OCR erronées
- ✅ Génération de rapport de dépenses

---

## 📊 MÉTRIQUES DE SUCCÈS

**Précision OCR :**
- ✅ **Objectif 1 :** >70% de précision globale
- ✅ **Objectif 2 :** >85% pour montants
- ✅ **Objectif 3 :** >80% pour dates

**Performance :**
- ✅ Traitement OCR < 10 secondes (image moyenne)
- ✅ Upload < 2 secondes

**Utilisabilité :**
- ✅ Validation d'une dépense < 30 secondes
- ✅ Correction manuelle < 1 minute

---

## 🚀 PLAN DE DÉVELOPPEMENT

### Phase 1 : Modèles & Storage (1-2 jours)
- [ ] Modèle `Expense.ts`
- [ ] Modèle `Supplier.ts`
- [ ] Service `file-storage.ts` (GridFS)
- [ ] Migration MongoDB

### Phase 2 : OCR Engine (2-3 jours)
- [ ] Intégration Tesseract.js
- [ ] Service `ocr-processor.ts`
- [ ] Extraction de données (patterns FR)
- [ ] Tests de précision

### Phase 3 : APIs (2 jours)
- [ ] POST `/api/expenses/upload`
- [ ] GET `/api/expenses`
- [ ] PATCH `/api/expenses/[id]`
- [ ] GET `/api/expenses/stats`

### Phase 4 : Interface (3-4 jours)
- [ ] Page `/dashboard/expenses`
- [ ] Modal upload drag&drop
- [ ] Modal validation
- [ ] Visualiseur de documents
- [ ] Filtres et recherche

### Phase 5 : Features avancées (2 jours)
- [ ] Gestion fournisseurs
- [ ] Catégorisation auto
- [ ] Export comptable
- [ ] Dashboard stats

### Phase 6 : Optimisation (1-2 jours)
- [ ] Queue asynchrone (Bull)
- [ ] Amélioration précision OCR
- [ ] Tests E2E
- [ ] Documentation

**TOTAL : 11-15 jours**

---

## 📦 DÉPENDANCES NPM

```json
{
  "dependencies": {
    "tesseract.js": "^5.0.0",
    "sharp": "^0.34.4", // Déjà installé
    "bull": "^4.11.0", // Pour queue jobs
    "multer": "^1.4.5-lts.1", // Upload multipart
    "@aws-sdk/client-s3": "^3.0.0" // Si S3
  }
}
```

---

## 🔮 ÉVOLUTIONS FUTURES (V2)

### 1. OCR Avancé
- **Google Cloud Vision API** pour meilleure précision
- **IA pour catégorisation automatique**
- **Détection de duplicatas**
- **Extraction de lignes de facture**

### 2. Mobile
- **App native iOS/Android**
- **Scan direct depuis caméra**
- **Notifications push** (nouvelle dépense à valider)

### 3. Comptabilité
- **Rapports TVA automatiques**
- **Export FEC (Fichier Écritures Comptables)**
- **Réconciliation bancaire**
- **Intégration avec logiciels comptables**

### 4. Intelligence
- **Machine Learning** pour améliorer OCR
- **Prédiction de catégories**
- **Détection de fraudes**
- **Alertes de dépenses anormales**

---

## ⚠️ CONSIDÉRATIONS LÉGALES

### Archivage
- **Obligation légale :** Conservation 10 ans en France
- Archivage automatique après validation
- Horodatage et traçabilité
- Conformité RGPD

### Sécurité
- Chiffrement des fichiers stockés
- Accès restreint par utilisateur
- Logs d'accès aux documents
- Backup automatique

---

## 💡 ASTUCES POUR AMÉLIORER LA PRÉCISION

### Pour les utilisateurs :
1. **Prendre des photos nettes et bien éclairées**
2. **Éviter les ombres et reflets**
3. **Cadrer uniquement la facture**
4. **Privilégier les PDF originaux aux photos**
5. **Scanner en haute résolution (300 DPI minimum)**

### Amélioration progressive :
- Stocker les corrections manuelles
- Créer un dictionnaire de fournisseurs connus
- Entraîner un modèle ML sur les données validées
- Ajuster les patterns regex selon les fournisseurs récurrents

---

**FIN DU CAHIER DES CHARGES OCR**
