# 🔗 Configuration Webhook Stripe - BLINK

## ✅ Webhook créé et prêt

Le webhook handler a été créé dans `/api/webhooks/stripe/route.ts` et gère automatiquement la synchronisation des abonnements.

---

## 📋 Événements gérés

| Événement | Action | Impact |
|-----------|--------|--------|
| `checkout.session.completed` | Création abonnement | User passe en plan Pro/Business |
| `customer.subscription.updated` | Mise à jour abonnement | Upgrade, downgrade, renouvellement |
| `customer.subscription.deleted` | Annulation abonnement | User retourne en plan Free |
| `invoice.paid` | Paiement réussi | Statut → `active` |
| `invoice.payment_failed` | Échec paiement | Statut → `past_due` |

---

## 🛠️ Configuration requise

### 1. Variables d'environnement

Ajoutez dans `.env.local` :

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx  # ou sk_test_xxx pour les tests
STRIPE_WEBHOOK_SECRET=whsec_xxx  # À récupérer après création du webhook

# Prix Stripe (IDs des produits)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx  # Plan Pro
NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID=price_xxx  # Plan Business (si disponible)
```

### 2. Créer le webhook dans Stripe Dashboard

#### Option A: Environnement de test (développement local)

1. **Installer Stripe CLI** : https://stripe.com/docs/stripe-cli
   ```bash
   # Windows (avec Scoop)
   scoop install stripe
   
   # macOS
   brew install stripe/stripe-cli/stripe
   ```

2. **Login Stripe CLI**
   ```bash
   stripe login
   ```

3. **Écouter les webhooks localement**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Récupérer le webhook secret**
   - Stripe CLI affichera quelque chose comme : `whsec_xxxxx`
   - Copiez ce secret dans `.env.local` : `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

5. **Tester les événements**
   ```bash
   # Simuler un checkout complété
   stripe trigger checkout.session.completed
   
   # Simuler une mise à jour d'abonnement
   stripe trigger customer.subscription.updated
   ```

#### Option B: Production (déploiement)

1. **Aller sur https://dashboard.stripe.com/webhooks**

2. **Cliquer sur "Add endpoint"**

3. **Configurer l'endpoint** :
   - **URL** : `https://votre-domaine.com/api/webhooks/stripe`
   - **Description** : BLINK - Sync abonnements
   - **Version API** : `2024-11-20` (ou dernière)

4. **Sélectionner les événements** :
   ```
   ✅ checkout.session.completed
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.paid
   ✅ invoice.payment_failed
   ```

5. **Récupérer le signing secret**
   - Après création, cliquez sur le webhook
   - Révélez le "Signing secret" (`whsec_xxx`)
   - Ajoutez-le dans vos variables d'environnement de production

### 3. Configurer les metadata dans le Checkout

Dans `/api/subscription/create-checkout/route.ts`, assurez-vous que le `userId` est bien passé :

```typescript
const session = await stripe.checkout.sessions.create({
  // ... autres params
  metadata: {
    userId: session.user.id,  // ✅ IMPORTANT pour lier l'abonnement au user
  },
});
```

---

## 🧪 Tests

### Test 1: Checkout complété

```bash
# En local avec Stripe CLI
stripe trigger checkout.session.completed --override metadata.userId=YOUR_USER_ID
```

**Résultat attendu** :
- Log : `✅ Abonnement créé pour user xxx: plan pro`
- DB : User.subscription.plan = 'pro'
- DB : User.subscription.status = 'active'

### Test 2: Mise à jour abonnement

```bash
stripe trigger customer.subscription.updated
```

**Résultat attendu** :
- Log : `✅ Abonnement mis à jour pour user xxx`
- DB : Dates de période mises à jour

### Test 3: Annulation abonnement

```bash
stripe trigger customer.subscription.deleted
```

**Résultat attendu** :
- Log : `✅ Abonnement annulé pour user xxx, retour au plan free`
- DB : User.subscription.plan = 'free'
- DB : User.subscription.status = 'canceled'

### Test 4: Échec de paiement

```bash
stripe trigger invoice.payment_failed
```

