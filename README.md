# Invoice Management Application

## 📋 Project Overview

A complete, production-ready SaaS invoice management platform built for freelancers and small businesses. Features include invoice generation with PDF templates, quote management with electronic signatures, expense tracking with OCR, client management, and comprehensive analytics - all with French legal compliance (Article L123-22 Code de commerce).

### Key Highlights
- ✅ Full invoice lifecycle with legal compliance & immutability
- ✅ 5 customizable PDF templates with React-PDF
- ✅ Quote-to-invoice conversion with e-signatures
- ✅ Expense tracking with OCR receipt scanning
- ✅ Email automation with PDF attachments
- ✅ 3-tier subscription system (Free, Pro, Business)
- ✅ Stripe payment integration
- ✅ Advanced analytics with interactive charts
- ✅ Multi-template system with snapshot pattern

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Components**: Shadcn UI (Radix UI primitives)
- **Forms**: React Hook Form 7.65 + Zod validation
- **State**: Zustand 5.0.8
- **Charts**: Recharts 3.4
- **Icons**: Lucide React 0.546

### Backend
- **Runtime**: Next.js API Routes
- **Database**: MongoDB 8.19.2 with Mongoose ODM
- **Authentication**: NextAuth v5
- **Email**: Resend 6.2.0
- **Payments**: Stripe 14.0.0
- **PDF**: @react-pdf/renderer 4.3.1
- **OCR**: Tesseract.js 6.0.1

### DevOps
- **Language**: TypeScript 5
- **Containerization**: Docker
- **Deployment**: Vercel-ready
- **Database**: MongoDB Atlas

---

## 📁 Project Structure

```
invoice-app/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Auth routes (login, register)
│   │   ├── api/                      # RESTful API endpoints
│   │   │   ├── invoices/             # Invoice CRUD + finalize + PDF
│   │   │   ├── clients/              # Client management
│   │   │   ├── quotes/               # Quote management + conversion
│   │   │   ├── expenses/             # Expense tracking + OCR
│   │   │   ├── email/                # Email sending
│   │   │   ├── subscription/         # Stripe billing
│   │   │   ├── analytics/            # Business metrics
│   │   │   └── auth/                 # NextAuth handlers
│   │   ├── dashboard/                # Main authenticated UI
│   │   └── legal/                    # Legal pages
│   ├── components/                   # React UI Components
│   │   ├── invoices/                 # Invoice forms, lists, cards
│   │   ├── quotes/                   # Quote components
│   │   ├── clients/                  # Client management
│   │   ├── expenses/                 # Expense tracking
│   │   ├── analytics/                # Charts and KPIs
│   │   ├── dashboard/                # Layout and overview
│   │   └── ui/                       # Shadcn UI primitives
│   ├── lib/                          # Business Logic & Utilities
│   │   ├── invoice-templates/        # PDF template system
│   │   ├── subscription/             # Plan management & gating
│   │   ├── services/                 # Server services (PDF, email)
│   │   ├── validations/              # Zod schemas
│   │   ├── auth/                     # NextAuth config
│   │   ├── db/                       # MongoDB connection
│   │   └── utils/                    # Helper functions
│   ├── models/                       # Mongoose schemas
│   │   ├── User.ts                   # User + subscription
│   │   ├── Invoice.ts                # Invoice with legal fields
│   │   ├── Client.ts                 # Client management
│   │   ├── Quote.ts                  # Quote with e-signature
│   │   ├── Expense.ts                # Expense tracking
│   │   ├── Service.ts                # Service catalog
│   │   └── InvoiceTemplate.ts        # Template customization
│   ├── services/                     # Client-side API services
│   ├── hooks/                        # Custom React hooks
│   └── types/                        # TypeScript definitions
├── public/                           # Static assets
├── Dockerfile                        # Docker configuration
├── package.json                      # Dependencies
└── README.md                         # This file
```

---

## 🎯 Core Features

### 1. Invoice Management
- **Complete Lifecycle**: Draft → Sent → Paid/Overdue
- **Auto-Numbering**: Format `FAC{YEAR}-{PREFIX}-{NUMBER}`
- **Legal Finalization**: Immutable invoices with PDF lock
- **PDF Integrity**: SHA-256 hash verification
- **Soft Delete**: 10-year archival (legal requirement)
- **Payment Tracking**: Partial payments supported
- **Reminders**: Friendly, firm, and final reminder emails
- **CSV Export**: Pro plan feature

