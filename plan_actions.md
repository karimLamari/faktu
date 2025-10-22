# Plan d'actions restants - Application de facturation freelance
[Sauvegarde de l'état au 22/10/2025]

## Fonctionnalités terminées
- CRUD clients/invoices complet
- Feedback utilisateur et validation Zod
- Dashboard dynamique et édition du profil
- Génération PDF professionnelle (multi-taux TVA, colonne TVA, noms de colonnes clairs)
- Modèles alignés (Invoice, Client, User)

## Fonctionnalités en cours
- Personnalisation avancée du PDF
- Sélection de template PDF
- Centralisation des erreurs et chargements

## Fonctionnalités à venir
- Envoi par email (Resend)
- Gestion des paiements
- Pagination clients
- CRUD templates
- Export, dark mode, a11y, mobile UX

## 1. Fonctionnalités à finaliser

### a. Clients
- [x] Relier les boutons "Modifier" et "Supprimer" des cards à l'API (PATCH/DELETE)
- [x] Ajouter la confirmation de suppression et feedback utilisateur
- [x] Permettre l'édition inline ou via modal (formulaire pré-rempli)
- [ ] Pagination ou chargement progressif si beaucoup de clients

### b. Factures
 [x] Créer la page de gestion des factures (liste, création, édition, suppression)
 [x] Formulaire de création/édition avec validation Zod
 [ ] Génération PDF (Puppeteer)
 [ ] Envoi par email (Resend)
 [x] Affichage des statuts, filtres, recherche
 [x] Lier les factures aux clients (sélecteur, historique)

### c. Dashboard
 [x] Centraliser la gestion des erreurs (front + back) pour factures/clients
 [x] Loading states et feedback utilisateur partout (factures/clients)
 [x] Indexes MongoDB pour la performance (audit complet)
- [ ] OAuth Google complet

 Les tâches CRUD clients et factures sont validées. Prochaine étape : PDF, email, dashboard dynamique, puis paiements et UX avancée.
### e. Templates & PDF
- [ ] CRUD templates de facture/devis
- [ ] Personnalisation du style PDF
- [ ] Sélection de template par défaut

### f. Paiements
- [ ] CRUD paiements (enregistrement, édition, suppression)
- [ ] Lier paiements aux factures
- [ ] Affichage du solde, statut paiement

## 2. Qualité & Technique
- [x] Feedback utilisateur sur actions clients (succès/erreur)
- [ ] Centraliser la gestion des erreurs (front + back)
- [ ] Loading states et feedback utilisateur partout
- [ ] Indexes MongoDB pour la performance
- [ ] Sécurité : validation, protection routes, sanitation
- [ ] Refactoriser les composants pour la réutilisabilité
- [ ] Ajouter des tests unitaires et e2e (Playwright/Cypress)
- [ ] Documentation technique et utilisateur

## 3. Bonus / Améliorations UX
- [ ] Export CSV/Excel clients et factures
- [ ] Dark mode
- [ ] Accessibilité (a11y)
- [ ] Mobile UX avancée (swipe, actions rapides)

---

Ce plan suit l'architecture, les instructions et l'état d'avancement réel du projet. Les tâches clients CRUD sont validées, prochaine étape : gestion des factures ou dashboard dynamique.
