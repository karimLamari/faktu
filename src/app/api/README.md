# API Routes Documentation

## Overview
This directory contains all RESTful API endpoints for the invoice management application. Built with Next.js 15 App Router, all routes use the new route handlers pattern.

## Architecture
- **Framework**: Next.js 15 App Router
- **Pattern**: RESTful API with HTTP methods (GET, POST, PATCH, DELETE)
- **Authentication**: NextAuth v5 session-based authentication
- **Validation**: Zod schemas for request/response validation
- **Database**: MongoDB via Mongoose ODM

## Authentication Flow
All protected routes follow this pattern:
```typescript
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
const userId = session.user.id
```

## API Endpoints

### 1. Invoices (`/api/invoices`)
Core invoice management with legal compliance features.

#### `POST /api/invoices`
Create a new invoice.
- **Auth**: Required
- **Subscription Check**: Validates monthly invoice limit
- **Features**:
  - Auto-generates invoice number (format: FAC{YEAR}-{PREFIX}-{NUMBER})
  - Captures template snapshot for immutability
  - Validates all items and calculations
  - Increments usage counter
- **Request Body**:
  ```typescript
  {
    clientId: string
    templateId?: string
    items: Array<{
      description: string
      quantity: number
      unitPrice: number
      taxRate: number
    }>
    issueDate: Date
    dueDate: Date
    paymentTerms?: string
    notes?: string
    legalMentions?: string
  }
  ```
- **Returns**: Created invoice with auto-generated `invoiceNumber`

#### `GET /api/invoices`
List all user's invoices.
- **Auth**: Required
- **Query Params**:
  - `clientId` (optional): Filter by client
- **Returns**: Array of invoices (sorted by issueDate DESC)

#### `GET /api/invoices/[id]`
Get single invoice by ID.
- **Auth**: Required
- **Ownership Check**: Validates userId matches
- **Returns**: Invoice with populated client data

#### `PATCH /api/invoices/[id]`
Update existing invoice.
- **Auth**: Required
- **Finalization Protection**: Cannot modify finalized invoices (except status)
- **Allowed Fields**: All invoice fields except `invoiceNumber`, `isFinalized`, `finalizedAt`
- **Returns**: Updated invoice

#### `DELETE /api/invoices/[id]`
Delete invoice.
- **Auth**: Required
- **Soft Delete**: If finalized, sets `deletedAt` timestamp (legal archival requirement)
- **Hard Delete**: If draft, permanently removes document
- **Decrements**: Usage counter if hard deleted
- **Returns**: Success message

#### `POST /api/invoices/[id]/finalize`
Finalize invoice (legal lock).
- **Auth**: Required
- **Validations**:
  - Profile completion check (company info required)
  - All required invoice fields present
  - Cannot finalize already finalized invoice
- **Process**:
  1. Fetch invoice, client, user, template snapshot
  2. Generate final PDF with @react-pdf/renderer
  3. Calculate SHA-256 hash of PDF
  4. Save PDF to `/invoices/{userId}/{year}/{invoiceNumber}.pdf`
  5. Update invoice: `isFinalized=true`, `finalizedAt=now`, `pdfPath`, `pdfHash`
  6. Log action in audit trail
- **Returns**: Finalized invoice with PDF metadata

#### `GET /api/invoices/[id]/pdf`
Generate and download invoice PDF.
- **Auth**: Required
- **Query Params**:
  - `download` (optional): Trigger file download
- **Process**:
  1. Fetch invoice, client, user, template
  2. Generate PDF buffer
  3. Return PDF with proper headers
- **Returns**: PDF file (application/pdf)

#### `POST /api/invoices/[id]/status`
Update invoice status.
- **Auth**: Required
- **Allowed Values**: draft, sent, paid, overdue, cancelled
- **Auto-updates**: `sentAt` when status changes to 'sent'
- **Returns**: Updated invoice

#### `POST /api/invoices/[id]/verify`
Verify PDF integrity.
- **Auth**: Required
- **Process**:
  1. Read stored PDF from disk
  2. Calculate current SHA-256 hash
  3. Compare with stored `pdfHash`
