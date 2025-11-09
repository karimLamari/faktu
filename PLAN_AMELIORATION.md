# PLAN D'AMÉLIORATION - BLINK SaaS Facturation

**Date de création:** 9 novembre 2025
**Score actuel:** 7.8/10
**Objectif:** 9.0/10 (Production-ready)
**Durée totale estimée:** 6 semaines

---

## 📊 VISION & OBJECTIFS

### Objectif Principal
Transformer BLINK d'une application **"bêta fermée"** à une solution **"production grand public"** en 6 semaines.

### Métriques de Succès (KPIs)

| Métrique | Actuel | Cible | Impact |
|----------|--------|-------|--------|
| Taux d'abandon nouveaux users | 50% | <15% | Onboarding |
| Temps première facture créée | N/A | <5 min | Onboarding wizard |
| Taux de conversion FREE→PRO | 0% | 5-10% | Pricing page |
| Erreurs utilisateur/session | Élevé | <2 | Error handling |
| Temps de chargement invoices | 10s+ | <2s | Pagination |

---

## 🎯 PRIORISATION STRATÉGIQUE

### Matrice Impact/Effort

```
HIGH IMPACT, LOW EFFORT (Quick Wins) ⭐⭐⭐
├─ Pricing page (3h) → +Revenue immédiat
├─ OCR endpoint (3h) → Débloquer feature PRO
└─ Profile completion modal (2h) → Réduire erreurs PDF

HIGH IMPACT, HIGH EFFORT (Investissements)
├─ Onboarding wizard (8h) → -35% abandon
├─ Form multi-step (6h) → -20% abandon forms
└─ Error handling (4h) → +UX quality

LOW IMPACT (Déprioritiser)
└─ 2FA, Multi-language, Mobile app
```

---

## 🚀 SPRINT 1: STABILITÉ & DÉBLOCAGE (Semaine 1)

**Objectif:** Corriger les bugs critiques et débloquer la monétisation

### Jour 1-2: Déblocage Features Critiques (8h)

#### 1.1 Créer la Pricing Page ⭐ PRIORITÉ #1
- **Fichier:** `invoice-app/app/dashboard/pricing/page.tsx`
- **Durée:** 3h
- **Composants à créer:**
  - PricingTable avec les 3 plans (FREE, PRO, BUSINESS)
  - Cards comparatives avec features
  - Boutons "Upgrade" → Stripe checkout
  - Badge "Plan actuel" pour user
- **Validation:**
  - [ ] User peut voir les 3 plans
  - [ ] Click "Upgrade" → Stripe checkout
  - [ ] Plan actuel mis en évidence
  - [ ] Pricing mensuel/annuel toggle
  - [ ] Features list complète par plan

#### 1.2 Fixer l'OCR Endpoint ⭐ PRIORITÉ #2
- **Fichier:** `invoice-app/app/api/expenses/ocr/route.ts`
- **Durée:** 3h
- **Implémentation:**
  ```typescript
  // POST /api/expenses/ocr
  // 1. Vérifier subscription (FREE → Tesseract, PRO → Google Vision)
  // 2. Upload file → extract text
  // 3. Parser: vendor, amount, tax, date
  // 4. Retourner structured data
  ```
- **Validation:**
  - [ ] Upload image → OCR works (FREE + PRO)
  - [ ] Extraction: vendor, amount, tax, date
  - [ ] Error handling (unsupported format, API limit)
  - [ ] Loading state dans UI

#### 1.3 Tests Stripe
- **Durée:** 2h
- **Actions:**
  - Tester create-checkout (mode test)
  - Vérifier webhook synchronisation
  - Tester portal (cancel, change plan)
  - Valider usage tracking

### Jour 3-4: UX Critique (7h)

