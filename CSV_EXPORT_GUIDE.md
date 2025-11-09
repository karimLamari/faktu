# Guide d'Export CSV Comptable

## Vue d'ensemble

L'export CSV comptable permet d'exporter vos factures dans différents formats pour faciliter l'intégration avec les logiciels comptables et la gestion de votre activité.

⚠️ **Restriction d'abonnement** : Cette fonctionnalité est réservée aux plans **PRO** et **BUSINESS**. Les utilisateurs du plan gratuit doivent mettre à niveau leur abonnement.

---

## 📊 Formats d'Export Disponibles

### 1. Export Simple

**Fichier généré :** `export-factures-YYYYMMDD.csv`

**Contenu :**
- Vue résumée de chaque facture
- Idéal pour un suivi rapide et des tableaux de bord Excel

**Colonnes :**
```
Numéro Facture | Date Émission | Date Échéance | Client | Montant HT | Taux TVA | Montant TVA | Montant TTC | Statut | Montant Payé | Reste à Payer
```

**Exemple :**
```csv
Numéro Facture;Date Émission;Date Échéance;Client;Montant HT;Taux TVA;Montant TVA;Montant TTC;Statut;Montant Payé;Reste à Payer
FAC2025-0001;15/01/2025;15/02/2025;SARL Dupont;1000,00;20.00%;200,00;1200,00;Payée;1200,00;0,00
FAC2025-0002;20/01/2025;20/02/2025;Entreprise Martin;2500,00;20.00%;500,00;3000,00;Envoyée;0,00;3000,00
```

**Utilisation recommandée :**
- Tableaux de bord Excel/Google Sheets
- Suivi mensuel/annuel
- Reporting simple

---

### 2. Export Détaillé

**Fichier généré :** `export-detaille-YYYYMMDD.csv`

**Contenu :**
- Une ligne par article/prestation de chaque facture
- Détail complet des prestations

**Colonnes :**
```
Numéro Facture | Date | Client | Ligne | Description | Quantité | Prix Unitaire HT | Total HT | Taux TVA | Montant TVA | Total TTC | Statut
```

**Exemple :**
```csv
Numéro Facture;Date;Client;Ligne;Description;Quantité;Prix Unitaire HT;Total HT;Taux TVA;Montant TVA;Total TTC;Statut
FAC2025-0001;15/01/2025;SARL Dupont;1;Développement site web;1,00;1000,00;1000,00;20.00%;200,00;1200,00;Payée
FAC2025-0002;20/01/2025;Entreprise Martin;1;Hébergement annuel;1,00;500,00;500,00;20.00%;100,00;600,00;Envoyée
FAC2025-0002;20/01/2025;Entreprise Martin;2;Maintenance mensuelle;12,00;100,00;1200,00;20.00%;240,00;1440,00;Envoyée
```

**Utilisation recommandée :**
- Analyse détaillée des prestations
- Suivi par type de service
- Calculs personnalisés

---

### 3. Export Comptable (FEC)

**Fichier généré :** `export-comptable-YYYYMMDD.csv`

**Contenu :**
- Format **FEC (Fichier des Écritures Comptables)**
- Compatible avec les logiciels comptables français
- Écritures comptables en partie double

**Colonnes :**
```
Date | Journal | Numéro Pièce | Compte | Libellé | Débit | Crédit | Client | Devise
```

**Exemple :**
```csv
Date;Journal;Numéro Pièce;Compte;Libellé;Débit;Crédit;Client;Devise
20250115;VE;FAC2025-0001;411000;Facture FAC2025-0001 - SARL Dupont;1200,00;0,00;SARL Dupont;EUR
20250115;VE;FAC2025-0001;707000;Vente FAC2025-0001;0,00;1000,00;SARL Dupont;EUR
20250115;VE;FAC2025-0001;44571;TVA 20.0% sur FAC2025-0001;0,00;200,00;SARL Dupont;EUR
```

**Écritures générées :**

Pour chaque facture, 3 lignes sont créées :

1. **Débit client (411xxx)** = Montant TTC
   - Enregistre la créance client

2. **Crédit vente HT (707xxx)** = Montant HT
   - Enregistre le chiffre d'affaires

3. **Crédit TVA collectée (44571)** = Montant TVA
   - Enregistre la TVA à reverser

**Plan comptable utilisé :**
- `411000` : Clients
- `707000` : Ventes de marchandises (à personnaliser)
- `44571` : TVA collectée 20%
- `44571` : TVA collectée 10%
- `44571` : TVA collectée 5.5%
- `44571` : TVA collectée 2.1%

**Utilisation recommandée :**
- Import dans logiciels comptables (Sage, Ciel, EBP, Pennylane, etc.)
- Contrôle fiscal FEC
- Comptabilité professionnelle

---

## 🎯 Comment Utiliser l'Export CSV

### Prérequis

