# Migration : Suppression du champ paymentStatus

**Date :** 15 novembre 2025  
**Auteur :** AI Assistant  
**Statut :** ✅ Terminé

---

## 🎯 Objectif

Simplifier le modèle `Invoice` en supprimant le champ redondant `paymentStatus` et en utilisant uniquement le champ `status` pour gérer l'état complet de la facture.

## 📋 Avant / Après

### ❌ Ancien système (Redondant)
```typescript
{
  status: 'sent',           // Statut global
  paymentStatus: 'paid'     // Statut de paiement (REDONDANT)
}
```

### ✅ Nouveau système (Simplifié)
```typescript
{
  status: 'paid'  // Un seul champ pour tout
}
```

## 🔄 Valeurs du champ `status`

- `draft` - Brouillon (non envoyée)
- `sent` - Envoyée au client (non payée)
- `paid` - Payée complètement
- `partially_paid` - Partiellement payée
- `overdue` - En retard de paiement
- `cancelled` - Annulée

## 📝 Changements effectués

### 1. Modèle Mongoose (`src/models/Invoice.ts`)
- ✅ Supprimé `paymentStatus` de l'interface `IInvoice`
- ✅ Supprimé le champ du schema Mongoose

### 2. Validations Zod (`src/lib/validations/invoices.ts`)
- ✅ Supprimé `paymentStatus` du `invoiceSchema`

### 3. Formulaire (`src/components/invoices/InvoiceFormModal.tsx`)
- ✅ Supprimé le select "Statut du paiement"
- ✅ Renommé en "Statut de la facture"
- ✅ Condition `form?.status === 'partially_paid'` pour le champ montant payé

### 4. Composants
- ✅ `InvoiceCard.tsx` : Remplacé `invoice.paymentStatus` par `invoice.status`
- ✅ `InvoiceList.tsx` : Mis à jour les filtres et stats
- ✅ `DashboardOverview.tsx` : Mis à jour le calcul du CA

### 5. Analytics (`src/lib/analytics/queries.ts`)
- ✅ Remplacement global de `$paymentStatus` par `$status`

### 6. Script de migration (`scripts/remove-payment-status.js`)
- ✅ Créé pour migrer les données existantes en BDD

## 🚀 Déploiement

### Étapes à suivre :

1. **Tester en local**
   ```bash
   npm run dev
   ```

2. **Exécuter la migration BDD** (une seule fois)
   ```bash
   node scripts/remove-payment-status.js
   ```

3. **Vérifier les données**
   - Toutes les factures doivent avoir un `status` valide
   - Le champ `paymentStatus` doit être supprimé

4. **Déployer en production**
   - Faire un backup de la BDD avant
   - Déployer le code
   - Exécuter le script de migration
   - Vérifier que tout fonctionne

## ⚠️ Points d'attention

- **Pas de rollback facile** : Une fois le champ supprimé, il faudra restaurer depuis un backup
- **Tester d'abord en dev/staging**
- **Analytics** : Les anciennes queries MongoDB qui utilisaient `paymentStatus` sont maintenant mises à jour

## ✅ Avantages

- ✅ **Simplicité** : Un seul champ à gérer
- ✅ **Clarté** : Pas de confusion entre status et paymentStatus
- ✅ **Maintenance** : Moins de code à maintenir
- ✅ **Performance** : Un champ de moins à indexer

---

**Fin de la migration** 🎉