- **Returns**: `{ valid: boolean, message: string }`

#### `GET /api/invoices/export-csv`
Export invoices to CSV.
- **Auth**: Required
- **Feature Gate**: Requires Pro plan or higher
- **Query Params**:
  - `startDate`, `endDate`: Date range filter
  - `status`: Status filter
  - `clientId`: Client filter
- **Returns**: CSV file with headers

---

### 2. Clients (`/api/clients`)
Client and contract management.

#### `POST /api/clients`
Create new client.
- **Auth**: Required
- **Subscription Check**: Validates client limit
- **Validation**: Zod schema (SIRET for companies)
- **Increments**: Usage counter
- **Request Body**:
  ```typescript
  {
    name: string
    email?: string
    phone?: string
    address?: {
      street: string
      city: string
      postalCode: string
      country: string
    }
    type: 'individual' | 'business'
    companyInfo?: {
      siret?: string
      tvaNumber?: string
    }
    paymentTerms?: number // days
  }
  ```
- **Returns**: Created client

#### `GET /api/clients`
List all user's clients.
- **Auth**: Required
- **Query Params**:
  - `active` (optional): Filter by isActive status
- **Returns**: Array of clients (sorted by name)

#### `GET /api/clients/[id]`
Get single client.
- **Auth**: Required
- **Ownership Check**: Validates userId
- **Returns**: Client with contracts

#### `PATCH /api/clients/[id]`
Update client.
- **Auth**: Required
- **Validation**: Zod schema
- **Returns**: Updated client

#### `DELETE /api/clients/[id]`
Delete client.
- **Auth**: Required
- **Constraint Check**: Cannot delete if has invoices/quotes
- **Decrements**: Usage counter
- **Returns**: Success message

#### `GET /api/clients/[id]/contracts`
List client contracts.
- **Auth**: Required
- **Returns**: Array of contract metadata

#### `POST /api/clients/[id]/contracts`
Upload new contract.
- **Auth**: Required
- **Upload**: Stores contract file
- **Returns**: Updated client with new contract

#### `DELETE /api/clients/[id]/contracts/[contractId]`
Delete specific contract.
- **Auth**: Required
- **Returns**: Updated client

---

### 3. Quotes (`/api/quotes`)
Quote management with electronic signatures.

#### `POST /api/quotes`
Create new quote.
- **Auth**: Required
- **Subscription Check**: Monthly quote limit
- **Auto-generates**: Quote number (format: DEV{YEAR}-{PREFIX}-{NUMBER})
- **Returns**: Created quote

#### `GET /api/quotes`
List user's quotes.
- **Auth**: Required
- **Query Params**: `clientId` (optional)
- **Returns**: Array of quotes

#### `GET /api/quotes/[id]`
Get single quote.
- **Auth**: Required
- **Returns**: Quote with client data

#### `PATCH /api/quotes/[id]`
Update quote.
- **Auth**: Required
- **Status Protection**: Cannot modify accepted/converted quotes
- **Returns**: Updated quote

#### `DELETE /api/quotes/[id]`
Delete quote.
- **Auth**: Required
- **Decrements**: Usage counter
- **Returns**: Success message

#### `POST /api/quotes/[id]/convert`
Convert quote to invoice.
- **Auth**: Required
- **Validation**: Quote must be accepted
- **Process**:
  1. Create new invoice from quote data
  2. Link invoice ID to quote
  3. Set quote status to 'converted'
- **Returns**: New invoice object

#### `POST /api/quotes/[id]/generate-signature-link`
Generate electronic signature link.
- **Auth**: Required
- **Process**:
  1. Generate unique signature token (UUID)
  2. Set expiry (7 days)
  3. Update quote with token
- **Returns**: Public signature URL

#### `GET /api/quotes/[id]/pdf`
Generate quote PDF.
- **Auth**: Required
- **Returns**: PDF file

---

### 4. Expenses (`/api/expenses`)
Expense tracking with OCR.

