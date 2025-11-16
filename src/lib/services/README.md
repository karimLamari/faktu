# Server Services Documentation

## Overview
Server-side business logic services that handle core application functionality. These services are used by API routes and contain the actual implementation of features like PDF generation, email sending, invoice numbering, and more.

## Directory Structure

```
src/lib/services/
├── pdf-generator.tsx         # PDF generation with React-PDF
├── email-service.ts          # Email sending via Resend
├── invoice-numbering.ts      # Auto-increment invoice numbers
├── quote-numbering.ts        # Auto-increment quote numbers
├── audit-logger.ts           # Audit trail logging
├── csv-export.ts             # CSV generation
└── ocr-service.ts            # OCR receipt scanning (future)
```

---

## PDF Generator Service

### pdf-generator.tsx

```typescript
import { pdf } from '@react-pdf/renderer'
import { renderTemplate } from '@/lib/invoice-templates/core/router'
import { renderQuoteTemplate } from '@/lib/quote-templates/core/router'
import type { Invoice, Client, User, InvoiceTemplate, Quote, QuoteTemplate } from '@/types'

/**
 * Generate invoice PDF as buffer
 */
export const generateInvoicePdf = async (
  invoice: Invoice,
  client: Client,
  user: User,
  template?: InvoiceTemplate
): Promise<Buffer> => {
  try {
    // Render React-PDF document
    const pdfDocument = renderTemplate(invoice, client, user, template)

    // Generate PDF buffer
    const pdfBuffer = await pdf(pdfDocument).toBuffer()

    return pdfBuffer
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Failed to generate invoice PDF')
  }
}

/**
 * Generate quote PDF as buffer
 */
export const generateQuotePdf = async (
  quote: Quote,
  client: Client,
  user: User,
  template?: QuoteTemplate
): Promise<Buffer> => {
  try {
    const pdfDocument = renderQuoteTemplate(quote, client, user, template)
    const pdfBuffer = await pdf(pdfDocument).toBuffer()

    return pdfBuffer
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Failed to generate quote PDF')
  }
}

/**
 * Generate PDF as readable stream (for direct response)
 */
export const generateInvoicePdfStream = async (
  invoice: Invoice,
  client: Client,
  user: User,
  template?: InvoiceTemplate
): Promise<NodeJS.ReadableStream> => {
  const pdfDocument = renderTemplate(invoice, client, user, template)
  return pdf(pdfDocument).toNodeStream()
}

/**
 * Generate preview PDF (lower quality, faster)
 */
export const generatePreviewPdf = async (
  invoice: Invoice,
  client: Client,
  user: User,
  template?: InvoiceTemplate
): Promise<Buffer> => {
  // Same as regular PDF for now
  // Future: could reduce image quality, remove fonts, etc.
  return generateInvoicePdf(invoice, client, user, template)
}
```

**Usage in API Route**:
```typescript
// src/app/api/invoices/[id]/pdf/route.ts
import { generateInvoicePdf } from '@/lib/services/pdf-generator'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const invoice = await Invoice.findById(params.id)
  const client = await Client.findById(invoice.clientId)
  const user = await User.findById(invoice.userId)
  const template = invoice.templateSnapshot

  const pdfBuffer = await generateInvoicePdf(invoice, client, user, template)

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    }
  })
}
```

---

## Email Service

### email-service.ts

