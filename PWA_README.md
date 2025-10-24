# 📱 PWA - Progressive Web App

FAKTU est désormais une **Progressive Web App** complète, installable sur tous les appareils !

---

## ✨ Fonctionnalités PWA

### 🚀 **Installation**
- ✅ Installable sur desktop (Windows, Mac, Linux)
- ✅ Installable sur mobile (iOS, Android)
- ✅ Icône sur l'écran d'accueil
- ✅ Lancement en mode standalone (sans barre d'adresse)

### 📶 **Mode Hors Ligne**
- ✅ Service Worker avec cache intelligent
- ✅ Pages visitées disponibles offline
- ✅ Page offline personnalisée
- ✅ Stratégie cache-first pour assets statiques

### 🎨 **Expérience Native**
- ✅ Theme color (#3B82F6)
- ✅ Splash screen automatique
- ✅ Support Apple Touch Icon
- ✅ Maskable icons (Android)
- ✅ Shortcuts (raccourcis contextuels)

---

## 🛠️ Installation de la PWA

### **1. Générer les Icônes**

Les icônes ne sont pas générées par défaut. Exécutez :

```bash
# Installer sharp (si pas déjà fait)
npm install sharp --save-dev

# Générer toutes les icônes PWA
node scripts/generate-icons.js
```

Cela va créer :
- ✅ `public/icons/icon-{size}x{size}.png` (72 à 512px)
- ✅ `public/icons/icon-{size}x{size}-maskable.png`
- ✅ `public/favicon.ico`
- ✅ `public/apple-touch-icon.png`

### **2. Tester en Local**

```bash
npm run dev
```

Ouvrir Chrome DevTools → **Application** → **Manifest** → Vérifier que tout est OK

### **3. Tester l'Installation**

**Sur Desktop (Chrome/Edge) :**
- Cliquer sur l'icône ➕ dans la barre d'adresse
- Ou **Menu** → **Installer FAKTU**

**Sur Mobile (Chrome Android) :**
- Bannière d'installation automatique après 2 visites
- Ou **Menu** → **Ajouter à l'écran d'accueil**

**Sur iOS (Safari) :**
- **Partager** → **Sur l'écran d'accueil**

---

## 📁 Structure PWA

```
public/
├── manifest.json              # Configuration PWA
├── sw.js                      # Service Worker
├── offline.html               # Page hors ligne
├── icon.svg                   # Source icône (pour génération)
├── icon-maskable.svg          # Source icône maskable
├── apple-touch-icon.png       # Icône iOS (180x180)
├── favicon.ico                # Favicon (32x32)
└── icons/                     # Toutes les tailles d'icônes
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── icon-192x192-maskable.png
    └── icon-512x512-maskable.png

src/
├── app/layout.tsx             # Metadata PWA
└── components/
    └── providers/
        └── PWAInstaller.tsx   # Composant d'installation
```

---

## ⚙️ Configuration

### **manifest.json**

Propriétés principales :
```json
{
  "name": "FAKTU - Gestion de Factures",
  "short_name": "FAKTU",
  "start_url": "/dashboard",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff"
}
```

### **Service Worker (sw.js)**

Stratégies de cache :
- **Assets statiques** (JS, CSS, images) → **Cache First**
- **API calls** → **Network Only** (avec fallback offline)
- **Pages HTML** → **Cache First** + mise à jour en arrière-plan

Caches :
- `faktu-v1` : Assets statiques
- `faktu-runtime-v1` : Pages dynamiques

### **PWAInstaller Component**

Features :
- ✅ Détection de l'installabilité
- ✅ Bannière d'installation personnalisée
- ✅ Enregistrement automatique du Service Worker
- ✅ Détection si déjà installé (display-mode: standalone)

---

## 🧪 Tests PWA

### **1. Lighthouse Audit**

Chrome DevTools → **Lighthouse** → **Progressive Web App**

Objectifs :
- ✅ Score PWA > 90
- ✅ Installable : Oui
- ✅ Service Worker : Enregistré
- ✅ Manifest : Valide
- ✅ Offline : Fonctionne

### **2. Test Offline**

1. Ouvrir DevTools → **Network**
2. Cocher **Offline**
3. Rafraîchir la page
4. ✅ Devrait afficher `offline.html`

### **3. Test Cache**

1. DevTools → **Application** → **Cache Storage**
2. Vérifier `faktu-v1` contient les assets
3. Naviguer dans l'app
4. Vérifier `faktu-runtime-v1` se remplit

### **4. Test sur Appareils Réels**

**Android :**
- Chrome → Menu → Installer l'application
- Vérifier icône sur écran d'accueil
- Lancer en mode standalone

**iOS :**
- Safari → Partager → Sur l'écran d'accueil
- Lancer depuis l'écran d'accueil

---

## 🚀 Déploiement

### **Prérequis Production**

✅ **HTTPS obligatoire** (Service Worker ne marche qu'en HTTPS ou localhost)

### **Vérifications**

```bash
# Build production
npm run build

# Tester le build
npm start

# Vérifier
curl https://votre-domaine.com/manifest.json
curl https://votre-domaine.com/sw.js
```

### **Nginx Configuration**

Ajouter headers pour le Service Worker :

```nginx
location /sw.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Service-Worker-Allowed "/";
}

location /manifest.json {
    add_header Cache-Control "public, max-age=86400";
}
```

---

## 📊 Shortcuts (Raccourcis Contextuels)

Disponibles sur Android (long press sur l'icône) :

1. **Nouvelle Facture** → `/dashboard/invoices?action=new`
2. **Nouveau Client** → `/dashboard/clients?action=new`
3. **Tableau de bord** → `/dashboard`

---

## 🔄 Mises à Jour

Le Service Worker se met à jour automatiquement :

1. Nouvelle version détectée
2. Nouveau SW téléchargé en arrière-plan
3. Activation au prochain rechargement

Pour forcer la mise à jour :

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

---

## 🐛 Debugging

### **Voir les logs du Service Worker**

Chrome : `chrome://serviceworker-internals/`

### **Désinstaller le Service Worker**

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

### **Clear Cache**

DevTools → **Application** → **Clear Storage** → **Clear site data**

---

## 📈 Métriques PWA

### **Objectifs de Performance**

- ⚡ First Contentful Paint < 2s
- ⚡ Time to Interactive < 3.8s
- ⚡ Speed Index < 4.3s
- 📦 Total Size < 1MB

### **Analytics**

Tracker l'installation :

```javascript
window.addEventListener('appinstalled', () => {
  // Envoyer événement analytics
  gtag('event', 'pwa_install');
});
```

---

## 🌟 Améliorations Futures

### **Phase 1**
- ✅ PWA basique installable
- ✅ Service Worker cache
- ✅ Mode offline

### **Phase 2** (À venir)
- ⏳ Push Notifications (relances automatiques)
- ⏳ Background Sync (envoi factures offline)
- ⏳ Share Target API (recevoir fichiers)
- ⏳ File System Access API (export local)

### **Phase 3** (Avancé)
- ⏳ Periodic Background Sync
- ⏳ Web Share API niveau 2
- ⏳ Badges API (compteur notifications)
- ⏳ Contact Picker API

---

## 📚 Ressources

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev - PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox (Google)](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)

---

## ✅ Checklist PWA

- [x] Manifest.json valide
- [x] Service Worker enregistré
- [x] HTTPS (en production)
- [x] Icons (multiples tailles)
- [x] Theme color
- [x] Apple Touch Icon
- [x] Offline fallback
- [x] Installation prompt
- [x] Viewport meta tag
- [x] Cache strategy
- [x] Shortcuts
- [x] Maskable icons

---

**🎉 FAKTU est maintenant une PWA complète !**

Installation instantanée, mode offline, expérience native. 🚀
