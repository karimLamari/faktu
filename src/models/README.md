# Data Models Documentation

## Overview
This directory contains all Mongoose schema definitions for MongoDB collections. Models define the data structure, validation rules, and business logic for the application.

## Technology Stack
- **ODM**: Mongoose 8.19.2
- **Database**: MongoDB
- **Validation**: Mongoose built-in + Zod for API layer
- **TypeScript**: Full type safety with interfaces

---

## Models

### 1. User Model (`User.ts`)

#### Purpose
Stores user account information, company profile, subscription details, and usage tracking.

#### Schema Structure
```typescript
interface IUser {
  // Authentication
  email: string                    // Unique, indexed, lowercase
  password?: string                // Hashed with bcryptjs (optional for OAuth)
  googleId?: string                // Google OAuth identifier

  // Personal Info
  firstName: string
  lastName: string

  // Company Profile
  companyName?: string
  legalForm?: string              // e.g., "SARL", "SAS", "EI", "Auto-entrepreneur"
  siret?: string                  // 14 digits, unique, indexed
  address?: {
    street: string
    complement?: string
    city: string
    postalCode: string
    country: string
  }
  phone?: string
  logo?: string                   // URL or base64
  iban?: string

  // Legal Information (French compliance)
  rcsCity?: string                // Ville du RCS
  capital?: string                // Capital social
  tvaNumber?: string              // Numéro de TVA intracommunautaire
  insuranceProvider?: string
  insuranceNumber?: string

  // Preferences
  currency: 'EUR' | 'USD' | 'GBP' // Default: EUR
  defaultTaxRate: number          // Default: 20

  // Invoice Numbering Configuration
  invoicePrefix: string           // Default: "FAC"
  invoiceNextNumber: number       // Auto-incremented
  invoiceCurrentYear: number      // For year-based reset

  // Quote Numbering Configuration
  quotePrefix: string             // Default: "DEV"
  quoteNextNumber: number
  quoteCurrentYear: number

  // Subscription & Billing
  subscriptionPlan: 'free' | 'pro' | 'business'
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStartDate?: Date
  subscriptionEndDate?: Date

  // Usage Tracking (monthly)
  usageStats: {
    invoices: {
      current: number              // Current month count
      lastReset: Date
    }
    quotes: {
      current: number
      lastReset: Date
    }
    expenses: {
      current: number
      lastReset: Date
    }
    clients: {
      current: number
      lastReset: Date
    }
  }

  // Password Reset
  resetPasswordToken?: string
  resetPasswordExpiry?: Date

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

#### Indexes
```typescript
email: { unique: true, lowercase: true }
siret: { unique: true, sparse: true }
googleId: { unique: true, sparse: true }
```

#### Methods
```typescript
user.comparePassword(candidatePassword: string): Promise<boolean>
user.isProfileComplete(): boolean
user.hasFeatureAccess(feature: string): boolean
```

#### Validations
- Email: Valid email format
- SIRET: Exactly 14 digits (if provided)
- Password: Min 8 characters (if using email/password auth)
- Currency: Must be EUR, USD, or GBP
- Tax rate: Between 0 and 100

#### Usage Notes
- Profile completion check required before finalizing invoices
- Usage stats reset monthly (automatic on first action of new month)
- Password stored as bcrypt hash (never plaintext)

---

### 2. Invoice Model (`Invoice.ts`)

#### Purpose
Complete invoice lifecycle management with legal compliance (French accounting standards).

#### Schema Structure
```typescript
interface IInvoice {
  // Ownership
  userId: ObjectId                // Ref: User, indexed
  clientId: ObjectId              // Ref: Client, indexed

  // Invoice Identification
  invoiceNumber: string           // Unique per user, auto-generated
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

  // Dates
  issueDate: Date                 // Date d'émission
  dueDate: Date                   // Date d'échéance
  sentAt?: Date                   // When invoice was sent
  paidAt?: Date                   // When payment received