```typescript
import { Resend } from 'resend'
import { generateInvoiceEmailHtml } from '@/lib/email-templates/invoice-email'
import { generateQuoteEmailHtml } from '@/lib/email-templates/quote-email'
import { generateReminderEmailHtml } from '@/lib/email-templates/reminder-email'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer
  }>
  from?: string
  replyTo?: string
}

/**
 * Send email with retry logic
 */
export const sendEmail = async (options: SendEmailOptions): Promise<{ id: string }> => {
  const {
    to,
    subject,
    html,
    text,
    attachments,
    from = process.env.RESEND_FROM_EMAIL || 'invoices@yourdomain.com',
    replyTo
  } = options

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      attachments,
      replyTo
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return { id: result.data!.id }
  } catch (error) {
    console.error('Email sending error:', error)
    throw new Error('Failed to send email')
  }
}

/**
 * Send invoice email with PDF attachment
 */
export const sendInvoiceEmail = async (
  invoice: Invoice,
  client: Client,
  user: User,
  pdfBuffer: Buffer,
  customMessage?: string
): Promise<{ id: string }> => {
  const html = generateInvoiceEmailHtml({
    clientName: client.name,
    invoiceNumber: invoice.invoiceNumber,
    total: invoice.total,
    dueDate: invoice.dueDate,
    customMessage,
    companyName: user.companyName || `${user.firstName} ${user.lastName}`
  })

  return sendEmail({
    to: client.email!,
    subject: `Invoice ${invoice.invoiceNumber} from ${user.companyName}`,
    html,
    attachments: [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer
      }
    ],
    from: user.email,
    replyTo: user.email
  })
}

/**
 * Send quote email with PDF attachment
 */
export const sendQuoteEmail = async (
  quote: Quote,
  client: Client,
  user: User,
  pdfBuffer: Buffer,
  customMessage?: string,
  signatureLink?: string
): Promise<{ id: string }> => {
  const html = generateQuoteEmailHtml({
    clientName: client.name,
    quoteNumber: quote.quoteNumber,
    total: quote.total,
    validUntil: quote.validUntil,
    customMessage,
    signatureLink,
    companyName: user.companyName || `${user.firstName} ${user.lastName}`
  })

  return sendEmail({
    to: client.email!,
    subject: `Quote ${quote.quoteNumber} from ${user.companyName}`,
    html,
    attachments: [
      {
        filename: `quote-${quote.quoteNumber}.pdf`,
        content: pdfBuffer
      }
    ],
    from: user.email,
    replyTo: user.email
  })
}

/**
 * Send payment reminder email
 */
export const sendReminderEmail = async (
  invoice: Invoice,
  client: Client,
  user: User,
  reminderType: 'friendly' | 'firm' | 'final',
  customMessage?: string
): Promise<{ id: string }> => {
  const daysOverdue = Math.floor(
    (Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const html = generateReminderEmailHtml({
    clientName: client.name,
    invoiceNumber: invoice.invoiceNumber,
    total: invoice.total,
    dueDate: invoice.dueDate,
    daysOverdue,
    reminderType,
    customMessage,
    companyName: user.companyName || `${user.firstName} ${user.lastName}`
  })

  const subjects = {
    friendly: `Friendly reminder: Invoice ${invoice.invoiceNumber}`,
    firm: `Payment reminder: Invoice ${invoice.invoiceNumber} is overdue`,
    final: `FINAL NOTICE: Invoice ${invoice.invoiceNumber} - Immediate action required`
  }

  return sendEmail({
    to: client.email!,
    subject: subjects[reminderType],
    html,
    from: user.email,
    replyTo: user.email
  })
}

/**
 * Send test email (for configuration validation)
 */
export const sendTestEmail = async (to: string): Promise<{ id: string }> => {
  return sendEmail({
    to,
    subject: 'Test Email - Invoice App',
    html: '<h1>Test Email</h1><p>If you received this, your email configuration is working correctly.</p>',
    text: 'Test Email - If you received this, your email configuration is working correctly.'
  })
}
```

**Usage**:
```typescript
// API route: POST /api/email/send-invoice
import { sendInvoiceEmail } from '@/lib/services/email-service'
import { generateInvoicePdf } from '@/lib/services/pdf-generator'

export async function POST(req: Request) {
  const { invoiceId, customMessage } = await req.json()

  const invoice = await Invoice.findById(invoiceId)
  const client = await Client.findById(invoice.clientId)
  const user = await User.findById(invoice.userId)
  const template = invoice.templateSnapshot

  // Generate PDF
  const pdfBuffer = await generateInvoicePdf(invoice, client, user, template)

  // Send email
  const result = await sendInvoiceEmail(invoice, client, user, pdfBuffer, customMessage)

  // Update invoice
  invoice.sentAt = new Date()
  invoice.status = 'sent'
  await invoice.save()

  return NextResponse.json({ success: true, messageId: result.id })
}
```

---

## Invoice Numbering Service

### invoice-numbering.ts