#### `POST /api/expenses`
Create expense.
- **Auth**: Required
- **Subscription Check**: Monthly expense limit
- **Features**: Receipt image upload (base64)
- **Increments**: Usage counter
- **Request Body**:
  ```typescript
  {
    vendor: string
    amount: number
    category: 'Restaurant' | 'Transport' | 'Carburant' | ...
    date: Date
    paymentMethod: 'Card' | 'Cash' | 'Transfer' | 'Check' | 'Other'
    taxAmount?: number
    receiptImage?: string // base64
    notes?: string
  }
  ```
- **Returns**: Created expense

#### `GET /api/expenses`
List expenses.
- **Auth**: Required
- **Query Params**:
  - `startDate`, `endDate`: Date range
  - `category`: Filter by category
- **Returns**: Array of expenses (sorted by date DESC)

#### `GET /api/expenses/[id]`
Get single expense.
- **Auth**: Required
- **Returns**: Expense object

#### `PATCH /api/expenses/[id]`
Update expense.
- **Auth**: Required
- **Returns**: Updated expense

#### `DELETE /api/expenses/[id]`
Delete expense.
- **Auth**: Required
- **Decrements**: Usage counter
- **Returns**: Success message

#### `POST /api/expenses/ocr`
OCR receipt scanning.
- **Auth**: Required
- **Feature Gate**: Requires Pro plan
- **Request Body**: `{ image: string }` (base64)
- **Process**: Tesseract.js OCR extraction
- **Returns**: `{ vendor, amount, date, category }`

---

### 5. Services (`/api/services`)
Service catalog for quick invoicing.

#### `POST /api/services`
Create service.
- **Auth**: Required
- **Request Body**:
  ```typescript
  {
    name: string
    description?: string
    unitPrice: number
    taxRate: number
    category?: string
  }
  ```
- **Returns**: Created service

#### `GET /api/services`
List services.
- **Auth**: Required
- **Query Params**: `active` (optional)
- **Returns**: Array of services

#### `GET /api/services/[id]`
Get service.
- **Auth**: Required
- **Returns**: Service object

#### `PATCH /api/services/[id]`
Update service.
- **Auth**: Required
- **Returns**: Updated service

#### `DELETE /api/services/[id]`
Delete service.
- **Auth**: Required
- **Returns**: Success message

---

### 6. Invoice Templates (`/api/invoice-templates`)
Template customization management.

#### `POST /api/invoice-templates`
Create custom template.
- **Auth**: Required
- **Validation**: Template configuration schema
- **Default Handling**: Can only have one default template per user
- **Returns**: Created template

#### `GET /api/invoice-templates`
List user templates.
- **Auth**: Required
- **Returns**: Array of templates

#### `GET /api/invoice-templates/[id]`
Get template.
- **Auth**: Required
- **Returns**: Template configuration

#### `PATCH /api/invoice-templates/[id]`
Update template.
- **Auth**: Required
- **Immutability**: Does not affect already created invoices (snapshot pattern)
- **Returns**: Updated template

#### `DELETE /api/invoice-templates/[id]`
Delete template.
- **Auth**: Required
- **Protection**: Cannot delete if used by invoices
- **Returns**: Success message

---

### 7. Email (`/api/email`)
Email sending for invoices and reminders.

#### `POST /api/email/send-invoice`
Send invoice email.
- **Auth**: Required
- **Feature Gate**: Requires Pro plan (emailAutomation feature)
- **Validations**:
  - Profile complete
  - Client has email
  - Invoice exists
- **Process**:
  1. Generate invoice PDF
  2. Render HTML email template
  3. Send via Resend with PDF attachment
  4. Update invoice: `sentAt`, status='sent'
- **Request Body**:
  ```typescript
  {
    invoiceId: string
    recipientEmail: string
    subject?: string
    message?: string
  }
  ```
- **Returns**: `{ success: true, messageId }`

#### `POST /api/email/send-quote`
Send quote email.
- **Auth**: Required
- **Feature Gate**: Pro plan required
- **Similar Process**: As invoice sending
- **Returns**: Success confirmation

