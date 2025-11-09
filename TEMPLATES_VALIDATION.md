# Validation des Templates PDF

## ✅ Templates disponibles

Tous les templates suivants sont configurés et prêts à l'emploi :

### 1. Modern (Par défaut) 🔵
```typescript
{
  name: 'Moderne',
  colors: {
    primary: '#2563eb',  // Bleu vif
    secondary: '#64748b',
    accent: '#10b981',
    text: '#1e293b',
    background: '#ffffff'
  },
  fonts: {
    heading: 'Inter, -apple-system, sans-serif',
    body: 'Inter, -apple-system, sans-serif',
    size: { base: 10, heading: 18, small: 8 }
  },
  layout: {
    logoPosition: 'left',
    logoSize: 'medium',
    headerStyle: 'modern',  // Barre de couleur
    borderRadius: 6,
    spacing: 'compact'
  },
  sections: {
    showLogo: true,
    showBankDetails: true,
    showPaymentTerms: true,
    showLegalMentions: true,
    showItemDetails: false,
    showCompanyDetails: true,
    showClientDetails: true
  }
}
```
**Utilisation :** Idéal pour startups, agences digitales, freelances tech

---

### 2. Classic 🎩
```typescript
{
  name: 'Classique',
  colors: {
    primary: '#1a1a1a',  // Noir élégant
    secondary: '#525252',
    accent: '#b8860b',   // Or sombre
    text: '#171717',
    background: '#ffffff'
  },
  fonts: {
    heading: 'Georgia, Garamond, serif',
    body: 'Georgia, Times New Roman, serif',
    size: { base: 10, heading: 20, small: 8 }
  },
  layout: {
    logoPosition: 'center',
    logoSize: 'large',
    headerStyle: 'classic',  // Double bordure
    borderRadius: 0,         // Sans arrondi
    spacing: 'normal'
  },
  sections: {
    showItemDetails: true,   // Affiche détails items ⭐
    // ... tous à true
  }
}
```
**Utilisation :** Cabinets d'avocats, notaires, comptables, entreprises traditionnelles

---

### 3. Minimal ⚫
```typescript
{
  name: 'Minimaliste',
  colors: {
    primary: '#000000',  // Noir pur
    secondary: '#737373',
    accent: '#404040',
    text: '#0a0a0a',
    background: '#ffffff'
  },
  fonts: {
    heading: 'Helvetica Neue, Arial, sans-serif',
    body: 'Helvetica, Arial, sans-serif',
    size: { base: 10, heading: 18, small: 8 }
  },
  layout: {
    logoPosition: 'left',
    logoSize: 'small',
    headerStyle: 'minimal',  // Sans bordure
    borderRadius: 0,
    spacing: 'compact'
  },
  sections: {
    showPaymentTerms: false,  // Pas de modalités ⭐
    showItemDetails: false,
    // ... essentiels uniquement
  },
  customText: {
    invoiceTitle: 'INVOICE',  // Anglais ⭐
    legalMentionsType: 'micro-entreprise'
  }
}
```
**Utilisation :** Micro-entreprises, auto-entrepreneurs, designers, photographes

---

### 4. Creative 🎨
```typescript
{
  name: 'Créatif',
  colors: {
    primary: '#7c3aed',  // Violet vif
    secondary: '#6b7280',
    accent: '#f59e0b',   // Orange
    text: '#111827',
    background: '#ffffff'
  },
  fonts: {
    heading: 'Poppins, Montserrat, sans-serif',
    body: 'Inter, -apple-system, sans-serif',
    size: { base: 11, heading: 26, small: 9 }
  },
  layout: {
    logoPosition: 'right',   // Logo à droite ⭐
    logoSize: 'medium',
    headerStyle: 'modern',
    borderRadius: 12,        // Très arrondis ⭐
    spacing: 'normal'
  },
  customText: {
    legalMentionsType: 'profession-liberale',
    footerText: 'Merci ! 🎨'  // Emoji fun ⭐
  }
}
```
**Utilisation :** Agences créatives, graphistes, marketeurs, influenceurs

