# Validation Schemas Documentation

## Overview
Zod validation schemas for all API request/response data. Provides runtime type checking, automatic type inference, and detailed error messages for client and server-side validation.

## Technology
- **Library**: Zod 4.1.12
- **Pattern**: Schema-first validation
- **Integration**: React Hook Form (client) + API routes (server)
- **Type Safety**: Full TypeScript type inference

---

## Directory Structure

```
src/lib/validations/
├── invoices.ts           # Invoice validation schemas
├── quotes.ts             # Quote validation schemas
├── clients.ts            # Client validation schemas
├── expenses.ts           # Expense validation schemas
├── services.ts           # Service validation schemas
├── auth.ts               # Authentication schemas
├── email.ts              # Email sending schemas
├── contracts.ts          # Contract upload schemas
├── common.ts             # Shared/reusable schemas
└── index.ts              # Re-exports
```

---

## Common Schemas

### common.ts

```typescript
import { z } from 'zod'

/**
 * Address schema (shared across models)
 */
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  complement: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').default('France')
})

/**
 * Invoice/Quote item schema
 */
export const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be positive or zero'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
  amount: z.number().optional(),      // Auto-calculated
  taxAmount: z.number().optional(),   // Auto-calculated
  totalAmount: z.number().optional()  // Auto-calculated
}).refine(
  (data) => {
    // Auto-calculate if not provided
    if (!data.amount) data.amount = data.quantity * data.unitPrice
    if (!data.taxAmount) data.taxAmount = data.amount * (data.taxRate / 100)
    if (!data.totalAmount) data.totalAmount = data.amount + data.taxAmount
    return true
  },
  { message: 'Item calculation error' }
)

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address')

/**
 * Phone validation (French format)
 */
export const phoneSchema = z.string()
  .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Invalid French phone number')
  .optional()

/**
 * SIRET validation (French company ID - 14 digits)
 */
export const siretSchema = z.string()
  .regex(/^\d{14}$/, 'SIRET must be exactly 14 digits')
  .optional()

/**
 * IBAN validation
 */
export const ibanSchema = z.string()
  .regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, 'Invalid IBAN format')
  .optional()

/**
 * Date validation (must not be future)
 */
export const pastDateSchema = z.date().refine(
  (date) => date <= new Date(),
  { message: 'Date cannot be in the future' }
)

/**
 * Currency enum
 */
export const currencySchema = z.enum(['EUR', 'USD', 'GBP'])

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
})
```

---

## Invoice Schemas

### invoices.ts

```typescript
import { z } from 'zod'
import { itemSchema, addressSchema } from './common'

/**
 * Invoice status enum
 */
export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled'
])

/**
 * Create invoice schema
 */
export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  templateId: z.string().optional(),

  items: z.array(itemSchema).min(1, 'At least one item is required'),

  issueDate: z.date({
    required_error: 'Issue date is required',
    invalid_type_error: 'Invalid issue date'
  }),

  dueDate: z.date({
    required_error: 'Due date is required',
    invalid_type_error: 'Invalid due date'
  }),

  paymentTerms: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  legalMentions: z.string().max(2000, 'Legal mentions too long').optional()
}).refine(
  (data) => data.dueDate >= data.issueDate,
  {
    message: 'Due date must be on or after issue date',
    path: ['dueDate']
  }
)

/**
 * Update invoice schema (all fields optional except what can't change)
 */
export const updateInvoiceSchema = z.object({
  clientId: z.string().optional(),
  items: z.array(itemSchema).min(1).optional(),
  issueDate: z.date().optional(),
  dueDate: z.date().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().max(1000).optional(),
  legalMentions: z.string().max(2000).optional(),
  status: invoiceStatusSchema.optional()
}).refine(
  (data) => {
    if (data.issueDate && data.dueDate) {
      return data.dueDate >= data.issueDate
    }
    return true
  },
  { message: 'Due date must be on or after issue date' }
)

/**
 * Update invoice status schema
 */
export const updateInvoiceStatusSchema = z.object({
  status: invoiceStatusSchema
})

/**
 * Payment record schema
 */
export const paymentSchema = z.object({
  amount: z.number().positive('Payment amount must be positive'),
  date: z.date(),
  method: z.enum(['Card', 'Cash', 'Transfer', 'Check', 'Other']),
  reference: z.string().optional()
})

/**
 * Add payment schema
 */
export const addPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  payment: paymentSchema
})

/**
 * Invoice filters schema
 */
export const invoiceFiltersSchema = z.object({
  clientId: z.string().optional(),
  status: invoiceStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  isFinalized: z.boolean().optional()
})

// TypeScript type inference
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>
export type InvoiceFilters = z.infer<typeof invoiceFiltersSchema>
```

