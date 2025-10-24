# 📱 FAKTU - Gestion de Factures

![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=flat-square&logo=pwa)
![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)

Application complète de gestion de factures pour freelances et petites entreprises.

---

## ✨ Features

- ✅ **PWA Complète** - Installable, mode offline, expérience native
- ✅ Gestion clients & factures
- ✅ Génération PDF professionnelle
- ✅ Envoi emails automatique (Resend)
- ✅ Authentification sécurisée (NextAuth v5)
- ✅ Dashboard avec statistiques
- ✅ Mode sombre / clair
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Docker ready

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

---

## 📱 PWA Installation

FAKTU est une Progressive Web App complète ! Pour installer :

```bash
# 1. Installer Sharp pour la génération d'icônes
npm install sharp --save-dev

# 2. Générer les icônes PWA
npm run generate-icons

# 3. Lancer l'app
npm run dev
```

**Puis :**
- 🖥️ **Desktop** : Cliquer sur l'icône ➕ dans la barre d'adresse Chrome
- 📱 **Mobile** : Menu → "Ajouter à l'écran d'accueil"

📖 **Documentation complète :** [PWA_README.md](./PWA_README.md)  
⚡ **Guide rapide :** [PWA_QUICKSTART.md](./PWA_QUICKSTART.md)

---

## 📚 Documentation

- **[ANALYSE_PROJET_FEATURES.md](./ANALYSE_PROJET_FEATURES.md)** - Analyse complète + Roadmap
- **[PWA_README.md](./PWA_README.md)** - Documentation PWA détaillée
- **[PWA_QUICKSTART.md](./PWA_QUICKSTART.md)** - Installation PWA en 3 étapes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide déploiement VPS
- **[DOCKER_WINDOWS.md](./DOCKER_WINDOWS.md)** - Guide Docker Windows

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** NextAuth v5
- **Styling:** Tailwind CSS + Radix UI
- **PDF:** Puppeteer
- **Email:** Resend API
- **PWA:** Service Worker + Manifest
- **Deployment:** Docker + Nginx

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