---

## 🧪 Plan de test

### Test 1 : Vérification des imports
```bash
cd C:/Users/lkari/Desktop/BILLS/invoice-app
npm run dev
```

✅ Vérifier qu'aucune erreur d'import n'apparaît au démarrage

---

### Test 2 : Génération PDF avec chaque template

#### Méthode A : Via l'interface utilisateur (Recommandé)

1. **Se connecter** à l'application
2. **Créer une facture de test** :
   - Client : Test Client
   - Items : 2-3 lignes
   - Total : ~1000€

3. **Tester chaque template** :
   - Aller dans Paramètres → Templates
   - Sélectionner "Modern" → Définir par défaut
   - Retourner à la facture → Télécharger PDF
   - ✅ Vérifier le rendu (bleu, compact, barre de couleur)

   - Sélectionner "Classic" → Définir par défaut
   - Télécharger PDF
   - ✅ Vérifier (noir/or, serif, double bordure, logo centré)

   - Sélectionner "Minimal" → Définir par défaut
   - Télécharger PDF
   - ✅ Vérifier (noir/blanc, compact, sans bordures)

   - Sélectionner "Creative" → Définir par défaut
   - Télécharger PDF
   - ✅ Vérifier (violet/orange, logo droite, arrondis)

#### Méthode B : Test API direct (Plus rapide)

Utiliser un client API (Thunder Client, Postman, ou curl) :

```bash
# 1. S'authentifier et obtenir le session cookie
# 2. Créer une facture via POST /api/invoices
# 3. Générer PDF via GET /api/invoices/{id}/pdf
```

**Avec curl (Windows PowerShell) :**
```powershell
# Obtenir le cookie de session (remplacer avec vos identifiants)
$session = curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"user@example.com","password":"password"}' `
  -c cookies.txt

# Télécharger PDF d'une facture existante
curl -X GET http://localhost:3000/api/invoices/INVOICE_ID_HERE/pdf `
  -b cookies.txt `
  -o facture_test.pdf
```

---

### Test 3 : Envoi email avec PDF

1. Configurer `.env` avec une clé Resend valide :
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

2. Envoyer une facture par email :
   - Ouvrir une facture
   - Cliquer "Envoyer par email"
   - Entrer l'email du destinataire
   - ✅ Vérifier réception
   - ✅ Vérifier que le PDF est attaché
   - ✅ Vérifier que le template est correct

---

### Test 4 : Devis (Quote)

1. Créer un devis
2. Télécharger le PDF
3. ✅ Vérifier :
   - Thème vert (différent des factures)
   - Date de validité affichée
   - Avis de validité (bannière jaune)
   - Notes et conditions (si renseignées)

---

## ✅ Checklist de validation

### Fonctionnalités générales
- [ ] PDF se génère en < 1 seconde (vs 4s avant)
- [ ] Aucune erreur dans la console
- [ ] Pas de warning TypeScript
- [ ] Format A4 correct
- [ ] Encodage UTF-8 (accents français corrects)

