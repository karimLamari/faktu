# Configuration Email - Resend

## Problème actuel

L'envoi d'emails échoue avec l'erreur: `Erreur lors de l'envoi de l'email`

## Causes possibles

### 1. Clé API Resend invalide ou expirée
- La clé dans `.env.local` peut être invalide
- Elle peut avoir expiré ou été révoquée

### 2. Email "from" non vérifié
- Le code utilise `onboarding@resend.dev` qui est un domaine de test Resend
- Pour la production, vous devez configurer votre propre domaine

### 3. Quota Resend dépassé
- Le plan gratuit Resend a des limites (100 emails/jour)
- Vérifiez votre usage sur https://resend.com/

## Solutions

### Solution 1: Vérifier la clé API

1. Allez sur https://resend.com/api-keys
2. Vérifiez que votre clé est active
3. Si nécessaire, créez une nouvelle clé
4. Mettez à jour `.env.local`:

```bash
RESEND_API_KEY=re_votre_nouvelle_cle
```

### Solution 2: Tester la configuration

Visitez l'endpoint de test:
```
http://localhost:3000/api/email/test
```

Cela enverra un email de test et vous donnera des détails sur l'erreur.

### Solution 3: Configurer un domaine personnalisé (Production)

1. **Ajoutez un domaine dans Resend:**
   - Allez sur https://resend.com/domains
   - Cliquez "Add Domain"
   - Entrez votre domaine (ex: votresite.com)

2. **Configurez les DNS:**
   - Resend vous donnera des enregistrements DNS (SPF, DKIM, etc.)
   - Ajoutez-les dans votre hébergeur de domaine

3. **Attendez la vérification:**
   - Resend vérifiera automatiquement les enregistrements DNS
   - Cela peut prendre quelques minutes à 24h

4. **Mettez à jour le code:**

Dans `src/app/api/email/send-invoice/route.ts`, ligne ~107:

```typescript
// Avant:
from: `${user.companyName} <onboarding@resend.dev>`,

// Après:
from: `${user.companyName} <factures@votredomaine.com>`,
```

### Solution 4: Utiliser le mode test (Développement)

Pour tester sans configurer de domaine:

```typescript
// Dans send-invoice/route.ts
const emailResponse = await resend.emails.send({
  from: 'onboarding@resend.dev', // Email de test Resend
  to: 'delivered@resend.dev',     // Email de test qui reçoit toujours
  // ... reste de la config
});
```

## Vérifications rapides

### Voir les logs serveur:
```bash
npm run dev
```

Cherchez ces messages:
- `🔑 Resend API Key présente: true/false`
- `📬 Réponse Resend: {...}`
- `❌ Pas de données dans la réponse Resend`

### Variables d'environnement:
```bash
# Vérifiez que .env.local contient:
RESEND_API_KEY=re_...
```

### Redémarrer le serveur:
Après modification de `.env.local`, **redémarrez toujours** le serveur de dev:
```bash
Ctrl+C
npm run dev
```

## Plan gratuit Resend

Limites:
- ✅ 100 emails/jour
- ✅ 3,000 emails/mois
- ✅ Domaine de test inclus
- ❌ Pas de domaine personnalisé (nécessite upgrade)

Pour augmenter les limites: https://resend.com/pricing

## Contact Support

Si le problème persiste:
1. Visitez `/api/email/test` pour le diagnostic complet
2. Copiez les logs d'erreur
3. Contactez le support Resend: https://resend.com/support