#### 1.4 Profile Completion Modal ⭐
- **Fichier:** Modifier `DashboardOverview.tsx`
- **Durée:** 2h
- **Logique:**
  ```typescript
  // Au login, si profil incomplet → modal bloquant
  if (!isProfileComplete) {
    showModal({
      title: "Complétez votre profil",
      message: "Pour générer vos factures PDF, complétez...",
      fields: [manquant 1, manquant 2, ...],
      action: "Compléter maintenant"
    });
  }
  ```
- **Validation:**
  - [ ] Modal s'affiche si profil incomplet
  - [ ] Liste des champs manquants
  - [ ] Redirection vers settings/profile
  - [ ] Fermeture seulement si complété

#### 1.5 Error Handling Limites Plan
- **Fichiers:** Tous les forms (Invoice, Quote, Expense)
- **Durée:** 2h
- **Améliorations:**
  - Afficher UsageBar en haut de page (toujours visible)
  - Modal explicite quand limite atteinte:
    ```
    🚫 Limite atteinte
    Vous avez utilisé 5/5 factures ce mois.

    [Voir les plans] [Annuler]
    ```
  - Disable bouton "Créer" si limite atteinte
- **Validation:**
  - [ ] UsageBar visible sur toutes les pages
  - [ ] Modal clair si limite atteinte
  - [ ] Link vers /pricing
  - [ ] Bouton disabled + tooltip

#### 1.6 Form Validation Feedback
- **Durée:** 3h
- **Améliorations:**
  - Inline validation (champ par champ)
  - Messages d'erreur contextuels
  - Icons ✓/✗ à côté des champs
  - Progress bar pour forms longs
- **Validation:**
  - [ ] Validation en temps réel
  - [ ] Messages clairs
  - [ ] Icons visuels
  - [ ] Submit disabled si invalide

### Jour 5: Bug Fixes & Deploy (8h)
- Tests complets des fixes
- Fix bugs découverts
- Deploy sur environnement beta
- Documentation des changements

**Deliverables Sprint 1:**
- ✅ Pricing page fonctionnelle
- ✅ OCR endpoint opérationnel
- ✅ Profile completion workflow
- ✅ Error handling amélioré
- ✅ Beta stable déployée

---

## 🎨 SPRINT 2: ONBOARDING & ADOPTION (Semaine 2-3)

**Objectif:** Réduire l'abandon des nouveaux users de 50% à 15%

### 2.1 Onboarding Wizard Complet (8h) ⭐ PRIORITÉ #1

#### Jour 1-2: Architecture Wizard
- **Fichiers:**
  - `components/onboarding/OnboardingWizard.tsx` (nouveau)
  - `components/onboarding/Step1Welcome.tsx`
  - `components/onboarding/Step2Profile.tsx`
  - `components/onboarding/Step3FirstClient.tsx`
  - `components/onboarding/Step4FirstInvoice.tsx`
  - `components/onboarding/Step5Success.tsx`

#### Flow détaillé:

**Step 1: Welcome (1 min)**
```
Bienvenue sur BLINK! 👋
Créez votre première facture en 3 minutes.

[Suivant]
```

**Step 2: Profil (2 min)**
```
Vos informations professionnelles
- Prénom, Nom
- Entreprise
- Adresse

[Optionnel: Logo upload]

[← Retour] [Suivant →]
```

**Step 3: Premier Client (1 min)**
```
Ajoutez votre premier client
- Nom client
- Email
- Type (Particulier/Entreprise)

[← Retour] [Suivant →]
```

**Step 4: Première Facture (1 min)**
```
Créez votre première facture
- Service/Produit
- Montant HT
- TVA

Prévisualisation temps réel →

[← Retour] [Créer ma facture →]
```

**Step 5: Success! (confetti 🎉)**
```
Bravo! Votre première facture est créée! 🎉

Prochaines étapes:
- [Envoyer par email]
- [Télécharger PDF]
- [Explorer le dashboard]
```