---

## Client Schemas

### clients.ts

```typescript
import { z } from 'zod'
import { addressSchema, emailSchema, phoneSchema, siretSchema } from './common'

/**
 * Client type enum
 */
export const clientTypeSchema = z.enum(['individual', 'business'])

/**
 * Company info schema (for business clients)
 */
export const companyInfoSchema = z.object({
  companyName: z.string().optional(),
  siret: siretSchema,
  tvaNumber: z.string().optional(),
  legalForm: z.string().optional(), // SARL, SAS, etc.
  rcsCity: z.string().optional()
})

/**
 * Create client schema
 */
export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema.optional(),
  phone: phoneSchema,
  address: addressSchema.optional(),
  type: clientTypeSchema,
  companyInfo: companyInfoSchema.optional(),
  paymentTerms: z.number().int().positive('Payment terms must be positive').optional(),
  defaultTaxRate: z.number().min(0).max(100).optional()
}).refine(
  (data) => {
    // If type is business, companyInfo should have companyName
    if (data.type === 'business' && data.companyInfo?.companyName) {
      return data.companyInfo.companyName.length > 0
    }
    return true
  },
  {
    message: 'Company name is required for business clients',
    path: ['companyInfo', 'companyName']
  }
)

/**
 * Update client schema
 */
export const updateClientSchema = createClientSchema.partial()

/**
 * Client filters
 */
export const clientFiltersSchema = z.object({
  type: clientTypeSchema.optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional() // Search by name or email
})

// Type inference
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ClientType = z.infer<typeof clientTypeSchema>
```

---

## Quote Schemas

### quotes.ts

```typescript
import { z } from 'zod'
import { itemSchema } from './common'

/**
 * Quote status enum
 */
export const quoteStatusSchema = z.enum([
  'draft',
  'sent',
  'accepted',
  'rejected',
  'expired',
  'converted'
])

/**
 * Create quote schema
 */
export const createQuoteSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  templateId: z.string().optional(),

  items: z.array(itemSchema).min(1, 'At least one item is required'),

  issueDate: z.date(),
  validUntil: z.date({
    required_error: 'Expiration date is required'
  }),

  notes: z.string().max(1000).optional(),
  termsAndConditions: z.string().max(2000).optional()
}).refine(
  (data) => data.validUntil > data.issueDate,
  {
    message: 'Expiration date must be after issue date',
    path: ['validUntil']
  }
)

/**
 * Update quote schema
 */
export const updateQuoteSchema = createQuoteSchema.partial()

/**
 * Sign quote schema (public endpoint)
 */
export const signQuoteSchema = z.object({
  signatureData: z.string().min(1, 'Signature is required'), // Base64 canvas image
  signerName: z.string().min(2, 'Name is required'),
  signerEmail: z.string().email('Valid email required')
})

/**
 * Convert quote to invoice schema
 */
export const convertQuoteSchema = z.object({
  quoteId: z.string().min(1)
})

// Type inference
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>
export type SignQuoteInput = z.infer<typeof signQuoteSchema>
export type QuoteStatus = z.infer<typeof quoteStatusSchema>
```

---

## Expense Schemas

### expenses.ts