  // Items
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    taxRate: number               // VAT percentage (e.g., 20)
    amount: number                // Auto-calculated: quantity * unitPrice
    taxAmount: number             // Auto-calculated: amount * (taxRate/100)
    totalAmount: number           // Auto-calculated: amount + taxAmount
  }>

  // Totals (auto-calculated)
  subtotal: number                // Sum of all item amounts (HT)
  taxTotal: number                // Sum of all tax amounts
  total: number                   // Total TTC

  // Payment Information
  paymentTerms?: string           // e.g., "Paiement à 30 jours"
  paymentMethod?: string          // e.g., "Virement bancaire"

  // Additional Information
  notes?: string                  // Internal notes
  legalMentions?: string          // Legal footer text

  // Template Snapshot (immutability)
  templateSnapshot?: {
    templateId: ObjectId
    name: string
    component: string
    colors: object
    typography: object
    layout: object
    sections: object
    customText: object
  }

  // Payment Tracking
  payments: Array<{
    amount: number
    date: Date
    method: string
    reference?: string
  }>
  amountPaid: number              // Sum of payments
  remainingBalance: number        // total - amountPaid

  // Reminders
  reminders: Array<{
    type: 'friendly' | 'firm' | 'final'
    sentAt: Date
    emailId?: string
  }>

  // Legal Compliance (French law: Article L123-22)
  isFinalized: boolean            // Once true, invoice is locked
  finalizedAt?: Date              // Timestamp of finalization
  pdfPath?: string                // Permanent storage location
  pdfHash?: string                // SHA-256 hash for integrity

  // Soft Delete (legal archival requirement: 10 years)
  deletedAt?: Date                // Null = active, Date = soft deleted

  // Audit Trail
  auditLog: Array<{
    action: string                // e.g., "created", "finalized", "paid"
    performedBy: ObjectId
    timestamp: Date
    details?: object
  }>

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

#### Indexes
```typescript
{ userId: 1, status: 1 }
{ userId: 1, clientId: 1 }
{ userId: 1, issueDate: -1 }
{ userId: 1, invoiceNumber: 1 } // Unique compound
{ userId: 1, isFinalized: 1 }
{ userId: 1, deletedAt: 1 }
```

#### Virtual Fields
```typescript
invoice.isOverdue: boolean       // dueDate < now && status !== 'paid'
invoice.daysOverdue: number      // Days since dueDate
```

#### Methods
```typescript
invoice.calculateTotals(): void
invoice.addPayment(amount, date, method): void
invoice.canBeModified(): boolean
invoice.canBeDeleted(): boolean
```

#### Validations
- invoiceNumber: Unique per user, format: `FAC{YEAR}-{PREFIX}-{NUMBER}`
- items: At least 1 item required
- dueDate: Must be >= issueDate
- status: Cannot change from 'paid' to 'draft'
- Finalized invoices: Cannot modify except status

#### Business Rules
1. **Finalization** - Once `isFinalized=true`:
   - Invoice data is locked
   - PDF generated and stored permanently
   - SHA-256 hash calculated for integrity
   - Only status can be updated (sent → paid)

2. **Deletion**:
   - Draft: Hard delete allowed
   - Finalized: Only soft delete (sets `deletedAt`)
   - Soft deleted invoices kept for 10 years (legal requirement)

3. **Numbering**:
   - Auto-increments per year
   - Format: `FAC2025-ABC-0001`
   - Resets annually with year in number

4. **Payment Tracking**:
   - Supports partial payments
   - Auto-updates `remainingBalance`
   - Auto-sets status to 'paid' when fully paid

---

### 3. Client Model (`Client.ts`)

#### Purpose
Stores client/customer information and manages contracts.