#### `POST /api/email/send-reminder`
Send payment reminder.
- **Auth**: Required
- **Feature Gate**: Requires reminders feature
- **Reminder Types**: friendly, firm, final
- **Process**:
  1. Validate invoice is overdue
  2. Select reminder template
  3. Send email with invoice attached
  4. Log reminder in invoice history
- **Request Body**:
  ```typescript
  {
    invoiceId: string
    reminderType: 'friendly' | 'firm' | 'final'
    customMessage?: string
  }
  ```
- **Returns**: Success confirmation

#### `POST /api/email/test`
Test email configuration.
- **Auth**: Required
- **Purpose**: Verify Resend API key and sender email
- **Returns**: Test result

---

### 8. Analytics (`/api/analytics`)
Business insights and reporting.

#### `GET /api/analytics/overview`
Get business metrics dashboard.
- **Auth**: Required
- **Query Params**:
  - `startDate`: Start of date range (default: 30 days ago)
  - `endDate`: End of date range (default: today)
- **Returns**:
  ```typescript
  {
    revenue: {
      total: number
      trend: number // percentage change
      byMonth: Array<{ month: string, amount: number }>
    }
    expenses: {
      total: number
      trend: number
      byCategory: Array<{ category: string, amount: number }>
    }
    invoices: {
      total: number
      paid: number
      pending: number
      overdue: number
      byStatus: Array<{ status: string, count: number }>
    }
    topClients: Array<{
      clientId: string
      name: string
      totalRevenue: number
      invoiceCount: number
    }>
    vatBreakdown: Array<{
      rate: number
      totalVat: number
      totalHT: number
      totalTTC: number
    }>
  }
  ```

---

### 9. Authentication (`/api/auth`)
User registration and password management.

#### `POST /api/auth/register`
Register new user.
- **Validation**: Email format, password strength
- **Password**: Hashed with bcryptjs
- **Auto-creates**: Free plan subscription
- **Returns**: User object (without password)

#### `POST /api/auth/forgot-password`
Request password reset.
- **Process**:
  1. Generate reset token
  2. Set expiry (1 hour)
  3. Send reset email
- **Request Body**: `{ email: string }`
- **Returns**: Success message

#### `POST /api/auth/reset-password`
Confirm password reset.
- **Validation**: Token not expired
- **Process**:
  1. Verify token
  2. Hash new password
  3. Clear reset token
- **Request Body**: `{ token: string, newPassword: string }`
- **Returns**: Success message

#### `POST/GET /api/auth/[...nextauth]`
NextAuth handler.
- **Providers**: Email/password, Google OAuth
- **Sessions**: JWT-based
- **Callbacks**: Custom session/JWT handling

---

### 10. Subscription (`/api/subscription`)
Plan management and billing.

#### `POST /api/subscription/create-checkout`
Create Stripe checkout session.
- **Auth**: Required
- **Request Body**:
  ```typescript
  {
    priceId: string // Stripe price ID
    billingPeriod: 'monthly' | 'annual'
  }
  ```
- **Process**:
  1. Create/retrieve Stripe customer
  2. Create checkout session
  3. Set success/cancel URLs
- **Returns**: `{ sessionId, url }`

#### `GET /api/subscription/portal`
Get billing portal URL.
- **Auth**: Required
- **Returns**: Stripe customer portal URL

#### `POST /api/subscription/cancel`
Cancel subscription.
- **Auth**: Required
- **Process**:
  1. Cancel in Stripe
  2. Update user subscription status
- **Returns**: Success message

#### `GET /api/subscription/usage`
Get current usage stats.
- **Auth**: Required
- **Returns**:
  ```typescript
  {
    plan: 'free' | 'pro' | 'business'
    usage: {
      invoices: { current: number, limit: number }
      quotes: { current: number, limit: number }
      expenses: { current: number, limit: number }
      clients: { current: number, limit: number }
    }
    periodEnd: Date
  }
  ```

#### `POST /api/subscription/webhook`
Stripe webhook handler.
- **Events**:
  - `checkout.session.completed`: Activate subscription
  - `customer.subscription.updated`: Update subscription
  - `customer.subscription.deleted`: Cancel subscription
  - `invoice.payment_succeeded`: Confirm payment
  - `invoice.payment_failed`: Handle failure