#### Fonctionnalités:
- **Progress bar:** "Étape 2/5"
- **Skip option:** "Passer cette étape"
- **Save & Resume:** Auto-save progression
- **Tooltips contextuels:** Sur chaque champ
- **Animations:** Transitions smooth
- **Mobile-first:** Optimisé mobile

**Validation:**
- [ ] Wizard s'affiche au premier login
- [ ] 5 étapes complètes
- [ ] Données sauvegardées en DB
- [ ] Confetti animation finale
- [ ] Skip wizard possible
- [ ] Resume si abandonné

### 2.2 Multi-Step Forms (6h)

#### InvoiceFormModal → InvoiceWizard
**Fichier:** `components/invoices/InvoiceFormWizard.tsx`

**Étapes:**
1. **Client:** Sélectionner/Créer client
2. **Items:** Ajouter services/produits
3. **Détails:** Date, échéance, conditions
4. **Review:** Prévisualisation avant création

**Avantages:**
- Chaque étape: 3-5 champs max
- Validation progressive
- Progress bar
- -30% abandon

**Validation:**
- [ ] Wizard fonctionnel
- [ ] 4 étapes claires
- [ ] Back/Next navigation
- [ ] Draft auto-save
- [ ] Preview finale

### 2.3 Auto-Save Drafts (4h)

**Fichiers:**
- `hooks/useAutoSave.ts` (nouveau)
- Modifier: InvoiceForm, QuoteForm

**Logique:**
```typescript
useAutoSave(formData, {
  interval: 5000, // 5 sec
  onSave: async (data) => {
    await saveDraft(data);
    showNotification("Sauvegardé à " + time);
  }
});
```

**Validation:**
- [ ] Auto-save toutes les 5 sec
- [ ] Notification "Sauvegardé à HH:MM"
- [ ] Restore draft au reload
- [ ] Clear draft après submit

### 2.4 Pagination & Performance (4h)

#### Backend: API Pagination
**Fichiers:** Tous les GET endpoints

```typescript
// GET /api/invoices?page=1&limit=20&sort=-createdAt
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const invoices = await Invoice.find({ userId })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Invoice.countDocuments({ userId });

  return NextResponse.json({
    data: invoices,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}
```

#### Frontend: Infinite Scroll
**Composant:** `components/ui/InfiniteScroll.tsx`

**Validation:**
- [ ] Pagination backend tous les endpoints
- [ ] Infinite scroll frontend
- [ ] Loading state
- [ ] Performance: <2s first load

**Deliverables Sprint 2:**
- ✅ Onboarding wizard 5 étapes
- ✅ Forms multi-step
- ✅ Auto-save drafts
- ✅ Pagination complète
- ✅ Taux abandon <20%

---

## 📈 SPRINT 3: ANALYTICS & POLISH (Semaine 4)

**Objectif:** Améliorer la visibilité et l'engagement

### 3.1 Dashboard Charts (6h)

**Bibliothèque:** Recharts (léger, React-friendly)

**Charts à créer:**
1. **Revenu mensuel:** Line chart (12 derniers mois)
2. **Statuts factures:** Pie chart (paid, pending, overdue)
3. **Top 5 clients:** Bar chart (CA par client)
4. **Evolution dépenses:** Area chart

**Fichiers:**
- `components/dashboard/RevenueChart.tsx`
- `components/dashboard/InvoiceStatusChart.tsx`
- `components/dashboard/TopClientsChart.tsx`
- `components/dashboard/ExpensesChart.tsx`

**Validation:**
- [ ] 4 charts fonctionnels
- [ ] Données temps réel
- [ ] Responsive mobile
- [ ] Export PNG

### 3.2 Email Preview (2h)

**Avant envoi facture/devis:** Modal preview

**Fichier:** `components/emails/EmailPreviewModal.tsx`

**Contenu:**
- Preview HTML email
- Destinataire, sujet, message
- Edit message avant envoi
- Boutons: [Modifier] [Envoyer]