#### Schema Structure
```typescript
interface IClient {
  // Ownership
  userId: ObjectId                // Ref: User, indexed

  // Identification
  name: string                    // Required, indexed
  email?: string                  // Indexed
  phone?: string

  // Address
  address?: {
    street: string
    complement?: string
    city: string
    postalCode: string
    country: string
  }

  // Client Type
  type: 'individual' | 'business' // Indexed

  // Company Information (if type=business)
  companyInfo?: {
    companyName?: string
    siret?: string                // 14 digits
    tvaNumber?: string
    legalForm?: string
    rcsCity?: string
  }

  // Payment Configuration
  paymentTerms?: number           // Days (e.g., 30)
  defaultTaxRate?: number         // Override user's default

  // Contracts
  contracts: Array<{
    _id: ObjectId                 // Auto-generated
    fileName: string
    fileUrl: string               // Storage location
    uploadDate: Date
    fileSize: number              // Bytes
    mimeType: string
  }>

  // Status
  isActive: boolean               // Default: true

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

#### Indexes
```typescript
{ userId: 1 }
{ userId: 1, name: 1 }
{ userId: 1, email: 1 }
{ userId: 1, type: 1 }
```

#### Virtual Fields
```typescript
client.fullAddress: string       // Formatted address string
client.invoiceCount: number      // Count of associated invoices
client.totalRevenue: number      // Sum of paid invoices
```

#### Methods
```typescript
client.addContract(file): Promise<void>
client.removeContract(contractId): Promise<void>
client.getActiveInvoices(): Promise<Invoice[]>
```

#### Validations
- name: Required, min 2 characters
- email: Valid email format (if provided)
- SIRET: 14 digits (if business type)
- type: Must be 'individual' or 'business'
- paymentTerms: Positive integer (if provided)

#### Business Rules
1. Cannot delete client if has associated invoices/quotes
2. Deactivating client (isActive=false) hides from lists but preserves data
3. Contract files stored in user-specific directory

---

### 4. Quote Model (`Quote.ts`)

#### Purpose
Quote/estimate management with electronic signature support and invoice conversion.

#### Schema Structure
```typescript
interface IQuote {
  // Ownership
  userId: ObjectId                // Ref: User
  clientId: ObjectId              // Ref: Client

  // Quote Identification
  quoteNumber: string             // Unique per user, auto-generated
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'

  // Dates
  issueDate: Date
  validUntil: Date                // Expiration date
  sentAt?: Date

  // Items (same structure as Invoice)
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
    amount: number
    taxAmount: number
    totalAmount: number
  }>

  // Totals
  subtotal: number
  taxTotal: number
  total: number

  // Additional Info
  notes?: string
  termsAndConditions?: string

  // Template Snapshot
  templateSnapshot?: object

  // Electronic Signature
  signatureToken?: string         // Unique URL token
  signatureTokenExpiry?: Date     // Token expiration (7 days)
  signatureData?: string          // Base64 canvas signature image
  signerName?: string
  signerEmail?: string
  signerIp?: string
  signedAt?: Date

  // Conversion Tracking
  convertedToInvoice?: ObjectId   // Ref: Invoice
  convertedAt?: Date

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

#### Indexes
```typescript
{ userId: 1, status: 1 }
{ userId: 1, clientId: 1 }
{ userId: 1, issueDate: -1 }
{ userId: 1, quoteNumber: 1 }    // Unique compound
{ signatureToken: 1 }             // For public signature page
```

#### Virtual Fields
```typescript
quote.isExpired: boolean         // validUntil < now
quote.canBeConverted: boolean    // status === 'accepted'
```

#### Methods
```typescript
quote.calculateTotals(): void
quote.generateSignatureToken(): string
quote.sign(signerInfo): Promise<void>
quote.convertToInvoice(): Promise<Invoice>
```

#### Validations
- quoteNumber: Format `DEV{YEAR}-{PREFIX}-{NUMBER}`
- validUntil: Must be > issueDate
- status: Cannot convert if not 'accepted'
- signatureToken: Must be unique and not expired

#### Business Rules
1. **Signature Flow**:
   - Generate unique token → Send link to client
   - Client signs on public page (no auth required)
   - Token expires after 7 days
   - Once signed, status → 'accepted'

2. **Conversion**:
   - Only 'accepted' quotes can convert
   - Creates new invoice with same items
   - Links invoice ID to quote
   - Sets quote status to 'converted'
   - Quote preserved for records

3. **Expiration**:
   - Auto-expire if validUntil < now
   - Expired quotes cannot be signed or converted

---

### 5. Expense Model (`Expense.ts`)

#### Purpose
Expense tracking with receipt storage and OCR support.

