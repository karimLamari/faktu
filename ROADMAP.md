# 🗺️ ROADMAP - Application FAKTU
**Date de création** : 23 octobre 2025  
**Version** : 1.0  
**Status projet** : Phase 2 - Finalisation MVP

---

## 📊 Vue d'ensemble

### État actuel
- **Fonctionnalités core** : 90% complètes
- **Architecture** : ✅ Solide et scalable
- **Sécurité** : ✅ NextAuth + Validation Zod
- **UX/UI** : ✅ Moderne et responsive

### Objectif
Finaliser le **MVP complet** avec toutes les fonctionnalités essentielles, puis améliorer progressivement l'expérience utilisateur et la robustesse.

---

## 🎯 PHASE 2 : Finalisation MVP (2 semaines)

### Sprint 1 : Envoi d'emails & Relances (4-5 jours)
**Objectif** : Permettre l'envoi de factures par email avec suivi et système de relance automatique

#### 📋 Tâches
1. **Configuration Resend** (30 min)
   - [ ] Créer compte Resend / récupérer API key
   - [ ] Ajouter `RESEND_API_KEY` dans `.env.local`
   - [ ] Vérifier domaine email ou utiliser domaine test Resend

2. **Backend - Route API Email** (2h)
   - [ ] Créer `/src/app/api/email/send-invoice/route.ts`
   - [ ] Validation Zod du payload (invoiceId, recipient email)
   - [ ] Vérification sécurité (userId, existence facture)
   - [ ] Génération PDF inline ou référence URL
   - [ ] Template HTML email responsive
   - [ ] Intégration Resend SDK
   - [ ] Gestion erreurs (domaine non vérifié, rate limit, etc.)
   - [ ] Mise à jour Invoice : `sentAt` timestamp

3. **Frontend - Interface envoi** (2h)
   - [ ] Ajouter bouton "Envoyer par email" dans `InvoiceCard`
   - [ ] Modal confirmation avec champ email destinataire (pré-rempli client)
   - [ ] Loading state pendant envoi
   - [ ] Toast de succès/erreur
   - [ ] Badge "Envoyé le XX/XX/XXXX" sur les factures envoyées

4. **Template Email** (1h30)
   - [ ] Créer `/src/lib/templates/invoice-email.ts`
   - [ ] HTML responsive (mobile-first)
   - [ ] Message personnalisé + résumé facture
   - [ ] Bouton "Voir la facture" (lien PDF)
   - [ ] Footer avec infos entreprise
   - [ ] Test sur différents clients email (Gmail, Outlook)