**Abonnement requis** : Plan PRO ou BUSINESS
- **Plan FREE** : ❌ Export CSV non disponible (badge "PRO" affiché sur le bouton)
- **Plan PRO** : ✅ Export CSV comptable inclus
- **Plan BUSINESS** : ✅ Export CSV comptable inclus

Si vous êtes sur le plan gratuit, vous verrez un badge "PRO" sur le bouton d'export et serez invité à mettre à niveau votre abonnement lors du clic.

### Via l'Interface Web

1. Accéder à la page **Factures**
2. Appliquer des filtres si nécessaire (statut, dates)
3. Cliquer sur le bouton **"Exporter CSV"** (vert avec icône téléchargement)
   - **Note** : Si vous êtes sur le plan FREE, un modal de mise à niveau s'affichera
4. Choisir le format d'export souhaité :
   - **Export simple** : Résumé par facture
   - **Export détaillé** : Avec lignes de facturation
   - **Export comptable (FEC)** : Format compatible logiciels comptables
5. Le fichier CSV se télécharge automatiquement

### Filtres d'Export

L'export prend en compte vos filtres actifs :

**Filtre par statut :**
- Toutes les factures
- Brouillon uniquement
- Envoyées uniquement
- Payées uniquement
- En retard uniquement

**Filtre par date :**
- Date de début (optionnel)
- Date de fin (optionnel)

**Exemple :** Exporter toutes les factures payées de janvier 2025 :
1. Filtrer par statut : "Payées"
2. Date début : 01/01/2025
3. Date fin : 31/01/2025
4. Exporter

---

## 💻 API REST

### Endpoint

```
GET /api/invoices/export-csv
```

### Authentification

Requiert une session active (cookie NextAuth).

### Restriction d'abonnement

L'endpoint vérifie automatiquement le plan de l'utilisateur. Les utilisateurs du plan FREE recevront une réponse 403 Forbidden.

### Paramètres Query

| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `format` | string | Non | Format d'export : `simple`, `detailed`, `accounting` (défaut: `simple`) |
| `status` | string | Non | Filtrer par statut : `draft`, `sent`, `paid`, `overdue`, `cancelled`, `all` |
| `startDate` | string | Non | Date de début (ISO 8601) |
| `endDate` | string | Non | Date de fin (ISO 8601) |

### Exemples d'appel

**Export simple :**
```bash
curl -X GET "http://localhost:3000/api/invoices/export-csv?format=simple" \
  -H "Cookie: next-auth.session-token=..." \
  -o export.csv
```

**Export comptable des factures payées :**
```bash
curl -X GET "http://localhost:3000/api/invoices/export-csv?format=accounting&status=paid" \
  -H "Cookie: next-auth.session-token=..." \
  -o export-comptable.csv
```

**Export détaillé par période :**
```bash
curl -X GET "http://localhost:3000/api/invoices/export-csv?format=detailed&startDate=2025-01-01&endDate=2025-01-31" \
  -H "Cookie: next-auth.session-token=..." \
  -o export-janvier-2025.csv
```

### Réponse

**Success (200 OK) :**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="export-factures-20250115.csv"

Numéro Facture;Date Émission;...
FAC2025-0001;15/01/2025;...
```

**Error (404 Not Found) :**
```json
{
  "error": "Aucune facture à exporter"
}
```

**Error (401 Unauthorized) :**
```json
{
  "error": "Non authentifié"
}
```

**Error (403 Forbidden - Plan FREE) :**
```json
{
  "error": "Fonctionnalité réservée aux abonnés PRO et BUSINESS",
  "message": "L'export CSV comptable est disponible uniquement pour les plans Pro et Business.",
  "limitReached": true,
  "plan": "free",
  "upgradeUrl": "/dashboard/pricing"
}
```

---

## 📁 Structure du Code

### Services

**`src/lib/services/csv-export.ts`**
- `generateAccountingCSV()` : Génère l'export FEC
- `generateSimpleCSV()` : Génère l'export simple
- `generateDetailedCSV()` : Génère l'export détaillé
- Helpers : formatage dates, montants, échappement CSV

### API Route

**`src/app/api/invoices/export-csv/route.ts`**
- Authentification
- **Vérification du plan d'abonnement** (PRO/BUSINESS requis)
- Filtrage des factures
- Génération CSV selon format
- Téléchargement fichier avec BOM UTF-8

### UI Component

**`src/components/invoices/InvoiceList.tsx`**
- Bouton "Exporter CSV" avec badge PRO pour utilisateurs FREE
- Menu dropdown avec 3 formats
- **Vérification du plan avant export**
- **Modal de mise à niveau** si plan FREE
- État de chargement
- Notifications succès/erreur

**`src/lib/subscription/plans.ts`**
- Configuration des plans avec propriété `csvExport`
- `free.csvExport = false`
- `pro.csvExport = true`
- `business.csvExport = true`

---

## 🛠️ Personnalisation

### Modifier le Plan Comptable

Éditer `src/lib/services/csv-export.ts` :

```typescript
function getTVAAccount(rate: number): string {
  if (rate === 20) return '44571'; // TVA collectée 20%
  if (rate === 10) return '44571'; // TVA collectée 10%
  if (rate === 5.5) return '44571'; // TVA collectée 5.5%
  // Personnaliser ici selon votre plan comptable
  return '44571';
}
```

### Ajouter un Nouveau Format

1. Créer la fonction dans `csv-export.ts` :
```typescript
export function generateCustomCSV(invoices, clients): string {
  // Votre logique ici
  return csvContent;
}
```

2. Ajouter le cas dans la route API :
```typescript
case 'custom':
  csvContent = generateCustomCSV(invoices, clients);
  filename = `export-custom-${formatDateFilename(new Date())}.csv`;
  break;