#### Schema Structure
```typescript
interface IExpense {
  // Ownership
  userId: ObjectId                // Ref: User

  // Expense Details
  vendor: string                  // Supplier/merchant name
  amount: number                  // Total amount (TTC)
  category: 'Restaurant' | 'Transport' | 'Carburant' | 'Fournitures' |
            'Logiciel' | 'Matériel' | 'Formation' | 'Téléphone' |
            'Internet' | 'Loyer' | 'Assurance' | 'Autre'

  // Date & Payment
  date: Date                      // Expense date (indexed)
  paymentMethod: 'Card' | 'Cash' | 'Transfer' | 'Check' | 'Other'

  // Tax Information
  taxAmount?: number              // Recovered VAT amount
  taxRate?: number                // VAT rate percentage

  // Receipt
  receiptImage?: string           // Base64 or URL
  receiptImageUrl?: string        // Permanent storage URL

  // Linking
  invoiceNumber?: string          // Link to related invoice (indexed)

  // Additional Info
  notes?: string
  description?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

#### Indexes
```typescript
{ userId: 1, date: -1 }
{ userId: 1, category: 1 }
{ userId: 1, invoiceNumber: 1 }
```

#### Virtual Fields
```typescript
expense.amountHT: number         // amount - taxAmount
expense.isDeductible: boolean    // Business expense logic
```

#### Methods
```typescript
expense.extractFromOCR(imageData): Promise<void>
expense.uploadReceipt(file): Promise<string>
```

#### Validations
- vendor: Required, min 2 characters
- amount: Positive number
- date: Cannot be future date
- category: Must be one of predefined values
- paymentMethod: Must be valid option

#### Business Rules
1. **OCR Processing**:
   - Upload receipt image
   - Tesseract.js extracts: vendor, amount, date
   - User reviews and confirms
   - Original image stored

2. **Tax Recovery**:
   - taxAmount tracked for VAT recovery
   - Category affects deductibility
   - Export to accounting software

3. **Categorization**:
   - Fixed category list for reporting
   - Analytics group by category
   - Filter expenses by category

---

### 6. Service Model (`Service.ts`)

#### Purpose
Reusable service/product catalog for quick invoice creation.

#### Schema Structure
```typescript
interface IService {
  // Ownership
  userId: ObjectId                // Ref: User

  // Service Details
  name: string                    // Required, indexed
  description?: string

  // Pricing
  unitPrice: number               // Default price
  taxRate: number                 // VAT rate (e.g., 20)

  // Organization
  category?: string               // User-defined category

  // Status
  isActive: boolean               // Default: true

