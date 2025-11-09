# CHECKLIST SPRINT - BLINK

## 🚨 SPRINT 1: STABILITÉ (Semaine 1) - 26h

### Quick Wins (8h)
- [ ] **Pricing Page** [invoice-app/app/dashboard/pricing/page.tsx](invoice-app/app/dashboard/pricing/page.tsx) - 3h
  - [ ] PricingTable component avec 3 plans
  - [ ] Boutons Stripe checkout
  - [ ] Toggle mensuel/annuel
  - [ ] Highlight plan actuel

- [ ] **OCR Endpoint** [invoice-app/app/api/expenses/ocr/route.ts](invoice-app/app/api/expenses/ocr/route.ts) - 3h
  - [ ] POST route handler
  - [ ] Free: Tesseract.js
  - [ ] Pro: Google Vision API
  - [ ] Parser vendor/amount/tax/date

- [ ] **Stripe Tests** - 2h
  - [ ] Test checkout flow
  - [ ] Test webhook sync
  - [ ] Test portal (cancel/upgrade)

### UX Critique (7h)
- [ ] **Profile Completion Modal** - 2h
  - [ ] Détection profil incomplet
  - [ ] Modal au login si incomplet
  - [ ] Liste champs manquants
  - [ ] Redirection settings

- [ ] **Error Handling Limites** - 2h
  - [ ] UsageBar visible partout
  - [ ] Modal clair si limite atteinte
  - [ ] Disable boutons + tooltip
  - [ ] Link vers pricing

- [ ] **Form Validation** - 3h
  - [ ] Inline validation temps réel
  - [ ] Icons ✓/✗
  - [ ] Messages contextuels
  - [ ] Progress bar

### Deploy Beta
- [ ] **Tests & Deploy** - 8h
  - [ ] Tests manuels complets
  - [ ] Fix bugs critiques
  - [ ] Deploy beta env
  - [ ] Documentation changements

---

## 🎨 SPRINT 2: ONBOARDING (Semaine 2-3) - 22h

### Onboarding Wizard (8h)
- [ ] **Architecture Wizard**
  - [ ] OnboardingWizard.tsx (container)
  - [ ] Step1Welcome.tsx (intro)
  - [ ] Step2Profile.tsx (infos pro)
  - [ ] Step3FirstClient.tsx (client)
  - [ ] Step4FirstInvoice.tsx (facture)
  - [ ] Step5Success.tsx (confetti)

- [ ] **Features Wizard**
  - [ ] Progress bar (étape X/5)
  - [ ] Skip option
  - [ ] Auto-save progression
  - [ ] Tooltips contextuels
  - [ ] Animations smooth
  - [ ] Mobile responsive

### Forms Multi-Step (6h)
- [ ] **InvoiceFormWizard**
  - [ ] Step1: Sélection client
  - [ ] Step2: Ajout items
  - [ ] Step3: Détails (date, échéance)
  - [ ] Step4: Preview
  - [ ] Navigation back/next
  - [ ] Draft auto-save

### Performance (8h)
- [ ] **Auto-Save Drafts** - 4h
  - [ ] Hook useAutoSave.ts
  - [ ] Save interval 5s
  - [ ] Notification "Sauvegardé"
  - [ ] Restore au reload

- [ ] **Pagination** - 4h
  - [ ] Backend: page/limit params
  - [ ] GET /api/invoices pagination
  - [ ] Frontend: InfiniteScroll component
  - [ ] Loading states

---

## 📈 SPRINT 3: ANALYTICS (Semaine 4) - 17h

### Dashboard Charts (6h)
- [ ] **Setup Recharts**
  - [ ] npm install recharts
  - [ ] RevenueChart.tsx (line chart)
  - [ ] InvoiceStatusChart.tsx (pie chart)
  - [ ] TopClientsChart.tsx (bar chart)
  - [ ] ExpensesChart.tsx (area chart)

### Features Avancées (11h)
- [ ] **Email Preview** - 2h
  - [ ] EmailPreviewModal.tsx
  - [ ] Preview HTML
  - [ ] Edit message
  - [ ] Send test