```typescript
import { z } from 'zod'
import { pastDateSchema } from './common'

/**
 * Expense category enum
 */
export const expenseCategorySchema = z.enum([
  'Restaurant',
  'Transport',
  'Carburant',
  'Fournitures',
  'Logiciel',
  'Matériel',
  'Formation',
  'Téléphone',
  'Internet',
  'Loyer',
  'Assurance',
  'Autre'
])

/**
 * Payment method enum
 */
export const paymentMethodSchema = z.enum([
  'Card',
  'Cash',
  'Transfer',
  'Check',
  'Other'
])

/**
 * Create expense schema
 */
export const createExpenseSchema = z.object({
  vendor: z.string().min(2, 'Vendor name is required'),
  amount: z.number().positive('Amount must be positive'),
  category: expenseCategorySchema,
  date: pastDateSchema,
  paymentMethod: paymentMethodSchema,

  taxAmount: z.number().nonnegative().optional(),
  taxRate: z.number().min(0).max(100).optional(),

  receiptImage: z.string().optional(), // Base64
  notes: z.string().max(500).optional(),
  description: z.string().max(500).optional(),
  invoiceNumber: z.string().optional() // Link to invoice
})

/**
 * Update expense schema
 */
export const updateExpenseSchema = createExpenseSchema.partial()

/**
 * OCR scan request schema
 */
export const scanReceiptSchema = z.object({
  image: z.string().min(1, 'Image data is required') // Base64
})

/**
 * Expense filters
 */
export const expenseFiltersSchema = z.object({
  category: expenseCategorySchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  paymentMethod: paymentMethodSchema.optional()
})

// Type inference
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
```

---

## Service Schemas

### services.ts

```typescript
import { z } from 'zod'

/**
 * Create service schema
 */
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().max(500).optional(),
  unitPrice: z.number().nonnegative('Unit price must be positive'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
  category: z.string().optional()
})

/**
 * Update service schema
 */
export const updateServiceSchema = createServiceSchema.partial()

// Type inference
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
```

---

## Auth Schemas

### auth.ts

```typescript
import { z } from 'zod'
import { emailSchema } from './common'

/**
 * Register schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required')
})

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  companyName: z.string().optional(),
  legalForm: z.string().optional(),
  siret: z.string().regex(/^\d{14}$/).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional(),
  phone: z.string().optional(),
  logo: z.string().optional(),
  iban: z.string().optional(),
  rcsCity: z.string().optional(),
  capital: z.string().optional(),
  tvaNumber: z.string().optional(),
  currency: z.enum(['EUR', 'USD', 'GBP']).optional(),
  defaultTaxRate: z.number().min(0).max(100).optional()
})

// Type inference
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
```

---

## Email Schemas

### email.ts

```typescript
import { z } from 'zod'
import { emailSchema } from './common'

/**
 * Send invoice email schema
 */
export const sendInvoiceEmailSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  recipientEmail: emailSchema,
  subject: z.string().max(200).optional(),
  message: z.string().max(1000).optional()
})

/**
 * Send quote email schema
 */
export const sendQuoteEmailSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
  recipientEmail: emailSchema,
  subject: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
  includeSignatureLink: z.boolean().optional()
})

/**
 * Send reminder email schema
 */
export const sendReminderEmailSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  reminderType: z.enum(['friendly', 'firm', 'final']),
  customMessage: z.string().max(1000).optional()
})

// Type inference
export type SendInvoiceEmailInput = z.infer<typeof sendInvoiceEmailSchema>
export type SendQuoteEmailInput = z.infer<typeof sendQuoteEmailSchema>
export type SendReminderEmailInput = z.infer<typeof sendReminderEmailSchema>
```

---

## Contract Schemas

### contracts.ts

```typescript
import { z } from 'zod'

/**
 * Upload contract schema
 */
export const uploadContractSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  fileSize: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  fileData: z.string().min(1, 'File data is required') // Base64
})

/**
 * Delete contract schema
 */
export const deleteContractSchema = z.object({
  clientId: z.string().min(1),
  contractId: z.string().min(1)
})

// Type inference
export type UploadContractInput = z.infer<typeof uploadContractSchema>
export type DeleteContractInput = z.infer<typeof deleteContractSchema>
```

---

## Usage Examples

### Server-Side (API Routes)