  // Usage Stats
  usageCount: number              // Times used in invoices
  lastUsed?: Date

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

#### Indexes
```typescript
{ userId: 1, name: 1 }
{ userId: 1, isActive: 1 }
```

#### Methods
```typescript
service.incrementUsage(): void
service.toInvoiceItem(): InvoiceItem
```

#### Validations
- name: Required, min 2 characters
- unitPrice: Positive number
- taxRate: Between 0 and 100

#### Business Rules
1. Quick add to invoices via dropdown
2. Pre-fills description, price, tax rate
3. User can override values per invoice
4. Track most-used services for suggestions

---

### 7. InvoiceTemplate Model (`InvoiceTemplate.ts`)

#### Purpose
Custom invoice PDF template configurations per user.

#### Schema Structure
```typescript
interface IInvoiceTemplate {
  // Ownership
  userId: ObjectId                // Ref: User

  // Template Identity
  name: string                    // User-defined name
  isDefault: boolean              // Only one per user
  templateComponent: 'ModerneTemplate' | 'ClassiqueTemplate' |
                     'MinimalisteTemplate' | 'StudioTemplate' |
                     'CreatifTemplate'

  // Color Configuration
  colors: {
    primary: string               // Hex color
    secondary: string
    accent: string
    text: string
    background: string
  }

  // Typography
  typography: {
    headingFont: string
    bodyFont: string
    headingSize: number
    bodySize: number
  }

  // Layout Settings
  layout: {
    logoPosition: 'left' | 'center' | 'right'
    logoSize: 'small' | 'medium' | 'large'
    headerStyle: 'simple' | 'bold' | 'elegant'
    spacing: 'compact' | 'normal' | 'spacious'
  }

  // Section Visibility
  sections: {
    showLogo: boolean
    showCompanyInfo: boolean
    showClientInfo: boolean
    showPaymentTerms: boolean
    showNotes: boolean
    showLegalMentions: boolean
    showSignature: boolean
  }

  // Custom Text
  customText: {
    header?: string
    footer?: string
    paymentInstructions?: string
    legalMentions?: string
  }

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

#### Indexes
```typescript
{ userId: 1 }
{ userId: 1, isDefault: 1 }
```

#### Methods
```typescript
template.setAsDefault(): Promise<void>
template.createSnapshot(): object
template.preview(): Buffer
```

#### Validations
- name: Required
- colors: Valid hex color codes
- Only one default template per user

#### Business Rules
1. **Snapshot Pattern**:
   - When invoice created, template config copied
   - Invoice always renders with original template
   - Template updates don't affect existing invoices

2. **Default Template**:
   - Setting new default unsets previous
   - Used for all new invoices unless specified

3. **Customization**:
   - 5 base templates available
   - Each customizable with colors, fonts, layout
   - Live preview before saving

---

### 8. Additional Models

#### Payment Model (`Payment.ts`)
```typescript
interface IPayment {
  userId: ObjectId
  invoiceId: ObjectId
  amount: number
  date: Date
  method: string
  reference?: string
  stripePaymentIntentId?: string
}
```

#### InvoiceAudit Model (`InvoiceAudit.ts`)
```typescript
interface IInvoiceAudit {
  invoiceId: ObjectId
  userId: ObjectId
  action: 'created' | 'updated' | 'finalized' | 'sent' | 'paid' | 'deleted'
  performedBy: ObjectId
  timestamp: Date
  beforeData?: object
  afterData?: object
  ipAddress?: string
}
```

#### QuoteTemplate Model (`QuoteTemplate.ts`)
Similar structure to InvoiceTemplate but for quotes.

---

## Common Patterns

### Timestamps
All models include automatic timestamps:
```typescript
{ timestamps: true }
// Adds: createdAt, updatedAt
```

### Soft Delete
Models supporting soft delete:
- Invoice (legal requirement)
- Client (preserve history)

Pattern:
```typescript
deletedAt?: Date
// Query: { deletedAt: null } for active records
```

### User Ownership
All models reference userId:
```typescript
userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
```

### Virtual Population
Relations populated via virtuals:
```typescript
InvoiceSchema.virtual('client', {
  ref: 'Client',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true
})
```

---

## Database Optimization

### Indexing Strategy
1. **userId**: All models (frequent filtering)
2. **Compound indexes**: userId + secondary fields
3. **Unique indexes**: email, invoiceNumber (per user)
4. **Date indexes**: For time-based queries

### Query Performance
- Use `lean()` for read-only queries
- Select only needed fields with `select()`
- Populate relationships sparingly
- Aggregate for analytics

### Data Integrity
- Required fields enforced at schema level
- Enum validation for status fields
- Pre-save hooks for calculations
- Referential integrity via foreign keys

---

## Migration Scripts

Located in `/scripts/` (excluded from docs):
- `migrate-add-finalization-fields.js` - Add legal compliance fields
- `fix-invoice-numbers.ts` - Repair duplicate numbering
- `migrate-pdf-cache.js` - Update PDF storage paths

---

## Testing

### Model Testing
```typescript
// Unit tests for each model
describe('Invoice Model', () => {
  it('should calculate totals correctly', () => {...})
  it('should prevent modification of finalized invoices', () => {...})
  it('should enforce unique invoice numbers', () => {...})
})
```

### Factory Pattern
Use factories for test data:
```typescript
const mockInvoice = createMockInvoice({
  userId: testUserId,
  status: 'draft'
})
```

---

## Best Practices

1. **Never expose password fields** in queries
2. **Always validate ownership** before operations
3. **Use transactions** for multi-document updates
4. **Implement cascade delete** carefully
5. **Log sensitive operations** to audit trail
6. **Sanitize user input** before saving
7. **Use TypeScript interfaces** for type safety
8. **Version schema changes** with migrations

---

## Future Enhancements

1. Multi-currency support (exchange rates)
2. Recurring invoices (cron-based generation)
3. Invoice approval workflow
4. Multi-user collaboration (team accounts)
5. Inventory tracking integration
6. Time tracking integration
7. Project-based invoicing
8. Credit notes (avoir) support