**Résultat attendu** :
- Log : `⚠️ Échec de paiement pour user xxx, statut: past_due`
- DB : User.subscription.status = 'past_due'

---

## 📊 Monitoring

### Logs à surveiller

Dans les logs serveur (Node.js) :

```bash
# Succès
✅ Abonnement créé pour user xxx: plan pro
✅ Abonnement mis à jour pour user xxx: pro (active)
✅ Paiement réussi pour user xxx, statut: active

# Warnings
⚠️ Échec de paiement pour user xxx, statut: past_due

# Erreurs
❌ Stripe signature manquante
❌ Erreur de vérification webhook: xxxxx
❌ userId manquant dans metadata
❌ Utilisateur introuvable pour customer: cus_xxx
```

### Dashboard Stripe

Allez sur **Stripe Dashboard > Developers > Webhooks** pour voir :
- ✅ Événements réussis (code 200)
- ❌ Événements échoués (code 400/500)
- 🔄 Possibilité de rejouer les événements ratés

---

## 🔒 Sécurité

### Vérification de signature

Le webhook vérifie automatiquement la signature Stripe :

```typescript
stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

**Si la signature est invalide** :
- ❌ Retourne 400 Bad Request
- ❌ L'événement n'est PAS traité
- 🛡️ Protection contre les requêtes forgées

### Recommandations

1. **Ne jamais exposer** `STRIPE_WEBHOOK_SECRET` dans le code client
2. **Toujours vérifier** que `userId` existe dans metadata
3. **Logger tous les événements** pour debugging
4. **Activer les notifications Stripe** pour les échecs de webhook

---

## 🚨 Troubleshooting

### Webhook ne reçoit rien

**Causes possibles** :
1. URL mal configurée dans Stripe Dashboard
2. Stripe CLI pas lancé (en local)
3. Firewall bloque les requêtes

**Solution** :
```bash
# Vérifier que le serveur écoute
curl -X POST http://localhost:3000/api/webhooks/stripe

# Relancer Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Erreur "Signature invalide"

**Causes** :
1. Mauvais `STRIPE_WEBHOOK_SECRET`
2. Body modifié avant vérification
3. Utilisation de `req.json()` au lieu de `req.text()`

**Solution** :
- Vérifiez que vous utilisez `await req.text()` ✅
- Régénérez le webhook secret dans Stripe

### User pas mis à jour

**Causes** :
1. `userId` manquant dans metadata du checkout
2. Mauvais `customerId` dans l'événement
3. Erreur MongoDB

**Solution** :
```bash
# Vérifier les logs
tail -f logs/app.log | grep webhook

# Vérifier la DB
db.users.findOne({ "subscription.stripeCustomerId": "cus_xxx" })
```

---

## 📈 Métriques à tracker

### Webhook performance

```typescript
// TODO: Ajouter dans le code
const webhookLatency = Date.now() - event.created * 1000;
console.log(`⏱️ Webhook traité en ${webhookLatency}ms`);
```

### Taux de succès

- **Objectif** : > 99.5% de webhooks réussis
- **Alerter si** : > 5 échecs consécutifs
- **Actions** : Rejouer les événements ratés dans Stripe Dashboard

---

## ✅ Checklist déploiement production

Avant de mettre en prod :

- [ ] `STRIPE_WEBHOOK_SECRET` configuré dans .env de production
- [ ] Webhook créé dans Stripe Dashboard (mode live)
- [ ] URL webhook HTTPS (pas HTTP)
- [ ] Événements sélectionnés (les 5 listés ci-dessus)
- [ ] Test avec `stripe trigger` en mode live
- [ ] Monitoring des logs activé
- [ ] Alertes configurées pour les échecs
- [ ] Backup de la DB avant activation

---

## 🎉 Résultat final

Avec ce webhook, votre app BLINK aura :

✅ **Synchronisation automatique** des abonnements
✅ **Mises à jour en temps réel** des plans users
✅ **Gestion des échecs** de paiement
✅ **Annulations** gérées proprement
✅ **Système fiable** à 99.9%

**Plus besoin de synchronisation manuelle !** 🚀