**Validation:**
- [ ] Preview avant envoi
- [ ] Edition message
- [ ] Send test email

### 3.3 Bulk Actions (5h)

**Fonctionnalités:**
- Sélectionner multiple factures (checkbox)
- Actions groupées:
  - Marquer comme payé
  - Envoyer rappel
  - Exporter CSV
  - Supprimer

**Fichier:** `components/invoices/BulkActions.tsx`

**Validation:**
- [ ] Sélection multiple
- [ ] Actions groupées
- [ ] Confirmation modal
- [ ] Loading state

### 3.4 Performance Audit (4h)

**Outils:**
- Lighthouse (Performance score >90)
- Bundle analyzer
- React Profiler

**Optimisations:**
- Code splitting
- Lazy loading components
- Image optimization
- Compression Gzip/Brotli

**Validation:**
- [ ] Lighthouse >90
- [ ] Bundle size <500KB
- [ ] Time to Interactive <3s

**Deliverables Sprint 3:**
- ✅ Dashboard charts
- ✅ Email preview
- ✅ Bulk actions
- ✅ Performance optimisée

---

## 🔐 SPRINT 4: SÉCURITÉ & QUALITÉ (Semaine 5)

**Objectif:** Production-ready security & reliability

### 4.1 Security Hardening (8h)

#### Email Verification
- Envoi email confirmation à signup
- Token expiry (24h)
- Resend option

#### 2FA (Optionnel)
- TOTP (Google Authenticator)
- Backup codes
- SMS fallback

#### Session Management
- Timeout après 24h inactivité
- Remember me option (30 jours)
- Force logout tous devices

#### Rate Limiting
- API: 100 req/min par user
- Login: 5 tentatives/15 min
- Upload: 10 files/min

**Validation:**
- [ ] Email verification active
- [ ] 2FA optionnel
- [ ] Session timeout
- [ ] Rate limiting

### 4.2 Testing (8h)

#### Unit Tests
- Services (invoiceService, etc.)
- Utilities (numbering, calculations)
- Hooks (useAutoSave, useSubscription)

#### Integration Tests
- API routes
- Database operations
- Stripe webhook

#### E2E Tests (Playwright)
- User signup → onboarding → create invoice
- Upgrade to PRO
- OCR upload expense

**Coverage cible:** >70%

**Validation:**
- [ ] Unit tests >50 tests
- [ ] Integration tests API
- [ ] E2E critical paths
- [ ] CI/CD pipeline

### 4.3 Error Monitoring (4h)

**Outils:**
- Sentry (error tracking)
- Logging structuré
- Alertes email admin

**Validation:**
- [ ] Sentry intégré
- [ ] Logs structurés
- [ ] Alertes critiques

---

## 🌍 SPRINT 5: SCALE & OPTIMISATION (Semaine 6)

### 5.1 File Storage Migration (6h)

**Actuel:** Local filesystem
**Cible:** Vercel Blob Storage

**Migration:**
- Upload expenses images → Blob
- Generate invoice PDFs → Blob (cache 7 jours)
- Logo uploads → Blob

**Validation:**
- [ ] Migration complète
- [ ] URLs signés (sécurité)
- [ ] CDN delivery

### 5.2 Caching Strategy (4h)

**Redis/Vercel KV:**
- Cache invoices list (5 min TTL)
- Cache user profile (10 min)
- Cache subscription status (1 min)

**Validation:**
- [ ] Redis configuré
- [ ] Cache hit ratio >80%
- [ ] Invalidation smart

### 5.3 Monitoring & Analytics (4h)

**Outils:**
- Vercel Analytics (Web Vitals)
- PostHog (Product analytics)
- Custom events:
  - Invoice created
  - User upgraded
  - OCR used
  - Email sent

**Validation:**
- [ ] Analytics intégré
- [ ] Dashboards KPIs
- [ ] Funnel conversion

### 5.4 Documentation (6h)

