# Plan d'actions restants - Application de facturation freelance
[Sauvegarde de l'état au 22/10/2025]

## ✅ Fonctionnalités terminées
- CRUD clients/invoices complet (API + Frontend)
- Feedback utilisateur et validation Zod complète
- Dashboard dynamique avec vraies données (CA, stats, dernières factures)
- Édition du profil utilisateur
- Génération PDF professionnelle (multi-taux TVA, colonne TVA, design professionnel)
- Authentification NextAuth complète (Email + OAuth Google)
- Modèles Mongoose complets (User, Client, Invoice, Template, Payment)
- Indexes MongoDB pour performance
- Protection et sécurité des routes API
- UI/UX responsive et moderne

## 🔄 Fonctionnalités en cours
- Envoi par email (Resend installé, API à créer)

## 📋 Fonctionnalités à venir
- CRUD Paiements (modèle créé, API/UI manquantes)
- CRUD Templates (modèle créé, API/UI manquantes)
- Pagination clients et factures
- Centralisation avancée des erreurs
- Tests automatisés (unitaires + e2e)
- Export CSV/Excel
- Dark mode
- Accessibilité (a11y) avancée

## 1. Fonctionnalités à finaliser

### a. Clients
- [x] Relier les boutons "Modifier" et "Supprimer" des cards à l'API (PATCH/DELETE)
- [x] Ajouter la confirmation de suppression et feedback utilisateur
- [x] Permettre l'édition inline ou via modal (formulaire pré-rempli)
- [ ] Pagination ou chargement progressif si beaucoup de clients

### b. Factures
- [x] Créer la page de gestion des factures (liste, création, édition, suppression)
- [x] Formulaire de création/édition avec validation Zod
- [x] Génération PDF (Puppeteer) - Design professionnel multi-TVA
- [ ] Envoi par email (Resend) - **PRIORITÉ HAUTE**
- [x] Affichage des statuts, filtres, recherche
- [x] Lier les factures aux clients (sélecteur, historique)

### c. Dashboard
- [x] Centraliser la gestion des erreurs (front + back) pour factures/clients
- [x] Loading states et feedback utilisateur partout (factures/clients)
- [x] Indexes MongoDB pour la performance (audit complet)
- [x] OAuth Google complet (NextAuth v5)
- [x] Dashboard dynamique avec vraies données (stats CA, factures, clients)
### e. Templates & PDF
- [x] Génération PDF professionnelle avec Puppeteer
- [x] Design multi-taux TVA avec calculs détaillés
- [ ] CRUD templates de facture/devis (modèle créé, API/UI manquantes)
- [ ] Personnalisation avancée du style PDF
- [ ] Sélection de template par défaut utilisateur

### f. Paiements
- [ ] CRUD paiements (enregistrement, édition, suppression) - Modèle créé
- [ ] API Routes pour paiements (/api/payments)
- [ ] Interface UI pour gérer les paiements
- [ ] Lier paiements aux factures (mise à jour auto du statut)
- [ ] Affichage du solde, statut paiement, historique

## 2. Qualité & Technique
- [x] Feedback utilisateur sur toutes les actions (succès/erreur)
- [x] Validation Zod complète (front + back)
- [x] Loading states et feedback utilisateur partout
- [x] Indexes MongoDB pour la performance
- [x] Sécurité : validation, protection routes, vérification session
- [x] Composants UI réutilisables (Button, Card, Input, Select, etc.)
- [ ] Centralisation avancée des erreurs (middleware)
- [ ] Sanitation des entrées utilisateur renforcée
- [ ] Tests unitaires (Jest) pour utils et validations
- [ ] Tests e2e (Playwright/Cypress) pour flows critiques
- [ ] Documentation technique et utilisateur

## 3. Bonus / Améliorations UX
- [ ] Export CSV/Excel clients et factures
- [ ] Dark mode
- [ ] Accessibilité (a11y)
- [ ] Mobile UX avancée (swipe, actions rapides)

---

## 🎯 Prochaines étapes prioritaires

### 🔥 HAUTE PRIORITÉ (Cette semaine)
1. **Envoi d'emails avec Resend**
   - Créer `/api/email/send-invoice`
   - Template HTML pour l'email
   - Bouton "Envoyer par email" dans l'interface factures
   - Traçabilité (date d'envoi, destinataire)

### 📊 PRIORITÉ MOYENNE (2 semaines)
2. **CRUD Paiements**
   - Routes API `/api/payments` (GET, POST, PATCH, DELETE)
   - Interface UI pour enregistrer/modifier les paiements
   - Mise à jour automatique du statut des factures
   - Historique des paiements par facture

3. **Tests automatisés**
   - Tests unitaires (Jest) pour validations et utils
   - Tests e2e (Playwright) pour authentification et CRUD

### 🌟 AMÉLIORATION CONTINUE
4. Pagination pour clients et factures
5. CRUD Templates personnalisables
6. Export CSV/Excel
7. Dark mode
8. Amélioration accessibilité (a11y)

---

Ce plan reflète l'état réel du projet au 23/10/2025. Architecture solide, fonctionnalités core opérationnelles, focus sur l'envoi d'emails et les paiements pour compléter le MVP.