```typescript
// src/app/api/invoices/route.ts
import { createInvoiceSchema } from '@/lib/validations/invoices'

export async function POST(req: Request) {
  const body = await req.json()

  // Validate request body
  const validation = createInvoiceSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.format() },
      { status: 400 }
    )
  }

  const data = validation.data

  // Create invoice with validated data
  const invoice = await Invoice.create({
    userId: session.user.id,
    ...data
  })

  return NextResponse.json(invoice)
}
```

### Client-Side (React Hook Form)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createInvoiceSchema, CreateInvoiceInput } from '@/lib/validations/invoices'

export const InvoiceForm: React.FC = () => {
  const form = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 20 }]
    }
  })

  const onSubmit = async (data: CreateInvoiceInput) => {
    try {
      await invoiceService.create(data)
      toast.success('Invoice created')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### Custom Hook

```typescript
import { useZodForm } from '@/hooks/useZodForm'

export const useZodForm = <T extends z.ZodType>(schema: T) => {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onBlur'
  })
}

// Usage
const form = useZodForm(createInvoiceSchema)
```

---

## Error Handling

### Formatted Errors

```typescript
const validation = createInvoiceSchema.safeParse(data)

if (!validation.success) {
  console.log(validation.error.format())
  /*
  {
    items: {
      _errors: ['At least one item is required']
    },
    dueDate: {
      _errors: ['Due date must be on or after issue date']
    }
  }
  */
}
```

### Field-Level Errors

```typescript
const validation = createInvoiceSchema.safeParse(data)

if (!validation.success) {
  const fieldErrors = validation.error.flatten().fieldErrors
  /*
  {
    items: ['At least one item is required'],
    dueDate: ['Due date must be on or after issue date']
  }
  */
}
```

---

## Advanced Patterns

### Conditional Validation

```typescript
const clientSchema = z.object({
  type: z.enum(['individual', 'business']),
  companyInfo: z.object({
    companyName: z.string()
  }).optional()
}).refine(
  (data) => {
    if (data.type === 'business') {
      return !!data.companyInfo?.companyName
    }
    return true
  },
  { message: 'Company name required for business clients' }
)
```

### Transform Data

```typescript
const invoiceSchema = z.object({
  issueDate: z.string().transform((str) => new Date(str)),
  amount: z.string().transform((str) => parseFloat(str))
})
```

### Union Types

```typescript
const paymentSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('card'),
    cardNumber: z.string(),
    cardExpiry: z.string()
  }),
  z.object({
    method: z.literal('transfer'),
    iban: z.string()
  })
])
```

---

## Best Practices

1. **Reuse Common Schemas** - Define once, use everywhere
2. **Type Inference** - Use `z.infer<typeof schema>` for TypeScript types
3. **Descriptive Errors** - Provide clear, user-friendly messages
4. **Server + Client** - Validate on both sides
5. **safeParse** - Use `safeParse()` instead of `parse()` for better error handling
6. **Refinements** - Use `.refine()` for complex validations
7. **Transforms** - Use `.transform()` for data conversion
8. **Documentation** - Add JSDoc comments to schemas

---

## Testing

```typescript
import { createInvoiceSchema } from '@/lib/validations/invoices'

describe('Invoice Validation', () => {
  it('should validate correct data', () => {
    const data = {
      clientId: '123',
      items: [{ description: 'Test', quantity: 1, unitPrice: 100, taxRate: 20 }],
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    const result = createInvoiceSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid due date', () => {
    const data = {
      clientId: '123',
      items: [{ description: 'Test', quantity: 1, unitPrice: 100, taxRate: 20 }],
      issueDate: new Date(),
      dueDate: new Date(Date.now() - 1000) // Past date
    }

    const result = createInvoiceSchema.safeParse(data)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('due date')
  })
})
```

---

## Future Enhancements

1. **i18n Error Messages** - Translate validation errors
2. **Custom Error Codes** - Machine-readable error codes
3. **Async Validation** - Database uniqueness checks
4. **Schema Versioning** - Handle API version changes
5. **OpenAPI Generation** - Auto-generate API docs from schemas
6. **GraphQL Integration** - Convert Zod to GraphQL types
7. **Custom Validators** - More complex business rules
8. **Error Recovery** - Suggest fixes for common errors