### 2. Template System
5 professional templates with full customization:
- **ModerneTemplate**: Sidebar layout (30% colored + 70% content)
- **ClassiqueTemplate**: Formal vertical with decorative borders
- **MinimalisteTemplate**: Centered, list-based design
- **StudioTemplate**: Asymmetric with diagonal header
- **CreatifTemplate**: Bold diagonal header with accent colors

**Customization**:
- Colors (primary, secondary, accent)
- Typography (fonts, sizes)
- Layout (logo position, spacing)
- Section visibility toggles
- Custom text (legal mentions, footer)

**Snapshot Pattern**: Template configuration saved with each invoice ensures consistent rendering forever.

### 3. Quote Management
- **Electronic Signatures**: Token-based public signing
- **Quote-to-Invoice Conversion**: One-click conversion
- **Expiration Tracking**: Auto-expire after validUntil date
- **Status Workflow**: Draft → Sent → Accepted/Rejected/Expired/Converted
- **PDF Generation**: Same template system as invoices

### 4. Client Management
- **Individual & Business Types**: Different validation rules
- **SIRET Validation**: French company registration number
- **Contract Management**: Upload and store contract files
- **Payment Terms**: Client-specific payment defaults
- **Revenue Tracking**: Total revenue per client

### 5. Expense Tracking
- **OCR Receipt Scanning**: Tesseract.js extracts vendor, amount, date (Pro plan)
- **12 Categories**: Restaurant, Transport, Carburant, Fournitures, etc.
- **Receipt Storage**: Base64 image storage
- **Tax Recovery**: Track VAT amounts for deduction
- **Invoice Linking**: Link expenses to invoices

### 6. Analytics Dashboard
- **Revenue & Expense Trends**: Line charts with month-over-month comparison
- **Top Clients**: Bar chart by revenue
- **Expense Breakdown**: Pie chart by category
- **VAT Analysis**: Breakdown by tax rate (0%, 5.5%, 10%, 20%)
- **KPI Cards**: Total revenue, expenses, pending invoices, clients
- **Date Range Filtering**: Custom periods

### 7. Subscription & Billing

| Feature | Free | Pro (€10/mo) | Business (€25/mo) |
|---------|------|--------------|-------------------|
| Invoices/month | 5 | 50 | Unlimited |
| Quotes/month | 5 | 50 | Unlimited |
| Expenses/month | 5 | 50 | Unlimited |
| Clients | 5 | Unlimited | Unlimited |
| Templates | 1 | Unlimited | Unlimited |
| Email Automation | ❌ | ✅ | ✅ |
| Payment Reminders | ❌ | ✅ | ✅ |
| OCR Scanning | ❌ | ✅ | ✅ |
| E-Signature | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| CSV Export | ❌ | ✅ | ✅ |
| Multi-user | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |

**Stripe Integration**:
- Checkout session creation
- Webhook handling (payment events)
- Billing portal access
- Subscription management
- Annual billing (2 months free)

### 8. Email Service
- **Resend Integration**: Professional email delivery
- **PDF Attachments**: Invoices and quotes
- **HTML Templates**: Branded email designs
- **Retry Logic**: Automatic retry on failure
- **Delivery Tracking**: Email sent timestamps

### 9. Authentication & Security
- **NextAuth v5**: Email/password + Google OAuth
- **Password Hashing**: bcryptjs
- **Session Management**: JWT-based
- **Password Reset**: Token-based recovery
- **Profile Completion**: Required before finalization

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB database (local or Atlas)
- Stripe account (for payments)
- Resend account (for emails)

### Environment Variables

Create `.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/invoiceapp

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Resend (Email)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=invoices@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_ANNUAL=price_...

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

### Installation Steps

```bash
# Clone repository
git clone https://github.com/yourusername/invoice-app.git
cd invoice-app

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t invoice-app .

