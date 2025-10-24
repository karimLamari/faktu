# 🚀 PWA Installation - Guide Rapide

## ⚡ Installation en 3 Étapes

### 1️⃣ Installer Sharp
```bash
npm install sharp --save-dev
```

### 2️⃣ Générer les Icônes
```bash
npm run generate-icons
```

### 3️⃣ Lancer l'App
```bash
npm run dev
```

---

## ✅ Vérifier l'Installation

### **Chrome DevTools**
1. Ouvrir `http://localhost:3000`
2. **DevTools** (F12) → **Application**
3. Vérifier :
   - ✅ **Manifest** : Valide
   - ✅ **Service Workers** : Enregistré
   - ✅ **Icons** : Chargées

### **Tester l'Installation Desktop**
1. Cliquer sur l'icône ➕ dans la barre d'adresse
2. Ou Chrome Menu → **Installer FAKTU**
3. ✅ L'app s'ouvre en fenêtre standalone

---

## 📱 Test Mobile

### **Android (Chrome)**
1. Visiter le site 2 fois
2. Bannière d'installation apparaît automatiquement
3. Ou Menu → **Ajouter à l'écran d'accueil**

### **iOS (Safari)**
1. Bouton **Partager** (en bas)
2. **Sur l'écran d'accueil**
3. Icône FAKTU ajoutée

---

## 🧪 Test Offline

1. **DevTools** → **Network** → Cocher **Offline**
2. Rafraîchir la page
3. ✅ Page offline s'affiche

---

## 📂 Fichiers PWA Créés

```
✅ public/manifest.json              # Config PWA
✅ public/sw.js                      # Service Worker
✅ public/offline.html               # Page hors ligne
✅ public/icon.svg                   # Icône source
✅ public/icon-maskable.svg          # Icône maskable
✅ scripts/generate-icons.js         # Script génération
✅ src/components/providers/PWAInstaller.tsx
✅ src/app/layout.tsx                # Metadata PWA
```

---

## 🔧 Commandes Utiles

```bash
# Générer les icônes
npm run generate-icons

# Build production
npm run build

# Démarrer en production
npm start

# Vérifier le manifest (si jq installé)
npm run pwa-check
```

---

## 🌐 Déploiement Production

### **Prérequis**
- ✅ HTTPS obligatoire (Service Worker)
- ✅ Icônes générées
- ✅ Build production testée

### **Checklist Déploiement**
- [ ] Générer toutes les icônes : `npm run generate-icons`
- [ ] Build : `npm run build`
- [ ] Tester : `npm start` puis ouvrir DevTools
- [ ] Vérifier Lighthouse score PWA > 90
- [ ] Déployer sur serveur HTTPS
- [ ] Tester installation sur mobile réel

---

## 🐛 Problèmes Courants

### **"Service Worker not registered"**
➜ Vérifier HTTPS (ou localhost)

### **"Manifest fetch failed"**
➜ Vérifier `/manifest.json` accessible

### **"Icons not loading"**
➜ Lancer `npm run generate-icons`

### **"Install banner not showing"**
➜ Visiter le site 2 fois minimum (Android)

---

## 📊 Score Lighthouse Attendu

- ✅ **Performance** : > 90
- ✅ **Accessibility** : > 90
- ✅ **Best Practices** : > 90
- ✅ **SEO** : > 90
- ✅ **PWA** : > 90

---

## 🎉 Prêt !

L'app est maintenant une **PWA complète** :
- ✅ Installable
- ✅ Mode offline
- ✅ Icônes natives
- ✅ Expérience app

**Documentation complète :** `PWA_README.md`