- **Verification**: Stripe signature validation
- **Returns**: 200 OK

---

### 11. Stripe (`/api/stripe`)
Additional Stripe integration endpoints.

#### `POST /api/stripe/create-payment-link`
Create payment link for invoice.
- **Auth**: Required
- **Feature Gate**: Pro plan required
- **Request Body**: `{ invoiceId: string }`
- **Returns**: Stripe payment link URL

#### `POST /api/stripe/webhook`
Stripe payment webhook.
- **Events**: Payment status updates
- **Process**: Update invoice payment status
- **Returns**: 200 OK

---

### 12. User (`/api/user`)
User profile management.

#### `GET /api/user/profile`
Get user profile.
- **Auth**: Required
- **Returns**: User object (sanitized, no password)

#### `PATCH /api/user/profile`
Update user profile.
- **Auth**: Required
- **Validation**: Profile fields schema
- **Request Body**:
  ```typescript
  {
    firstName?: string
    lastName?: string
    companyName?: string
    siret?: string
    address?: Address
    phone?: string
    logo?: string
    iban?: string
    // ... other profile fields
  }
  ```
- **Returns**: Updated user

#### `POST /api/user/upload-logo`
Upload company logo.
- **Auth**: Required
- **Upload**: Base64 image
- **Returns**: Logo URL

---

## Error Handling

All routes follow consistent error response format:

```typescript
// Success
{ success: true, data: {...} }

// Error
{ error: 'Error message', details?: {...} }
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (plan/feature restriction)
- `404` - Not Found
- `409` - Conflict (duplicate, constraint violation)
- `500` - Internal Server Error

---

## Subscription Gating

Routes check feature access using `checkFeatureAccess()`:

```typescript
const hasAccess = await checkFeatureAccess(userId, 'featureName')
if (!hasAccess) {
  return NextResponse.json(
    { error: 'Feature requires Pro plan' },
    { status: 403 }
  )
}
```

### Gated Features:
- `emailAutomation` - Pro/Business
- `reminders` - Pro/Business
- `ocr` - Pro/Business
- `advancedAnalytics` - Pro/Business
- `csvExport` - Pro/Business
- `apiAccess` - Business only
- `multiUser` - Business only

---

## Usage Tracking

Routes that create resources increment usage counters:

```typescript
await incrementInvoiceUsage(userId)
await incrementQuoteUsage(userId)
await incrementExpenseUsage(userId)
await incrementClientUsage(userId)
```

Usage resets monthly via cron job or on-demand check.

---

## Rate Limiting

Future implementation planned for:
- API request rate limits
- Email sending limits
- File upload size limits

---

## Testing

### Manual Testing:
Use Postman/Thunder Client with:
1. Obtain session token from NextAuth
2. Include in Cookie header
3. Test each endpoint

### Automated Testing:
- Jest + Supertest for integration tests
- Mock MongoDB with mongodb-memory-server
- Mock Stripe with stripe-mock

---

## Performance Optimization

- **Database Indexes**: All models have proper indexes
- **Pagination**: Large list endpoints support pagination (future)
- **Caching**: Template snapshots reduce database queries
- **Aggregation**: Analytics uses MongoDB aggregation pipeline

---

## Security Considerations

1. **Authentication**: All routes verify session
2. **Authorization**: Ownership checks on all resources
3. **Validation**: Zod schemas prevent injection
4. **Rate Limiting**: Planned implementation
5. **File Upload**: Size and type restrictions
6. **CORS**: Configured for same-origin only
7. **CSRF**: NextAuth CSRF protection
8. **SQL Injection**: N/A (NoSQL with Mongoose)
9. **Path Traversal**: PDF storage has path sanitization

---

## Future Enhancements

1. GraphQL API alongside REST
2. WebSocket for real-time updates
3. Bulk operations endpoints
4. Advanced filtering and search
5. Webhook subscriptions for events
6. API versioning (/api/v1, /api/v2)
7. OpenAPI/Swagger documentation
8. API key authentication for business plan
