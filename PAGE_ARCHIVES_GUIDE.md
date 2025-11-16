# 📦 PAGE ARCHIVES - GUIDE COMPLET

**Date**: 16 Novembre 2025
**Version**: 1.0
**Statut**: ✅ Implémenté

---

## 🎯 OBJECTIF

Créer une page dédiée permettant aux utilisateurs de **visualiser toutes leurs factures finalisées**, **organisées par client**, avec accès rapide aux PDFs archivés pour conformité légale (obligation d'archivage 10 ans).

---

## 📁 FICHIERS CRÉÉS

### 1. Page Archives
**Fichier**: `src/app/dashboard/settings/archives/page.tsx`

**Route**: `/dashboard/settings/archives`

**Fonctionnalités**:
- ✅ Liste toutes les factures finalisées
- ✅ Groupe les factures par client
- ✅ Affiche des statistiques globales
- ✅ Sérialise les données MongoDB pour le client
- ✅ Exclut les factures soft-deleted

### 2. Composant Liste
**Fichier**: `src/components/settings/ArchivedInvoicesList.tsx`

**Fonctionnalités**:
- ✅ Affichage groupé par client (collapsible)
- ✅ Recherche par numéro de facture ou nom de client
- ✅ Filtre par année
- ✅ Téléchargement PDF avec état de chargement
- ✅ Visualisation PDF dans nouvel onglet
- ✅ Badges de certification (hash vérifié)

### 3. Navigation
**Fichier Modifié**: `src/components/dashboard/DashboardLayout.tsx`

- ✅ Ajout de l'icône `Archive`
- ✅ Nouveau lien de navigation "Archives"

---

## 🎨 INTERFACE UTILISATEUR

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│  📦 Archives - Factures Finalisées                          │
│  Accédez à toutes vos factures finalisées et PDFs archivés  │
└─────────────────────────────────────────────────────────────┘

┌───────────┬───────────┬───────────┬───────────────────┐
│ Total     │ Montant   │ Avec PDF  │ Par Année         │
│ Factures  │ Total     │ Archivé   │                   │
│           │           │           │ 2025: 15          │
│   42      │ 45.678 €  │   38      │ 2024: 27          │
│           │           │   90%     │                   │
└───────────┴───────────┴───────────┴───────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🔍 Recherche: [_____________________________]  [📅 2025 ▼] │
│  42 factures sur 42 affichées                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🏢 Acme Corporation                            [12 PDF] [▼]│
│     12 factures • 15.234,56 €                               │
├─────────────────────────────────────────────────────────────┤
│  │ FAC2025-KAR-0009  [✓ Payée] [✓ Certifié]               │
│  │ 15/11/2025 • 1.234,56 €          [👁️ Voir] [📥 Téléch.]│
│  ├─────────────────────────────────────────────────────────┤
│  │ FAC2025-KAR-0008  [✓ Payée] [✓ Certifié]               │
│  │ 10/11/2025 • 2.567,89 €          [👁️ Voir] [📥 Téléch.]│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  👤 Jean Dupont                                  [5 PDF] [▶]│
│     5 factures • 8.456,12 €                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 FONCTIONNALITÉS DÉTAILLÉES

### 1. Statistiques Globales

**4 Cartes de statistiques** :

#### Carte 1: Total Factures
```tsx
Total Factures
     42
```
- Compte total des factures finalisées non-supprimées

#### Carte 2: Montant Total
```tsx
Montant Total
  45.678,56 €
```
- Somme de tous les montants (TTC) des factures finalisées

#### Carte 3: Avec PDF Archivé
```tsx
Avec PDF Archivé
      38
    90% du total
```
- Nombre de factures ayant un `pdfPath`
- Pourcentage par rapport au total

#### Carte 4: Par Année
```tsx
Par Année
2025: 15
2024: 27
2023: 10
```
- Top 3 années avec le plus de factures
- Basé sur `finalizedAt` ou `createdAt`

---

### 2. Filtres

#### Recherche Textuelle
```tsx
🔍 Rechercher par numéro de facture ou client...
```

**Recherche dans** :
- Numéro de facture (ex: `FAC2025-KAR-0009`)
- Nom du client (ex: `Acme Corporation`)

**Comportement** :
- Insensible à la casse
- Recherche substring (inclut partielles)
- Filtre en temps réel (pas de bouton submit)

#### Filtre par Année
```tsx
📅 [Toutes les années ▼]
    2025
    2024
    2023
```

**Années disponibles** :
- Extraites automatiquement des factures
- Triées du plus récent au plus ancien
- Option "Toutes les années" par défaut

#### Compteur de Résultats
```tsx
42 factures sur 42 affichées
```
- Mise à jour en temps réel selon filtres
- Format: `{filteredCount} sur {totalCount}`

---

### 3. Groupement par Client

#### Header du Client (Collapsible)

**Cliquez pour expand/collapse** :

```
┌─────────────────────────────────────────────────────┐
│  🏢 Acme Corporation                   [12 PDF] [▼] │
│     12 factures • 15.234,56 €                       │
└─────────────────────────────────────────────────────┘
```

**Éléments** :
- **Icône** : 🏢 (business) ou 👤 (individual)
- **Nom** : `companyInfo.legalName` ou `name`
- **Statistiques** :
  - Nombre de factures pour ce client
  - Somme des montants
- **Badge PDF** : Nombre de factures avec PDF
- **Chevron** : ▼ (expanded) / ▶ (collapsed)

#### Liste des Factures (Expanded)

```
│  FAC2025-KAR-0009  [✓ Payée] [✓ Certifié]
│  15/11/2025 • 1.234,56 €       [👁️ Voir] [📥 Télécharger]
```

**Informations affichées** :
- **Numéro facture** : Mono-space font
- **Badges** :
  - `✓ Payée` (vert) si `status === 'paid'`
  - `✓ Certifié` (bleu) si `pdfHash` existe
- **Date** : Formatted `dd/mm/yyyy`
- **Montant** : Format Euro avec 2 décimales

**Actions** :
- **👁️ Voir** : Ouvre PDF dans nouvel onglet (inline)
- **📥 Télécharger** : Télécharge PDF sur ordinateur

---

### 4. Actions sur Factures

#### Bouton "Voir" (Eye Icon)

**Comportement** :
```typescript
window.open(`/api/invoices/${invoice._id}/view-pdf`, '_blank');
```

- Ouvre PDF dans **nouvel onglet**
- PDF affiché **inline** dans le navigateur
- Utilise route `/api/invoices/[id]/view-pdf`

**Use case** :
- Vérification rapide du contenu
- Lecture dans le navigateur
- Pas de téléchargement

#### Bouton "Télécharger" (Download Icon)

**Comportement** :
```typescript
const response = await fetch(`/api/invoices/${invoice._id}/download-pdf`);
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${invoice.invoiceNumber}.pdf`;
a.click();
```

- Télécharge PDF sur l'ordinateur
- Nom fichier = `{invoiceNumber}.pdf`
- Utilise route `/api/invoices/[id]/download-pdf`
- **État de chargement** : Spinner pendant téléchargement

**Use case** :
- Archivage local
- Envoi par email manuel
- Conservation offline

#### État "PDF Non Disponible"

Si `pdfPath` est `null` :

```
⚠️ PDF non disponible
```

- Icône alerte orange
- Pas de boutons d'action
- Message explicite

---

### 5. Empty States

#### Aucune Facture Finalisée

```
┌─────────────────────────────────────────┐
│           📄                            │
│                                          │
│  Aucune facture trouvée                 │
│  Aucune facture archivée ne correspond  │
│  à vos critères de recherche.           │
└─────────────────────────────────────────┘
```

**Affiché quand** :
- Pas de factures finalisées
- Filtres ne retournent aucun résultat

---

## 📊 DONNÉES

### Requête MongoDB

```typescript
const finalizedInvoices = await Invoice.find({
  userId: session.user.id,
  isFinalized: true,
  deletedAt: null, // Exclure soft-deleted
})
  .sort({ finalizedAt: -1 }) // Plus récentes en premier
  .lean();
```

### Groupement par Client

```typescript
const invoicesByClient = finalizedInvoices.reduce((acc, invoice) => {
  const clientId = invoice.clientId?.toString() || 'no-client';
  if (!acc[clientId]) {
    acc[clientId] = [];
  }
  acc[clientId].push(invoice);
  return acc;
}, {} as Record<string, typeof finalizedInvoices>);
```

### Sérialisation

**Pourquoi sérialiser** :
- MongoDB retourne des objets avec types spéciaux
- Dates doivent être converties en ISO strings
- ObjectIds en strings

```typescript
invoices: invoices.map((invoice) => ({
  _id: invoice._id.toString(),
  invoiceNumber: invoice.invoiceNumber,
  total: invoice.total,
  status: invoice.status,
  isFinalized: invoice.isFinalized,
  finalizedAt: invoice.finalizedAt?.toISOString() || null,
  issueDate: invoice.issueDate?.toISOString() || null,
  pdfPath: invoice.pdfPath || null,
  pdfHash: invoice.pdfHash || null,
  clientId: invoice.clientId?.toString() || null,
}))
```

---

## 🔒 SÉCURITÉ

### Vérifications Côté Serveur

1. **Authentification**
```typescript
const session = await auth();
if (!session?.user?.id) {
  redirect('/login');
}
```

2. **Filtrage par User ID**
```typescript
userId: session.user.id  // Uniquement factures de l'user
```

3. **Exclusion Soft-Deleted**
```typescript
deletedAt: null  // Pas de factures supprimées
```

### Sécurité Téléchargement PDF

Voir [SYSTEME_PDF_ARCHIVES.md](SYSTEME_PDF_ARCHIVES.md) pour détails complets.

---

## 🎨 STYLES & DESIGN

### Palette de Couleurs

```css
/* Fond principal */
bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900

/* Cards */
bg-gray-800/50 border-gray-700

/* Badges */
- Payée:    bg-green-900/30 text-green-400 border-green-700/50
- Certifié: bg-blue-900/30 text-blue-300 border-blue-700/50
- PDF:      bg-purple-900/30 text-purple-300 border-purple-700/50

/* Boutons */
- Voir:        hover:bg-blue-900/30 hover:border-blue-600
- Télécharger: bg-purple-900/30 border-purple-700
```

### Responsive

```css
/* Mobile-first */
grid-cols-1           /* 1 colonne sur mobile */
md:grid-cols-4        /* 4 colonnes sur tablette+ */

/* Texte adaptatif */
hidden sm:inline      /* Caché sur mobile, visible sur sm+ */
```

---

## 📱 NAVIGATION

### Accès à la Page

**Chemin** : Dashboard → Archives (sidebar)

```
Dashboard
├── Tableau de bord
├── Analytiques
├── Clients
├── Factures
├── Devis
├── Prestations
├── Dépenses
├── Modèles de facture
├── 📦 Archives          ← NOUVEAU
├── Tarifs
├── Facturation
└── Paramètres
```

**URL** : `/dashboard/settings/archives`

---

## 🧪 TESTS

### Scénarios de Test

#### Test 1: Affichage Page Vide
```
Préconditions: Aucune facture finalisée
Actions: Accéder à /dashboard/settings/archives
Résultat attendu: État vide avec message "Aucune facture trouvée"
```

#### Test 2: Groupement par Client
```
Préconditions: 5 factures pour Client A, 3 pour Client B
Actions: Accéder à la page
Résultat attendu:
- 2 groupes affichés
- Client A: "5 factures"
- Client B: "3 factures"
```

#### Test 3: Filtre par Année
```
Préconditions: Factures en 2024 et 2025
Actions: Sélectionner "2025" dans le filtre
Résultat attendu: Seulement factures 2025 affichées
```

#### Test 4: Recherche
```
Préconditions: Factures FAC2025-001, FAC2024-002
Actions: Taper "2025" dans recherche
Résultat attendu: Seulement FAC2025-001 affichée
```

#### Test 5: Téléchargement PDF
```
Préconditions: Facture finalisée avec pdfPath
Actions: Cliquer bouton "Télécharger"
Résultat attendu:
- Spinner affiché pendant téléchargement
- PDF téléchargé avec nom correct
- Spinner disparaît après succès
```

#### Test 6: PDF Non Disponible
```
Préconditions: Facture finalisée SANS pdfPath
Actions: Regarder la ligne de facture
Résultat attendu: "⚠️ PDF non disponible" affiché, pas de boutons
```

---

## 🚀 AMÉLIORATIONS FUTURES

### Phase 2 (Optionnel)

1. **Export CSV de toutes les archives**
```tsx
<Button onClick={exportArchivesToCSV}>
  📊 Exporter toutes les archives (CSV)
</Button>
```

2. **Tri des colonnes**
- Trier par date
- Trier par montant
- Trier par numéro

3. **Filtres avancés**
- Plage de dates personnalisée
- Filtre par montant (min/max)
- Filtre par statut

4. **Statistiques avancées**
- Graphique évolution par mois
- Top 5 clients par CA
- Comparaison année-sur-année

5. **Téléchargement groupé**
```tsx
<Button onClick={downloadAllPdfsAsZip}>
  📦 Télécharger tous les PDFs (ZIP)
</Button>
```

---

## 📝 RÉSUMÉ

### ✅ Ce qui a été implémenté

**Page** : `/dashboard/settings/archives`

**Fichiers** :
- `src/app/dashboard/settings/archives/page.tsx` (Page Server Component)
- `src/components/settings/ArchivedInvoicesList.tsx` (Client Component)
- `src/components/dashboard/DashboardLayout.tsx` (Navigation mise à jour)

**Fonctionnalités** :
- ✅ Liste toutes factures finalisées
- ✅ Groupement par client (collapsible)
- ✅ Recherche textuelle
- ✅ Filtre par année
- ✅ Statistiques globales (4 KPIs)
- ✅ Téléchargement PDF archivé
- ✅ Visualisation PDF inline
- ✅ Badges certification (hash)
- ✅ États de chargement
- ✅ Empty states
- ✅ Design responsive

**Sécurité** :
- ✅ Authentification requise
- ✅ Filtre par userId
- ✅ Exclusion soft-deleted
- ✅ Routes API sécurisées (voir SYSTEME_PDF_ARCHIVES.md)

---

## 🎯 PROCHAINES ÉTAPES

1. **Tester la page** dans le navigateur
2. **Vérifier** que les PDFs se téléchargent
3. **Valider** le groupement par client
4. **Confirmer** que les filtres fonctionnent

---

**Fin du guide** 📦

Pour référence technique sur les routes PDF, voir :
- [SYSTEME_PDF_ARCHIVES.md](SYSTEME_PDF_ARCHIVES.md)

Pour questions, référez-vous aux fichiers source listés ci-dessus.