```typescript
import { User } from '@/models/User'

/**
 * Generate next invoice number for user
 * Format: FAC{YEAR}-{PREFIX}-{NUMBER}
 * Example: FAC2025-ABC-0001
 */
export const generateInvoiceNumber = async (userId: string): Promise<string> => {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')

  const currentYear = new Date().getFullYear()

  // Check if year has changed (reset numbering)
  if (user.invoiceCurrentYear !== currentYear) {
    user.invoiceCurrentYear = currentYear
    user.invoiceNextNumber = 1
  }

  const prefix = user.invoicePrefix || 'FAC'
  const number = user.invoiceNextNumber
  const paddedNumber = String(number).padStart(4, '0')

  const invoiceNumber = `${prefix}${currentYear}-${user.companyName?.slice(0, 3).toUpperCase() || 'INV'}-${paddedNumber}`

  // Increment for next invoice
  user.invoiceNextNumber = number + 1
  await user.save()

  return invoiceNumber
}

/**
 * Reset invoice numbering for new year (manual trigger)
 */
export const resetInvoiceNumbering = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')

  const currentYear = new Date().getFullYear()
  user.invoiceCurrentYear = currentYear
  user.invoiceNextNumber = 1

  await user.save()
}

/**
 * Get next invoice number preview (without incrementing)
 */
export const getNextInvoiceNumberPreview = async (userId: string): Promise<string> => {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')

  const currentYear = new Date().getFullYear()
  const year = user.invoiceCurrentYear === currentYear ? currentYear : currentYear
  const number = user.invoiceCurrentYear === currentYear ? user.invoiceNextNumber : 1
  const prefix = user.invoicePrefix || 'FAC'
  const paddedNumber = String(number).padStart(4, '0')

  return `${prefix}${year}-${user.companyName?.slice(0, 3).toUpperCase() || 'INV'}-${paddedNumber}`
}

/**
 * Update invoice prefix
 */
export const updateInvoicePrefix = async (userId: string, newPrefix: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')

  user.invoicePrefix = newPrefix.toUpperCase()
  await user.save()
}
```

**Usage**:
```typescript
// When creating invoice
import { generateInvoiceNumber } from '@/lib/services/invoice-numbering'

const invoiceNumber = await generateInvoiceNumber(userId)

const invoice = await Invoice.create({
  userId,
  invoiceNumber,
  ...invoiceData
})
```

---

## Quote Numbering Service

### quote-numbering.ts

```typescript
import { User } from '@/models/User'

/**
 * Generate next quote number
 * Format: DEV{YEAR}-{PREFIX}-{NUMBER}
 * Example: DEV2025-ABC-0001
 */
export const generateQuoteNumber = async (userId: string): Promise<string> => {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')

  const currentYear = new Date().getFullYear()

  if (user.quoteCurrentYear !== currentYear) {
    user.quoteCurrentYear = currentYear
    user.quoteNextNumber = 1
  }

  const prefix = user.quotePrefix || 'DEV'
  const number = user.quoteNextNumber
  const paddedNumber = String(number).padStart(4, '0')

  const quoteNumber = `${prefix}${currentYear}-${user.companyName?.slice(0, 3).toUpperCase() || 'QTE'}-${paddedNumber}`

  user.quoteNextNumber = number + 1
  await user.save()

  return quoteNumber
}

export const resetQuoteNumbering = async (userId: string): Promise<void> => {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')

  const currentYear = new Date().getFullYear()
  user.quoteCurrentYear = currentYear
  user.quoteNextNumber = 1

  await user.save()
}

export const getNextQuoteNumberPreview = async (userId: string): Promise<string> => {
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')

  const currentYear = new Date().getFullYear()
  const year = user.quoteCurrentYear === currentYear ? currentYear : currentYear
  const number = user.quoteCurrentYear === currentYear ? user.quoteNextNumber : 1
  const prefix = user.quotePrefix || 'DEV'
  const paddedNumber = String(number).padStart(4, '0')

  return `${prefix}${year}-${user.companyName?.slice(0, 3).toUpperCase() || 'QTE'}-${paddedNumber}`
}
```

---

## Audit Logger Service

### audit-logger.ts