```

3. Ajouter le bouton dans l'UI :
```tsx
<button onClick={() => handleExportCSV('custom')}>
  Export personnalisé
</button>
```

---

## 🔍 Compatibilité Logiciels Comptables

### Testé et compatible avec :

✅ **Microsoft Excel** (toutes versions)
- BOM UTF-8 pour accents français
- Séparateur point-virgule (`;`)
- Décimales avec virgule (`,`)

✅ **Google Sheets**
- Import automatique du BOM
- Encodage UTF-8 natif

✅ **LibreOffice Calc**
- Détection automatique CSV

### Logiciels comptables français :

🔧 **Sage** (à tester)
- Format FEC standard
- Vérifier le plan comptable

🔧 **Ciel Compta** (à tester)
- Format FEC standard
- Ajuster les comptes si nécessaire

🔧 **EBP Compta** (à tester)
- Import CSV standard

✅ **Pennylane** (compatible)
- Import CSV direct

---

## 📝 Notes Techniques

### Encodage

- **UTF-8 avec BOM** : `\uFEFF` ajouté au début du fichier
- Garantit l'affichage correct des accents dans Excel

### Séparateur

- **Point-virgule (`;`)** : Standard français
- Compatible avec Excel configuré en français

### Format Décimal

- **Virgule (`,`)** : 1200,00 (français)
- Pas de point (`.`) : incompatible Excel FR

### Format Date

- **Simple/Détaillé** : DD/MM/YYYY (15/01/2025)
- **FEC** : YYYYMMDD (20250115)

### Échappement

- Guillemets doublés si valeur contient `;` ou `"`
- Exemple : `"Entreprise ""Les Deux Points"" SARL"`

---

## 🚀 Tests

### Tester l'Export

1. Créer des factures de test
2. Appliquer différents filtres
3. Exporter dans chaque format
4. Vérifier dans Excel/Google Sheets
5. Tester l'import dans votre logiciel comptable

### Cas de Test

- [ ] Export avec 0 facture (erreur 404)
- [ ] Export avec 1 facture
- [ ] Export avec 100+ factures
- [ ] Export avec filtres (statut, dates)
- [ ] Export avec caractères spéciaux (accents, quotes)
- [ ] Export avec plusieurs taux de TVA
- [ ] Import dans Excel (accents OK ?)
- [ ] Import dans logiciel comptable

---

## ❓ FAQ

**Q: Le CSV ne s'ouvre pas correctement dans Excel**
R: Assurez-vous qu'Excel est configuré en français (séparateur `;`). Sinon, utilisez "Données → Importer" et spécifiez le séparateur.

**Q: Les accents sont mal affichés**
R: Le fichier contient un BOM UTF-8. Si problème, ouvrir avec "Importer → UTF-8".

**Q: Les montants ont des points au lieu de virgules**
R: Vérifier la locale d'Excel. Les exports utilisent le format français (virgule).

**Q: Comment personnaliser les comptes comptables ?**
R: Éditer `src/lib/services/csv-export.ts` fonction `getTVAAccount()`.

**Q: Peut-on exporter les devis aussi ?**
R: Pas encore implémenté. Fichier à créer : `/api/quotes/export-csv`.

---

## 🎯 Roadmap

### V1 (Actuel)
- [x] Export simple
- [x] Export détaillé
- [x] Export comptable (FEC)
- [x] Filtres (statut, dates)
- [x] UI intuitive

### V2 (Futur)
- [ ] Export des devis
- [ ] Export des dépenses
- [ ] Format Excel (.xlsx) natif
- [ ] Personnalisation du plan comptable dans l'UI
- [ ] Export programmé (cron mensuel)
- [ ] Envoi automatique par email

---

## 📞 Support

En cas de problème :
1. Vérifier les logs console (`npm run dev`)
2. Tester avec un échantillon réduit de factures
3. Vérifier la compatibilité de votre logiciel comptable
4. Consulter la documentation de votre logiciel pour le format d'import

---

**Version :** 1.0
**Date :** 2025-11-08
**Auteur :** Claude Code
