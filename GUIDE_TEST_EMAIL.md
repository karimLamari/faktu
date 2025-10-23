# 🚀 Guide de démarrage - Système d'envoi d'emails

## ⚙️ Configuration (5 minutes)

### 1. Créer un compte Resend
1. Aller sur [https://resend.com](https://resend.com)
2. S'inscrire gratuitement (100 emails/jour offerts)
3. Vérifier votre email

### 2. Obtenir la clé API
1. Aller dans **API Keys** dans le dashboard Resend
2. Cliquer sur **Create API Key**
3. Nommer la clé (ex: "FAKTU Development")
4. Copier la clé (format: `re_xxxxxxxxxxxxx`)

### 3. Configurer l'application
1. Ouvrir `.env.local` dans votre projet
2. Remplacer la ligne :
   ```bash
   RESEND_API_KEY=your-resend-api-key
   ```
   Par :
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx  # Votre vraie clé
   ```

### 4. Redémarrer le serveur
```powershell
cd invoice-app
npm run dev
```

---

## ✅ Test rapide (2 minutes)

### Test 1 : Envoyer une facture

1. **Créer une facture de test** :
   - Aller sur `/dashboard/invoices`
   - Cliquer "Nouvelle facture"
   - Remplir les champs minimum
   - Enregistrer (statut: draft)

2. **Envoyer la facture** :
   - Cliquer sur le bouton "📧 Envoyer"
   - Modal s'ouvre
   - Vérifier l'email (pré-rempli avec email du client)
   - **Remplacer par VOTRE email** pour le test
   - Cliquer "Envoyer"

3. **Vérifier** :
   - Toast "Email envoyé avec succès !"
   - Badge "Envoyée le..." apparaît sur la carte
   - **Checker votre boîte mail** (peut prendre 30s)
   - Email reçu avec design professionnel ✨

### Test 2 : Relancer un client

1. **Préparer une facture** :
   - Utiliser la facture envoyée ci-dessus
   - OU créer une facture avec statut "sent"

2. **Envoyer une relance** :
   - Cliquer sur "🔔 Relancer"
   - Modal s'ouvre
   - Choisir le type :
     - 🙂 **Amicale** : pour un premier rappel
     - ⚠️ **Ferme** : si déjà relancé
     - 🚨 **Dernière** : avant procédure
   - (Optionnel) Ajouter un message personnalisé
   - Cliquer "Envoyer la relance"

3. **Vérifier** :
   - Toast succès
   - Badge "🔔 1 relance" apparaît
   - Email de relance reçu avec le bon ton

---

## 🐛 Dépannage

### Erreur : "Configuration email invalide"
➡️ **Solution** : Vérifier que `RESEND_API_KEY` est bien dans `.env.local` et que le serveur a redémarré

### Erreur : "Domaine non vérifié"
➡️ **Solution** : C'est normal en dev ! Resend utilise `onboarding@resend.dev` qui marche toujours.  
Pour la production, il faudra vérifier votre propre domaine.

### L'email n'arrive pas
1. ✅ Vérifier votre dossier **Spam/Courrier indésirable**
2. ✅ Attendre 1-2 minutes (délai normal)
3. ✅ Vérifier sur le dashboard Resend : [https://resend.com/emails](https://resend.com/emails)
4. ✅ Regarder la console du navigateur (F12) pour les erreurs

### Erreur : "Vous devez attendre 7 jours"
➡️ **Solution** : C'est le rate limiting qui fonctionne ! Vous avez déjà envoyé une relance récemment.  
Pour tester, modifier temporairement le délai dans `/src/app/api/email/send-reminder/route.ts` ligne 82:
```typescript
if (daysSinceLastReminder < 1) { // Au lieu de < 7
```

---

## 📧 Domaine personnalisé (Production)

### Pourquoi ?
- Emails envoyés depuis votre domaine (`noreply@votredomaine.com`)
- Meilleure délivrabilité
- Plus professionnel

### Comment ?
1. Sur Resend, aller dans **Domains**
2. Cliquer "Add Domain"
3. Entrer votre domaine (ex: `votredomaine.com`)
4. Ajouter les enregistrements DNS fournis (SPF, DKIM)
5. Attendre la vérification (5-30 min)

### Mise à jour du code
Dans `/src/app/api/email/send-invoice/route.ts` et `send-reminder/route.ts`, remplacer :
```typescript
from: `${user.companyName} <onboarding@resend.dev>`
```
Par :
```typescript
from: `${user.companyName} <noreply@votredomaine.com>`
```

---

## 📊 Dashboard Resend

### Suivre vos emails
1. Aller sur [https://resend.com/emails](https://resend.com/emails)
2. Voir la liste de tous les emails envoyés
3. Cliquer sur un email pour voir :
   - Statut : Delivered / Bounced / Opened
   - Timestamp exact
   - Destinataire
   - Contenu HTML

### Analyser les performances
- **Delivered** : Email bien livré ✅
- **Bounced** : Email invalide/inexistant ❌
- **Opened** : Client a ouvert l'email 👀 (si analytics activées)

---

## 🎯 Fonctionnalités clés

| Fonctionnalité | Description |
|----------------|-------------|
| **Envoi facture** | Envoie la facture par email avec PDF (si disponible) |
| **3 types de relance** | Amicale → Ferme → Dernière (ton adapté) |
| **Rate limiting** | Max 1 relance tous les 7 jours (anti-spam) |
| **Historique** | Toutes les relances sauvegardées dans la BDD |
| **Badge compteur** | Affichage nombre de relances envoyées |
| **Date d'envoi** | Tracking exact de quand la facture a été envoyée |
| **Messages perso** | Ajout de messages personnalisés dans les relances |
| **Calcul retard** | Affichage automatique des jours de retard |

---

## 🔐 Sécurité

✅ **Toutes les routes API vérifient** :
- Session utilisateur authentifié
- Appartenance de la facture à l'utilisateur
- Existence du client et de son email
- Statut valide de la facture

✅ **Protection anti-spam** :
- Rate limiting 7 jours entre relances
- Impossible de relancer une facture payée
- Validation Zod de tous les inputs

---

## 📝 Checklist finale

Avant de passer au prochain sprint :

- [ ] Clé API Resend configurée
- [ ] Email de facture envoyé et reçu
- [ ] Email de relance envoyé et reçu
- [ ] Les 3 types de relance testés
- [ ] Badge compteur relances visible
- [ ] Rate limiting testé (erreur si < 7j)
- [ ] Dashboard Resend vérifié
- [ ] Aucune erreur dans la console

---

## 🎉 Prêt pour le Sprint 2 !

Une fois tout validé, vous pouvez passer au **Sprint 2 : Pagination & Performance** 🚀

**Durée estimée Sprint 2** : 2 jours  
**Objectif** : Gérer de gros volumes de données (100+ clients, 500+ factures)