```typescript
import { InvoiceAudit } from '@/models/InvoiceAudit'
import type { Invoice } from '@/types'

type AuditAction = 'created' | 'updated' | 'finalized' | 'sent' | 'paid' | 'deleted' | 'status_changed'

interface LogAuditOptions {
  invoiceId: string
  userId: string
  action: AuditAction
  performedBy: string
  beforeData?: Partial<Invoice>
  afterData?: Partial<Invoice>
  ipAddress?: string
  details?: Record<string, any>
}

/**
 * Log invoice action to audit trail
 */
export const logAudit = async (options: LogAuditOptions): Promise<void> => {
  try {
    await InvoiceAudit.create({
      invoiceId: options.invoiceId,
      userId: options.userId,
      action: options.action,
      performedBy: options.performedBy,
      timestamp: new Date(),
      beforeData: options.beforeData,
      afterData: options.afterData,
      ipAddress: options.ipAddress,
      details: options.details
    })
  } catch (error) {
    console.error('Audit logging error:', error)
    // Don't throw - audit failure shouldn't break operations
  }
}

/**
 * Get audit trail for invoice
 */
export const getAuditTrail = async (invoiceId: string) => {
  return InvoiceAudit.find({ invoiceId })
    .sort({ timestamp: -1 })
    .populate('performedBy', 'firstName lastName email')
    .lean()
}

/**
 * Get audit trail for user (all invoices)
 */
export const getUserAuditTrail = async (userId: string, limit: number = 100) => {
  return InvoiceAudit.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('performedBy', 'firstName lastName email')
    .populate('invoiceId', 'invoiceNumber')
    .lean()
}

/**
 * Helper: Log invoice creation
 */
export const logInvoiceCreated = async (
  invoice: Invoice,
  userId: string,
  ipAddress?: string
) => {
  await logAudit({
    invoiceId: invoice._id,
    userId,
    action: 'created',
    performedBy: userId,
    afterData: invoice,
    ipAddress
  })
}

/**
 * Helper: Log invoice finalization
 */
export const logInvoiceFinalized = async (
  invoice: Invoice,
  userId: string,
  ipAddress?: string
) => {
  await logAudit({
    invoiceId: invoice._id,
    userId,
    action: 'finalized',
    performedBy: userId,
    afterData: {
      isFinalized: invoice.isFinalized,
      finalizedAt: invoice.finalizedAt,
      pdfPath: invoice.pdfPath,
      pdfHash: invoice.pdfHash
    },
    ipAddress
  })
}

/**
 * Helper: Log status change
 */
export const logStatusChanged = async (
  invoiceId: string,
  userId: string,
  oldStatus: string,
  newStatus: string,
  ipAddress?: string
) => {
  await logAudit({
    invoiceId,
    userId,
    action: 'status_changed',
    performedBy: userId,
    beforeData: { status: oldStatus },
    afterData: { status: newStatus },
    ipAddress
  })
}
```

**Usage**:
```typescript
// After finalizing invoice
import { logInvoiceFinalized } from '@/lib/services/audit-logger'

await invoice.save()
await logInvoiceFinalized(invoice, userId, req.ip)
```

---

## CSV Export Service

### csv-export.ts

```typescript
import { Invoice } from '@/models/Invoice'
import { stringify } from 'csv-stringify/sync'

interface ExportFilters {
  userId: string
  startDate?: Date
  endDate?: Date
  status?: string
  clientId?: string
}

/**
 * Export invoices to CSV
 */
export const exportInvoicesToCSV = async (filters: ExportFilters): Promise<string> => {
  const query: any = { userId: filters.userId }

  if (filters.startDate || filters.endDate) {
    query.issueDate = {}
    if (filters.startDate) query.issueDate.$gte = filters.startDate
    if (filters.endDate) query.issueDate.$lte = filters.endDate
  }

  if (filters.status) {
    query.status = filters.status
  }

  if (filters.clientId) {
    query.clientId = filters.clientId
  }

  const invoices = await Invoice.find(query)
    .populate('clientId', 'name email')
    .sort({ issueDate: -1 })
    .lean()

  // Map to CSV rows
  const rows = invoices.map(invoice => ({
    'Invoice Number': invoice.invoiceNumber,
    'Client Name': invoice.clientId?.name || '',
    'Client Email': invoice.clientId?.email || '',
    'Issue Date': invoice.issueDate.toISOString().split('T')[0],
    'Due Date': invoice.dueDate.toISOString().split('T')[0],
    'Status': invoice.status,
    'Subtotal (HT)': invoice.subtotal.toFixed(2),
    'Tax Total': invoice.taxTotal.toFixed(2),
    'Total (TTC)': invoice.total.toFixed(2),
    'Amount Paid': invoice.amountPaid?.toFixed(2) || '0.00',
    'Balance': (invoice.total - (invoice.amountPaid || 0)).toFixed(2),
    'Payment Terms': invoice.paymentTerms || '',
    'Is Finalized': invoice.isFinalized ? 'Yes' : 'No',
    'Sent At': invoice.sentAt ? invoice.sentAt.toISOString().split('T')[0] : '',
    'Paid At': invoice.paidAt ? invoice.paidAt.toISOString().split('T')[0] : ''
  }))

  // Convert to CSV string
  const csv = stringify(rows, {
    header: true,
    columns: Object.keys(rows[0] || {})
  })

  return csv
}

/**
 * Export expenses to CSV
 */
export const exportExpensesToCSV = async (filters: ExportFilters): Promise<string> => {
  const query: any = { userId: filters.userId }

  if (filters.startDate || filters.endDate) {
    query.date = {}
    if (filters.startDate) query.date.$gte = filters.startDate
    if (filters.endDate) query.date.$lte = filters.endDate
  }

  const expenses = await Expense.find(query)
    .sort({ date: -1 })
    .lean()

  const rows = expenses.map(expense => ({
    'Date': expense.date.toISOString().split('T')[0],
    'Vendor': expense.vendor,
    'Category': expense.category,
    'Amount': expense.amount.toFixed(2),
    'Tax Amount': expense.taxAmount?.toFixed(2) || '0.00',
    'Payment Method': expense.paymentMethod,
    'Invoice Number': expense.invoiceNumber || '',
    'Notes': expense.notes || ''
  }))

  const csv = stringify(rows, { header: true })
  return csv
}
```

