# 🔧 Fix - Numérotation Factures/Devis

## 🐛 Problème identifié

1. **Conflit d'index unique** : L'index `unique: true` sur `invoiceNumber` causait des erreurs car plusieurs utilisateurs pouvaient avoir le même numéro (FAC2025-0001)
2. **Manque de distinction client** : Tous les clients d'un utilisateur partageaient la même séquence de numérotation

## ✅ Solution implémentée

### 1. **Index Composite Unique**
- **Avant** : `invoiceNumber` unique globalement
- **Après** : `(userId, invoiceNumber)` unique par utilisateur
- Chaque utilisateur peut maintenant avoir FAC2025-0001 sans conflit

### 2. **Numérotation avec Code Client**
- **Avant** : `FAC2025-0001`, `FAC2025-0002`...
- **Après** : `FAC2025-ACM-0001`, `FAC2025-GOO-0002`...
  - `ACM` = 3 premières lettres du client "ACME Corp"
  - `GOO` = 3 premières lettres du client "Google"

### 3. **Format Factures**
```
FAC{YEAR}-{CLIENT_CODE}-{NUMBER}
Exemples:
- FAC2025-ACM-0001  (ACME Corp)
- FAC2025-ACM-0002  (ACME Corp)
- FAC2025-GOO-0001  (Google)
```

### 4. **Format Devis** (déjà robuste)
```
DEVIS-{CLIENT_NAME}-{YYYYMMDD}-{HHMMSS}
Exemple: DEVIS-ACMECORP-20250104-143022
```

## 📦 Fichiers modifiés

1. **Models**
   - `src/models/Invoice.ts` : Index `(userId, invoiceNumber)` unique
   - `src/models/Quote.ts` : Index `(userId, quoteNumber)` unique

2. **Services**
   - `src/lib/services/invoice-numbering.ts` : Ajout du code client

3. **API Routes**
   - `src/app/api/invoices/route.ts` : Passe `clientName` à la numérotation
   - `src/app/api/quotes/[id]/convert/route.ts` : Passe `clientName` à la conversion

4. **Scripts**
   - `scripts/fix-invoice-indexes.js` : Script de migration des index

## 🚀 Migration

### Étape 1 : Lancer le script de migration
```bash
node scripts/fix-invoice-indexes.js
```

Ce script va :
- ✅ Supprimer les anciens index `invoiceNumber_1` et `quoteNumber_1`
- ✅ Créer les nouveaux index composites `(userId, invoiceNumber)` et `(userId, quoteNumber)`

### Étape 2 : Redémarrer l'application
```bash
npm run build
# ou en dev
npm run dev
```

### Étape 3 : Tester
Créer une nouvelle facture pour vérifier le nouveau format :
- ✅ Numéro devrait ressembler à : `FAC2025-ACM-0001`
- ✅ Plus d'erreur E11000 duplicate key

## 📊 Avantages

1. **Multi-tenant sécurisé** : Chaque utilisateur a son propre espace de numérotation
2. **Traçabilité client** : Le code client dans le numéro facilite l'identification
3. **Pas de collision** : Index composite garantit l'unicité par utilisateur
4. **Évolutif** : Peut supporter des millions d'utilisateurs sans conflit

## ⚠️ Important

- Les **anciennes factures** gardent leur ancien format (FAC2025-0001)
- Les **nouvelles factures** utiliseront le nouveau format (FAC2025-ACM-0001)
- Si tu veux **renuméroter les anciennes**, il faudra un script de migration dédié

## 🔍 Vérification

Pour vérifier que les index sont corrects :
```javascript
// Dans MongoDB Compass ou Shell
db.invoices.getIndexes()
db.quotes.getIndexes()

// Tu devrais voir:
// { userId: 1, invoiceNumber: 1 } avec unique: true
// { userId: 1, quoteNumber: 1 } avec unique: true
```