5. **Backend - Route API Relance client** (1h30)
   - [ ] Créer `/src/app/api/email/send-reminder/route.ts`
   - [ ] Validation Zod du payload (invoiceId, customMessage optionnel)
   - [ ] Vérification : facture impayée ou en retard
   - [ ] Template email relance (plus ferme que l'email initial)
   - [ ] Tracking des relances : ajouter champ `reminders[]` dans Invoice
   - [ ] Limiter fréquence relances (max 1 par semaine)

6. **Frontend - Bouton relance client** (1h30)
   - [ ] Ajouter bouton "Relancer le client" dans `InvoiceCard`
   - [ ] Visible uniquement si statut = 'sent' ou 'overdue'
   - [ ] Modal avec message personnalisable
   - [ ] Suggestions messages : "Relance amicale", "Relance ferme", "Dernière relance"
   - [ ] Preview email avant envoi
   - [ ] Afficher historique relances sous la facture
   - [ ] Badge compteur relances "🔔 2 relances"

7. **Tests & Validation** (1h)
   - [ ] Test envoi à email réel
   - [ ] Vérifier délivrabilité (inbox, pas spam)
   - [ ] Test erreurs (email invalide, API down)
   - [ ] Vérifier mise à jour `sentAt` en base
   - [ ] Test limite fréquence relances
   - [ ] Test historique relances sauvegardé

**✅ Critères de succès**
- ✓ Envoi email fonctionnel avec PDF en pièce jointe
- ✓ Tracking de la date d'envoi
- ✓ Système de relance client opérationnel
- ✓ Historique complet des relances
- ✓ Limite fréquence relances (anti-spam)
- ✓ Gestion erreurs claire
- ✓ UX fluide et feedback utilisateur

---

### Sprint 2 : Pagination & Performance (2 jours)

**Objectif** : Améliorer la scalabilité pour gérer des volumes importants

#### 📋 Tâches

1. **Backend - Pagination API** (2h)
   - [ ] Ajouter params `page` et `limit` à `/api/clients`
   - [ ] Ajouter params `page` et `limit` à `/api/invoices`
   - [ ] Retourner metadata : `{ data, total, page, totalPages }`
   - [ ] Optimiser queries MongoDB (projection, lean())
   - [ ] Ajouter index composé pour tri + pagination

2. **Frontend - Pagination UI** (2h)
   - [ ] Créer component `Pagination.tsx` réutilisable
   - [ ] Boutons Précédent / Suivant
   - [ ] Indicateur "Page X sur Y"
   - [ ] Select nombre d'éléments par page (10, 25, 50)
   - [ ] Intégrer dans `ClientList` et `InvoiceList`

3. **Optimisations performance** (1h30)
   - [ ] Lazy loading images/logos
   - [ ] Debounce sur recherche instantanée (300ms)
   - [ ] Memoization composants lourds (`React.memo`)
   - [ ] Optimiser re-renders inutiles
   - [ ] Code splitting routes dashboard

4. **Tests performance** (30 min)
   - [ ] Créer jeu de données test (100 clients, 500 factures)
   - [ ] Mesurer temps chargement pages
   - [ ] Vérifier fluidité navigation
   - [ ] Lighthouse audit (Performance > 90)

**✅ Critères de succès**
- ✓ Pages rapides même avec beaucoup de données
- ✓ Pagination fluide et intuitive
- ✓ Score Lighthouse > 90

---

### ~~Sprint 3 : Système de paiements~~ ⏸️ **REPORTÉ**

*Fonctionnalité mise de côté temporairement. Priorité sur les relances clients et l'optimisation.*

---

##  PHASE 3 : Amélioration UX/UI (2 semaines)

### Sprint 3 : Templates personnalisables (3-4 jours)

#### 📋 Tâches

1. **Backend - CRUD Templates** (2h30)
   - [ ] Routes `/api/templates` (GET, POST)
   - [ ] Routes `/api/templates/[id]` (GET, PATCH, DELETE)
   - [ ] Schema Zod validation templates
   - [ ] Gestion template par défaut (unique par user)
   - [ ] Prévisualisation template (endpoint dédié)

2. **Frontend - Gestionnaire templates** (3h)
   - [ ] Page `/dashboard/templates`
   - [ ] Liste des templates utilisateur
   - [ ] Formulaire création/édition template
   - [ ] Preview temps réel du rendu
   - [ ] Sélection template par défaut
   - [ ] Duplication template existant

3. **Customisation PDF** (2h)
   - [ ] Options : couleurs (header, accents)
   - [ ] Options : logo (position, taille)
   - [ ] Options : police (famille, tailles)
   - [ ] Options : sections (afficher/masquer notes, conditions)
   - [ ] Enregistrement préférences dans template

4. **Integration factures** (1h)
   - [ ] Sélecteur template lors création facture
   - [ ] Utiliser template par défaut si non spécifié
   - [ ] Preview PDF avec template sélectionné

**✅ Critères de succès**
- ✓ Création templates personnalisés
- ✓ Preview temps réel
- ✓ Application automatique lors génération PDF

---

### Sprint 4 : Export & Reporting (2 jours)

#### 📋 Tâches

1. **Export CSV Clients** (1h30)
   - [ ] Route `/api/clients/export` (CSV)
   - [ ] Colonnes : tous les champs pertinents
   - [ ] Bouton "Exporter CSV" dans page clients
   - [ ] Download automatique fichier

2. **Export CSV Factures** (2h)
   - [ ] Route `/api/invoices/export` (CSV)
   - [ ] Filtres : dates, statuts, clients
   - [ ] Colonnes : numéro, date, client, montants, statut
   - [ ] Format compatible Excel
   - [ ] Bouton "Exporter" avec modal options

3. **Rapports basiques** (2h)
   - [ ] Page `/dashboard/reports`
   - [ ] Graphique CA par mois (12 derniers mois)
   - [ ] Répartition statuts factures (pie chart)
   - [ ] Top 10 clients (CA)
   - [ ] Métriques : délai paiement moyen, taux recouvrement

4. **Export PDF rapports** (1h30)
   - [ ] Génération PDF rapport mensuel
   - [ ] Synthèse activité, graphiques
   - [ ] Bouton "Télécharger rapport"

**✅ Critères de succès**
- ✓ Export données facile
- ✓ Rapports visuels et exploitables
- ✓ Format compatible outils comptabilité

---

### Sprint 5 : Dark Mode & Accessibilité (2-3 jours)

#### 📋 Tâches

1. **Dark Mode** (2h)
   - [ ] Installer `next-themes`
   - [ ] Configurer Tailwind dark mode (class strategy)
   - [ ] Créer palette couleurs dark
   - [ ] Appliquer classes `dark:` sur tous les composants
   - [ ] Toggle dans layout (header ou settings)
   - [ ] Persistance préférence (localStorage)

2. **Accessibilité (a11y)** (2h30)
   - [ ] Audit WAVE ou axe DevTools
   - [ ] Ajouter labels ARIA manquants
   - [ ] Contraste couleurs (WCAG AA minimum)
   - [ ] Navigation clavier complète (focus visible)
   - [ ] Alt text sur toutes les images
   - [ ] Screen reader friendly (roles ARIA)

3. **Responsive mobile avancé** (2h)
   - [ ] Menu mobile hamburger avec animation
   - [ ] Tables responsive (scroll horizontal ou cards)
   - [ ] Formulaires optimisés tactile (tailles touch-friendly)
   - [ ] Swipe actions sur cards (mobile uniquement)
   - [ ] Bottom navigation alternative sur mobile

4. **Tests accessibilité** (1h)
   - [ ] Test navigation clavier complète
   - [ ] Test screen reader (NVDA/JAWS)
   - [ ] Test contraste couleurs
   - [ ] Lighthouse audit (Accessibility > 95)

**✅ Critères de succès**
- ✓ Dark mode fluide et complet
- ✓ Score accessibilité Lighthouse > 95
- ✓ Navigation mobile optimale

---

## 🔧 PHASE 4 : Qualité & Robustesse (1-2 semaines)

### Sprint 6 : Tests automatisés (3-4 jours)

#### 📋 Tâches

1. **Setup environnement test** (1h)
   - [ ] Installer Jest + Testing Library
   - [ ] Installer Playwright
   - [ ] Configurer `jest.config.js`
   - [ ] Configurer `playwright.config.ts`
   - [ ] Base de données test MongoDB (Docker ou Atlas test cluster)

2. **Tests unitaires** (4h)
   - [ ] Tests validations Zod (`src/lib/validations.ts`)
   - [ ] Tests utils (`src/lib/utils/*.ts`)
   - [ ] Tests service invoice-numbering
   - [ ] Tests service payment (logique métier)
   - [ ] Coverage minimum 80%

3. **Tests d'intégration API** (3h)
   - [ ] Tests routes `/api/clients` (CRUD complet)
   - [ ] Tests routes `/api/invoices` (CRUD + edge cases)
   - [ ] Tests routes `/api/payments` (calculs, statuts)
   - [ ] Tests authentification (register, login)
   - [ ] Mock NextAuth pour tests

4. **Tests E2E critiques** (4h)
   - [ ] Scénario : Inscription → Login → Dashboard
   - [ ] Scénario : Créer client → Créer facture → Générer PDF
   - [ ] Scénario : Enregistrer paiement → Vérifier statut
   - [ ] Scénario : Envoi email facture
   - [ ] Tests échecs : validations, erreurs API

5. **CI/CD** (1h30)
   - [ ] GitHub Actions : run tests sur chaque PR
   - [ ] GitHub Actions : lint + type-check
   - [ ] Badge status tests dans README
   - [ ] Configuration playwright CI

**✅ Critères de succès**
- ✓ Coverage > 80% sur logique métier
- ✓ Tests E2E couvrent flows critiques
- ✓ CI/CD automatisé

---

### Sprint 7 : Gestion erreurs & Monitoring (2 jours)

#### 📋 Tâches

1. **Centralisation erreurs backend** (2h)
   - [ ] Créer `/src/middleware/error-handler.ts`
   - [ ] Types d'erreurs custom (ValidationError, AuthError, etc.)
   - [ ] Logs structurés (winston ou pino)
   - [ ] Formatter réponses erreur uniformes
   - [ ] Intégrer dans toutes les routes API

2. **Gestion erreurs frontend** (1h30)
   - [ ] Créer `/src/lib/error-handler.ts`
   - [ ] Toast/notification système unifié
   - [ ] Error boundaries React
   - [ ] Retry automatique requêtes failed (avec backoff)
   - [ ] Messages d'erreur user-friendly

3. **Logging & Monitoring** (1h30)
   - [ ] Logger API : requêtes, erreurs, temps réponse
   - [ ] Logger frontend : erreurs JS, actions utilisateur
   - [ ] Intégration Sentry (optionnel, gratuit tier)
   - [ ] Dashboard monitoring (Vercel Analytics)

4. **Rate limiting** (1h)
   - [ ] Implémenter rate limit API routes sensibles
   - [ ] Middleware `@vercel/rate-limit` ou similaire
   - [ ] Limiter : register (5/h), send email (20/h)
   - [ ] Message clair si rate limit hit

**✅ Critères de succès**
- ✓ Erreurs loggées et trackées
- ✓ Expérience utilisateur en cas d'erreur
- ✓ Protection contre abus API

---

### Sprint 8 : Documentation & Polish (2 jours)

#### 📋 Tâches

1. **Documentation technique** (2h)
   - [ ] README complet : setup, installation, env vars
   - [ ] Architecture documentation (diagrammes)
   - [ ] API documentation (endpoints, payloads)
   - [ ] Guide contribution (coding standards)
   - [ ] Changelog structuré

2. **Documentation utilisateur** (2h)
   - [ ] Guide démarrage rapide
   - [ ] Tutoriels : créer première facture, configurer profil
   - [ ] FAQ (questions courantes)
   - [ ] Vidéos démo (optionnel)
   - [ ] Section aide dans l'app

3. **Polish UI/UX** (2h)
   - [ ] Animations micro-interactions (hover, focus)
   - [ ] Transitions pages fluides
   - [ ] Skeleton loaders au lieu de spinners
   - [ ] Empty states avec illustrations
   - [ ] Messages encouragement (premières actions)

4. **Audit final** (1h)
   - [ ] Lighthouse : Performance, A11y, Best Practices, SEO > 90
   - [ ] Vérification tous les flows utilisateur
   - [ ] Test sur différents navigateurs
   - [ ] Test sur mobiles/tablettes réels
   - [ ] Fix derniers bugs/typos

**✅ Critères de succès**
- ✓ Documentation complète et à jour
- ✓ Expérience utilisateur polie
- ✓ Prêt pour production

---

## 📦 PHASE 5 : Déploiement & Maintenance

### Préparation production (1-2 jours)

#### 📋 Tâches

1. **Configuration production** (1h30)
   - [ ] Variables d'environnement production (Vercel/autres)
   - [ ] MongoDB Atlas production cluster
   - [ ] Domaine custom + SSL
   - [ ] Configuration Resend production (domaine vérifié)
   - [ ] Backup automatique base de données

2. **Sécurité production** (1h)
   - [ ] CORS configuration stricte
   - [ ] CSP (Content Security Policy)
   - [ ] Rate limiting activé
   - [ ] Secrets rotation plan
   - [ ] Audit sécurité (npm audit, Snyk)

3. **Monitoring production** (1h)
   - [ ] Sentry/LogRocket pour error tracking
   - [ ] Uptime monitoring (UptimeRobot)
   - [ ] Performance monitoring (Vercel Analytics)
   - [ ] Alertes email si erreurs critiques

4. **Déploiement** (30 min)
   - [ ] Déploiement Vercel (ou autre plateforme)
   - [ ] Vérification déploiement réussi
   - [ ] Test smoke en production
   - [ ] Communication aux utilisateurs beta (si applicable)

**✅ Critères de succès**
- ✓ Application stable en production
- ✓ Monitoring actif
- ✓ Plan de backup et recovery

---

## 🎯 Bonnes pratiques appliquées

### 🏗️ Architecture
- ✅ Séparation concerns (API, UI, logique métier)
- ✅ Services réutilisables (`/src/lib/services`)
- ✅ Validation centralisée (Zod schemas)
- ✅ Types TypeScript stricts

### 🔐 Sécurité
- ✅ Authentification robuste (NextAuth)
- ✅ Validation inputs (front + back)
- ✅ Protection routes API (vérification userId)
- ✅ Rate limiting
- ✅ HTTPS uniquement production

### 🧪 Tests
- ✅ Tests unitaires (logique critique)
- ✅ Tests intégration (API routes)
- ✅ Tests E2E (flows utilisateur)
- ✅ CI/CD automatisé

### 📊 Performance
- ✅ Pagination (données volumineuses)
- ✅ Indexes MongoDB optimisés
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Caching stratégique

### 👥 UX/UI
- ✅ Loading states partout
- ✅ Error handling gracieux
- ✅ Feedback utilisateur immédiat
- ✅ Responsive mobile-first
- ✅ Accessibilité (a11y)

### 📚 Documentation
- ✅ README complet
- ✅ Code commenté (parties complexes)
- ✅ API documentation
- ✅ Guide utilisateur

---

## 📅 Timeline globale

| Phase | Durée estimée | Période |
|-------|---------------|---------|
| **Phase 2 : Finalisation MVP** | 2 semaines | Semaines 1-2 |
| **Phase 3 : Amélioration UX/UI** | 2 semaines | Semaines 3-4 |
| **Phase 4 : Qualité & Robustesse** | 1-2 semaines | Semaines 5-6 |
| **Phase 5 : Déploiement** | 1-2 jours | Semaine 7 |
| **TOTAL** | **~1.5 mois** | - |

*Note : Timeline pour 1 développeur à temps plein. Ajuster selon disponibilité.*

---

## 🎉 Définition de "Done"

### MVP Complet (Fin Phase 2)
- [x] CRUD Clients, Factures complet
- [ ] Envoi email factures
- [ ] Système de relance client
- [x] Génération PDF professionnelle
- [x] Dashboard dynamique
- [ ] Pagination fonctionnelle
- [x] Dashboard dynamique
- [ ] Pagination fonctionnelle

### V1.0 Production Ready (Fin Phase 4)
- [ ] Toutes fonctionnalités MVP
- [ ] Tests coverage > 80%
- [ ] Documentation complète
- [ ] Lighthouse scores > 90
- [ ] Monitoring actif
- [ ] Déployé en production stable

---

## 📝 Notes importantes

### Flexibilité
- Chaque sprint est indépendant (sauf dépendances explicites)
- Possible de paralléliser certains sprints si plusieurs développeurs
- Possibilité d'ajuster priorités selon feedback utilisateurs

### Maintenance continue
- Après déploiement : support utilisateurs, bug fixes, petites améliorations
- Planifier sprints 2 semaines post-MVP pour stabilisation

### Évolutions futures (Post-V1.0)
- Webhooks pour intégrations externes
- API publique pour partenaires
- Multi-devises avancé
- Récurrence factures (abonnements)
- Gestion des devis séparée
- Multi-utilisateurs / équipes
- Application mobile (React Native)

---

**Document vivant** : Mettre à jour au fil de l'avancement, ajuster selon les retours et les imprévus.

**Auteur** : GitHub Copilot  
**Dernière mise à jour** : 23 octobre 2025