- [ ] **Bulk Actions** - 5h
  - [ ] Checkbox sélection multiple
  - [ ] BulkActions.tsx component
  - [ ] Actions: payé, rappel, export, delete
  - [ ] Confirmation modal

- [ ] **Performance Audit** - 4h
  - [ ] Lighthouse >90
  - [ ] Bundle analyzer
  - [ ] Code splitting
  - [ ] Lazy loading

---

## 🔐 SPRINT 4: SÉCURITÉ (Semaine 5) - 20h

### Security (8h)
- [ ] **Email Verification**
  - [ ] Send email confirmation
  - [ ] Token expiry 24h
  - [ ] Resend option

- [ ] **Session Management**
  - [ ] Timeout 24h inactivité
  - [ ] Remember me (30j)
  - [ ] Force logout all devices

- [ ] **Rate Limiting**
  - [ ] API: 100 req/min
  - [ ] Login: 5 attempts/15min
  - [ ] Upload: 10 files/min

### Testing (8h)
- [ ] **Unit Tests**
  - [ ] Services tests
  - [ ] Utilities tests
  - [ ] Hooks tests
  - [ ] >50 tests

- [ ] **Integration Tests**
  - [ ] API routes tests
  - [ ] Database ops tests
  - [ ] Stripe webhook tests

- [ ] **E2E Tests (Playwright)**
  - [ ] Signup → onboarding → invoice
  - [ ] Upgrade to PRO
  - [ ] OCR upload

### Monitoring (4h)
- [ ] **Sentry Setup**
  - [ ] Install Sentry
  - [ ] Error tracking
  - [ ] Alertes email
  - [ ] Logs structurés

---

## 🌍 SPRINT 5: SCALE (Semaine 6) - 20h

### Infrastructure (10h)
- [ ] **File Storage Migration** - 6h
  - [ ] Setup Vercel Blob
  - [ ] Migrate expenses images
  - [ ] Migrate PDFs
  - [ ] Migrate logos
  - [ ] URLs signés

- [ ] **Caching** - 4h
  - [ ] Setup Redis/Vercel KV
  - [ ] Cache invoices (5 min TTL)
  - [ ] Cache profile (10 min)
  - [ ] Cache subscription (1 min)

### Analytics & Docs (10h)
- [ ] **Monitoring** - 4h
  - [ ] Vercel Analytics
  - [ ] PostHog setup
  - [ ] Custom events
  - [ ] KPIs dashboards

- [ ] **Documentation** - 6h
  - [ ] README.md
  - [ ] API.md
  - [ ] DEPLOYMENT.md
  - [ ] USER_GUIDE.md

---

## ✅ PRÉ-PRODUCTION FINAL

### Technique
- [ ] Tests >70% coverage
- [ ] Lighthouse >90
- [ ] Sentry actif
- [ ] Rate limiting
- [ ] HTTPS/CORS/CSP
- [ ] DB backups

### Fonctionnel
- [ ] Onboarding wizard
- [ ] Pricing page
- [ ] OCR endpoint
- [ ] Profile completion
- [ ] Error handling
- [ ] Forms multi-step
- [ ] Auto-save
- [ ] Pagination
- [ ] Bulk actions
- [ ] Email preview

### Business
- [ ] Stripe production
- [ ] Privacy policy
- [ ] Terms of service
- [ ] RGPD compliance
- [ ] Support email
- [ ] Refund policy

### UX
- [ ] Mobile 100%
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Success feedback
- [ ] Animations
- [ ] Tooltips
- [ ] Keyboard shortcuts

---

## 🎯 OBJECTIF FINAL

**Score cible:** 9.0/10
**Durée:** 6 semaines (105h total)
**Livrable:** Application production-ready

### KPIs Succès
- Onboarding completion: 50% → 85%
- Temps première facture: N/A → <5 min
- Conversion FREE→PRO: 0% → 5-10%
- Performance: ~60 → >90
- Bugs critiques: 5 → 0

---

**Mis à jour:** 9 novembre 2025