**Usage**:
```typescript
// API route: GET /api/invoices/export-csv
import { exportInvoicesToCSV } from '@/lib/services/csv-export'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = session.user.id

  const csv = await exportInvoicesToCSV({
    userId,
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    status: searchParams.get('status') || undefined
  })

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="invoices-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
```

---

## PDF Storage Service

### File: `src/lib/invoices/storage.ts` (referenced in earlier docs)

Key functions:
- `generateInvoicePdfPath(userId, year, invoiceNumber)` - Path generation
- `saveInvoicePdfToServer(pdfBuffer, path)` - Save with directory creation
- `readInvoicePdfFromServer(path)` - Read from disk
- `calculatePdfHash(pdfBuffer)` - SHA-256 hash
- `verifyPdfIntegrity(path, expectedHash)` - Integrity check
- `deleteInvoicePdfFromServer(path)` - File deletion
- `isSecurePath(path)` - Path traversal protection

---

## Common Patterns

### Error Handling
All services should throw descriptive errors:
```typescript
try {
  const result = await someOperation()
  return result
} catch (error) {
  console.error('Service error:', error)
  throw new Error('User-friendly error message')
}
```

### Logging
Use console.error for errors, console.log for important events:
```typescript
console.log(`Invoice ${invoiceNumber} finalized by user ${userId}`)
console.error('PDF generation failed:', error)
```

### Async/Await
All services use async/await for consistency:
```typescript
export const myService = async (param: string): Promise<Result> => {
  const data = await fetchData(param)
  const processed = await processData(data)
  return processed
}
```

---

## Testing Services

### Unit Tests
```typescript
import { generateInvoiceNumber } from '@/lib/services/invoice-numbering'
import { User } from '@/models/User'

describe('Invoice Numbering', () => {
  it('should generate correct invoice number', async () => {
    const user = await User.create({
      email: 'test@example.com',
      companyName: 'Acme Inc',
      invoicePrefix: 'FAC',
      invoiceNextNumber: 1,
      invoiceCurrentYear: 2025
    })

    const invoiceNumber = await generateInvoiceNumber(user._id)
    expect(invoiceNumber).toBe('FAC2025-ACM-0001')
  })

  it('should increment number after generation', async () => {
    const user = await User.create({...})
    await generateInvoiceNumber(user._id)

    const updatedUser = await User.findById(user._id)
    expect(updatedUser.invoiceNextNumber).toBe(2)
  })
})
```

---

## Best Practices

1. **Single Responsibility** - Each service handles one domain
2. **Error Handling** - Always catch and throw descriptive errors
3. **Type Safety** - Use TypeScript for all parameters and returns
4. **Async Operations** - Use async/await consistently
5. **Logging** - Log important operations and errors
6. **Testing** - Write unit tests for all services
7. **Documentation** - JSDoc comments for complex functions
8. **Separation of Concerns** - Keep business logic out of routes

---

## Future Enhancements

1. **OCR Service** - Complete Tesseract.js integration
2. **Webhook Service** - Send webhooks for events
3. **Notification Service** - Centralized notification system
4. **Backup Service** - Automated backups of PDFs and data
5. **Migration Service** - Database migration helpers
6. **Import Service** - Import from Excel/CSV
7. **Batch Processing** - Queue-based batch operations
8. **Caching Layer** - Redis caching for frequent queries
9. **Search Service** - Elasticsearch integration
10. **Report Generation** - Complex report PDFs