**Créer:**
- README.md (setup instructions)
- API.md (endpoints documentation)
- DEPLOYMENT.md (deploy guide)
- USER_GUIDE.md (features guide)

**Validation:**
- [ ] Documentation complète
- [ ] Screenshots
- [ ] Video tutorials

---

## 📋 CHECKLIST PRÉ-PRODUCTION

### Technique
- [ ] Tests >70% coverage
- [ ] Performance Lighthouse >90
- [ ] Sentry error monitoring
- [ ] Logs structurés
- [ ] Rate limiting actif
- [ ] HTTPS everywhere
- [ ] CORS configuré
- [ ] CSP headers
- [ ] Database backups automatiques

### Fonctionnel
- [ ] Onboarding wizard complet
- [ ] Pricing page fonctionnelle
- [ ] OCR endpoint opérationnel
- [ ] Profile completion flow
- [ ] Error handling user-friendly
- [ ] Forms multi-step
- [ ] Auto-save drafts
- [ ] Pagination/Infinite scroll
- [ ] Bulk actions
- [ ] Email preview

### Business
- [ ] Stripe mode production
- [ ] Privacy policy
- [ ] Terms of service
- [ ] RGPD compliance
- [ ] Support email configuré
- [ ] Status page (uptime)
- [ ] Refund policy

### UX
- [ ] Mobile responsive (100%)
- [ ] Loading states partout
- [ ] Empty states (pas de data)
- [ ] Error states (404, 500, etc.)
- [ ] Success confirmations
- [ ] Animations smooth
- [ ] Tooltips utiles
- [ ] Keyboard shortcuts

---

## 🎯 MÉTRIQUES DE SUCCÈS FINALES

| Critère | Avant | Après | Objectif |
|---------|-------|-------|----------|
| Score global | 7.8/10 | ? | 9.0/10 |
| Onboarding completion | 50% | ? | 85% |
| Temps première facture | N/A | ? | <5 min |
| Taux conversion FREE→PRO | 0% | ? | 5-10% |
| Performance Lighthouse | ~60 | ? | >90 |
| Test coverage | 0% | ? | >70% |
| Bugs critiques | 5 | ? | 0 |

---

## 🚀 DÉPLOIEMENT

### Phase 1: Beta Fermée (Semaine 1-2)
- 20-50 early adopters
- Feedback quotidien
- Hotfixes rapides

### Phase 2: Beta Ouverte (Semaine 3-4)
- Lancement public limité
- Marketing soft (Product Hunt, Reddit)
- Monitoring intensif

### Phase 3: Production (Semaine 5-6)
- Campagne marketing
- SEO optimization
- Support 24/7

---

## 📝 NOTES & RISQUES

### Risques Identifiés
1. **Stripe webhook delays:** Tester en charge
2. **MongoDB performance:** Ajouter indexes si >10k invoices
3. **OCR API limits:** Fallback Tesseract si quota dépassé
4. **User data migration:** Backup avant chaque deploy

### Dépendances Externes
- Stripe API (99.99% uptime)
- Google Vision API (quota 1000/mois FREE)
- Resend (email delivery)
- MongoDB Atlas (database)

### Budget Estimé
- Développement: 6 semaines × 40h = 240h
- Outils: Stripe (~0%), Sentry (~$26/mois), Vercel Pro (~$20/mois)
- **Total tech:** ~$50/mois

---

## 📞 SUPPORT & MAINTENANCE

### Post-Launch
- Monitoring 24/7 (Sentry + Vercel)
- Hotfixes: <2h
- Features requests: Backlog Notion
- User feedback: Typeform surveys

### KPIs à suivre
- Daily Active Users (DAU)
- Monthly Recurring Revenue (MRR)
- Churn rate
- NPS score
- Support tickets/jour

---

**Document créé:** 9 novembre 2025
**Prochaine révision:** Chaque fin de sprint
**Owner:** Équipe BLINK