### Template Modern
- [ ] Couleur primaire bleue (#2563eb)
- [ ] Barre de couleur en header
- [ ] Logo à gauche, taille medium
- [ ] Espacement compact
- [ ] Font Inter/system

### Template Classic
- [ ] Couleur primaire noire (#1a1a1a)
- [ ] Accent doré (#b8860b)
- [ ] Double bordure en header
- [ ] Logo centré, grande taille
- [ ] Font serif (Georgia)
- [ ] Détails des items affichés

### Template Minimal
- [ ] Tout en noir/blanc
- [ ] Pas de bordures
- [ ] Logo petit, à gauche
- [ ] Espacement très compact
- [ ] Titre "INVOICE" (anglais)
- [ ] Pas de modalités de paiement

### Template Creative
- [ ] Couleur violette (#7c3aed)
- [ ] Accent orange (#f59e0b)
- [ ] Logo à droite
- [ ] Bordures arrondies (12px)
- [ ] Font Poppins/Montserrat
- [ ] Footer avec emoji "Merci ! 🎨"

### Sections conditionnelles (tous templates)
- [ ] Logo affiché si `showLogo: true`
- [ ] Coordonnées bancaires si `showBankDetails: true`
- [ ] Modalités de paiement si `showPaymentTerms: true`
- [ ] Mentions légales si `showLegalMentions: true`
- [ ] Détails items si `showItemDetails: true` (Classic uniquement)

### Calculs
- [ ] TVA calculée correctement par taux
- [ ] Total HT correct
- [ ] Total TTC correct
- [ ] Paiements partiels affichés (si applicable)
- [ ] Reste à payer calculé correctement

### Données dynamiques
- [ ] Numéro de facture correct
- [ ] Dates formatées en français (JJ/MM/AAAA)
- [ ] Nom client correct
- [ ] Adresse client correcte
- [ ] Logo utilisateur affiché (si fourni)
- [ ] SIRET/TVA affichés (si fournis)

---

## 🐛 Problèmes potentiels et solutions

### Problème 1 : Fonts custom ne s'affichent pas
**Symptôme :** Police par défaut (Helvetica) partout

**Solution :**
```typescript
// Dans invoice-pdf-react.tsx, ajouter :
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
});
```

### Problème 2 : Images (logos) ne se chargent pas
**Symptôme :** Carré blanc à la place du logo

**Solution :**
- Vérifier que l'URL du logo est accessible
- Utiliser des URLs absolutes (pas relatives)
- Encoder en base64 si nécessaire

### Problème 3 : PDF vide ou erreur
**Symptôme :** PDF téléchargé mais vide

**Solution :**
- Vérifier les logs console pour les erreurs React-PDF
- S'assurer que toutes les données (invoice, client, user) sont présentes
- Vérifier que le template n'est pas `null`

### Problème 4 : Styles CSS non appliqués
**Symptôme :** PDF en noir/blanc basique

**Rappel :** @react-pdf/renderer n'utilise PAS de CSS classique !
- Utiliser `StyleSheet.create()` uniquement
- Pas de classes CSS ni de :hover
- Sous-ensemble limité de propriétés CSS

---

## 📊 Résultat attendu

Après validation complète, vous devriez avoir :

✅ **4 templates** fonctionnels et distincts
✅ **Génération instantanée** (< 1s)
✅ **Aucune erreur** dans la console
✅ **PDFs parfaitement formatés** en français
✅ **Envoi email** avec PDF attaché
✅ **Compatibilité Windows** sans Chromium

---

## 📝 Rapport de validation

Une fois les tests terminés, remplir ce rapport :

```
Date de validation : _____________
Testeur : _____________

Templates validés :
[ ] Modern
[ ] Classic
[ ] Minimal
[ ] Creative

Fonctionnalités validées :
[ ] Génération PDF facture
[ ] Génération PDF devis
[ ] Envoi email facture
[ ] Envoi email devis
[ ] Template personnalisé utilisateur
[ ] Sections conditionnelles
[ ] Calculs TVA
[ ] Paiements partiels

Performance :
Temps moyen génération : _____ ms
RAM utilisée : _____ MB

Bugs trouvés :
1. ________________
2. ________________

Prêt pour production : [ ] OUI  [ ] NON
```

---

## 🚀 Prochaines étapes après validation

1. **Supprimer les fonctions `_DEPRECATED`** (une fois validé)
2. **Supprimer les anciens fichiers de templates HTML** (backup Git)
3. **Ajouter tests automatisés** (Jest + React-PDF)
4. **Documenter pour l'équipe** (si applicable)
5. **Déployer en production** 🎉