# Run container
docker run -p 3000:3000 --env-file .env.local invoice-app
```

---

## 📚 Documentation

Detailed documentation available in subdirectories:

- **[API Routes](src/app/api/README.md)** - RESTful API endpoints
- **[Data Models](src/models/README.md)** - MongoDB schemas
- **[UI Components](src/components/README.md)** - React components
- **[Template System](src/lib/invoice-templates/README.md)** - PDF templates
- **[Subscription](src/lib/subscription/README.md)** - Billing & plans
- **[Client Services](src/services/README.md)** - API wrappers
- **[Server Services](src/lib/services/README.md)** - Business logic
- **[Validations](src/lib/validations/README.md)** - Zod schemas

---

## 🔐 Security & Compliance

### Legal Compliance (French Law)
- **Article L123-22 Code de commerce**: Invoice immutability
- **10-Year Archival**: Soft delete for finalized invoices
- **PDF Hash Verification**: SHA-256 integrity check
- **Audit Trail**: All invoice actions logged
- **SIRET Validation**: 14-digit company registration
- **Legal Mentions**: Customizable footer text

### Security Measures
- Authentication on all API routes
- Resource ownership validation
- Zod input validation
- Password hashing with bcryptjs
- Path traversal protection
- CSRF protection (NextAuth)
- Subscription plan gating

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Setup
1. Connect MongoDB Atlas database
2. Set up Stripe products and prices
3. Configure Resend domain
4. Add environment variables
5. Deploy

---

## 📝 API Endpoints

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - List invoices
- `GET /api/invoices/[id]` - Get invoice
- `PATCH /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `POST /api/invoices/[id]/finalize` - Finalize invoice
- `GET /api/invoices/[id]/pdf` - Download PDF
- `POST /api/invoices/[id]/status` - Update status
- `POST /api/invoices/[id]/verify` - Verify PDF integrity
- `GET /api/invoices/export-csv` - Export to CSV

### Clients
- `POST /api/clients` - Create client
- `GET /api/clients` - List clients
- `GET /api/clients/[id]` - Get client
- `PATCH /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client
- `POST /api/clients/[id]/contracts` - Upload contract
- `DELETE /api/clients/[id]/contracts/[contractId]` - Delete contract

### Quotes
- `POST /api/quotes` - Create quote
- `GET /api/quotes` - List quotes
- `GET /api/quotes/[id]` - Get quote
- `PATCH /api/quotes/[id]` - Update quote
- `DELETE /api/quotes/[id]` - Delete quote
- `POST /api/quotes/[id]/convert` - Convert to invoice
- `POST /api/quotes/[id]/generate-signature-link` - Generate signing link
- `GET /api/quotes/[id]/pdf` - Download PDF

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List expenses
- `GET /api/expenses/[id]` - Get expense
- `PATCH /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense
- `POST /api/expenses/ocr` - OCR scan receipt

### Email
- `POST /api/email/send-invoice` - Send invoice email
- `POST /api/email/send-quote` - Send quote email
- `POST /api/email/send-reminder` - Send payment reminder
- `POST /api/email/test` - Test email configuration

### Subscription
- `POST /api/subscription/create-checkout` - Create Stripe checkout
- `GET /api/subscription/portal` - Get billing portal URL
- `POST /api/subscription/cancel` - Cancel subscription
- `GET /api/subscription/usage` - Get usage stats
- `POST /api/subscription/webhook` - Stripe webhook handler

### Analytics
- `GET /api/analytics/overview` - Get dashboard metrics

---

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Invoice management
- ✅ Quote system
- ✅ Client management
- ✅ Expense tracking
- ✅ PDF templates
- ✅ Email automation
- ✅ Subscription billing

### Phase 2 (Q1 2025)
- [ ] Recurring invoices
- [ ] Credit notes (avoir)
- [ ] Multi-currency support
- [ ] Time tracking integration
- [ ] Mobile app (React Native)

### Phase 3 (Q2 2025)
- [ ] Multi-user/team accounts
- [ ] API access for Business plan
- [ ] Advanced reporting
- [ ] Inventory management
- [ ] Project-based invoicing

### Phase 4 (Q3 2025)
- [ ] Accounting software integration
- [ ] Bank account linking
- [ ] Automated expense categorization
- [ ] AI-powered insights
- [ ] White-label solution

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all code
- Follow ESLint configuration
- Write tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - Initial work - [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- React-PDF team for PDF generation
- Stripe for payment processing
- Resend for email delivery
- MongoDB for the database

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on [GitHub](https://github.com/yourusername/invoice-app/issues)
- Email: support@yourdomain.com
- Documentation: [Full Docs](./docs)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ by freelancers, for freelancers**
