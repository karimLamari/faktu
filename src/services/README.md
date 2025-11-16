# Client Services Documentation

## Overview
Client-side API service wrappers that provide a clean interface for making HTTP requests to the backend. These services handle request formatting, error handling, and type safety for all API interactions.

## Architecture Pattern

All services follow a consistent pattern:
1. **TypeScript interfaces** for request/response types
2. **Async functions** that wrap fetch calls
3. **Error handling** with detailed error messages
4. **Type safety** with full TypeScript support
5. **Reusable** across components

---

## Service Files

```
src/services/
├── invoiceService.ts       # Invoice CRUD and operations
├── clientService.ts        # Client management
├── quoteService.ts         # Quote operations
├── expenseService.ts       # Expense tracking
├── serviceService.ts       # Service catalog
├── authService.ts          # Authentication (future)
└── analyticsService.ts     # Analytics queries (future)
```

---

## Invoice Service

### invoiceService.ts

```typescript
import { Invoice, InvoiceFormData } from '@/types/invoice'

const API_BASE = '/api/invoices'

/**
 * Get all invoices for current user
 */
export const getAll = async (filters?: {
  clientId?: string
  status?: string
  startDate?: string
  endDate?: string
}): Promise<Invoice[]> => {
  const params = new URLSearchParams()
  if (filters?.clientId) params.append('clientId', filters.clientId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)

  const response = await fetch(`${API_BASE}?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch invoices')
  }

  return response.json()
}

/**
 * Get single invoice by ID
 */
export const getById = async (id: string): Promise<Invoice> => {
  const response = await fetch(`${API_BASE}/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch invoice')
  }

  return response.json()
}

/**
 * Create new invoice
 */
export const create = async (data: InvoiceFormData): Promise<Invoice> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create invoice')
  }

  return response.json()
}

/**
 * Update existing invoice
 */
export const update = async (id: string, data: Partial<InvoiceFormData>): Promise<Invoice> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update invoice')
  }

  return response.json()
}

/**
 * Delete invoice
 */
export const deleteInvoice = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete invoice')
  }

  return response.json()
}

/**
 * Finalize invoice (legal lock)
 */
export const finalize = async (id: string): Promise<Invoice> => {
  const response = await fetch(`${API_BASE}/${id}/finalize`, {
    method: 'POST'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to finalize invoice')
  }

  return response.json()
}

/**
 * Update invoice status
 */
export const updateStatus = async (
  id: string,
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
): Promise<Invoice> => {
  const response = await fetch(`${API_BASE}/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update status')
  }

  return response.json()
}

/**
 * Download invoice PDF
 */
export const downloadPDF = async (id: string, invoiceNumber: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}/pdf?download=true`)

  if (!response.ok) {
    throw new Error('Failed to download PDF')
  }

  // Create blob and trigger download
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${invoiceNumber}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * Send invoice via email
 */
export const sendEmail = async (
  id: string,
  data: {
    recipientEmail: string
    subject?: string
    message?: string
  }
): Promise<{ success: boolean; messageId: string }> => {
  const response = await fetch('/api/email/send-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId: id, ...data })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send email')
  }

  return response.json()
}

/**
 * Send payment reminder
 */
export const sendReminder = async (
  id: string,
  data: {
    reminderType: 'friendly' | 'firm' | 'final'
    customMessage?: string
  }
): Promise<{ success: boolean }> => {
  const response = await fetch('/api/email/send-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId: id, ...data })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send reminder')
  }

  return response.json()
}

/**
 * Verify PDF integrity
 */
export const verifyPDF = async (id: string): Promise<{ valid: boolean; message: string }> => {
  const response = await fetch(`${API_BASE}/${id}/verify`, {
    method: 'POST'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to verify PDF')
  }

  return response.json()
}

/**
 * Export invoices to CSV
 */
export const exportCSV = async (filters?: {
  startDate?: string
  endDate?: string
  status?: string
  clientId?: string
}): Promise<void> => {
  const params = new URLSearchParams()
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.clientId) params.append('clientId', filters.clientId)

  const response = await fetch(`${API_BASE}/export-csv?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to export CSV')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export const invoiceService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteInvoice,
  finalize,
  updateStatus,
  downloadPDF,
  sendEmail,
  sendReminder,
  verifyPDF,
  exportCSV
}
```

---

## Client Service

### clientService.ts

```typescript
import { Client, ClientFormData } from '@/types/client'

const API_BASE = '/api/clients'

/**
 * Get all clients
 */
export const getAll = async (filters?: {
  active?: boolean
}): Promise<Client[]> => {
  const params = new URLSearchParams()
  if (filters?.active !== undefined) params.append('active', String(filters.active))

  const response = await fetch(`${API_BASE}?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch clients')
  }

  return response.json()
}

/**
 * Get single client by ID
 */
export const getById = async (id: string): Promise<Client> => {
  const response = await fetch(`${API_BASE}/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch client')
  }

  return response.json()
}

/**
 * Create new client
 */
export const create = async (data: ClientFormData): Promise<Client> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create client')
  }

  return response.json()
}

/**
 * Update existing client
 */
export const update = async (id: string, data: Partial<ClientFormData>): Promise<Client> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update client')
  }

  return response.json()
}

/**
 * Delete client
 */
export const deleteClient = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete client')
  }

  return response.json()
}

/**
 * Upload contract for client
 */
export const uploadContract = async (
  clientId: string,
  file: File
): Promise<Client> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/${clientId}/contracts`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload contract')
  }

  return response.json()
}

/**
 * Delete contract
 */
export const deleteContract = async (
  clientId: string,
  contractId: string
): Promise<Client> => {
  const response = await fetch(`${API_BASE}/${clientId}/contracts/${contractId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete contract')
  }

  return response.json()
}

export const clientService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteClient,
  uploadContract,
  deleteContract
}
```

---

## Quote Service

### quoteService.ts

```typescript
import { Quote, QuoteFormData } from '@/types/quote'

const API_BASE = '/api/quotes'

export const getAll = async (filters?: {
  clientId?: string
  status?: string
}): Promise<Quote[]> => {
  const params = new URLSearchParams()
  if (filters?.clientId) params.append('clientId', filters.clientId)
  if (filters?.status) params.append('status', filters.status)

  const response = await fetch(`${API_BASE}?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch quotes')
  }

  return response.json()
}

export const getById = async (id: string): Promise<Quote> => {
  const response = await fetch(`${API_BASE}/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch quote')
  }

  return response.json()
}

export const create = async (data: QuoteFormData): Promise<Quote> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create quote')
  }

  return response.json()
}

export const update = async (id: string, data: Partial<QuoteFormData>): Promise<Quote> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update quote')
  }

  return response.json()
}

export const deleteQuote = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete quote')
  }

  return response.json()
}

/**
 * Convert quote to invoice
 */
export const convertToInvoice = async (id: string): Promise<Invoice> => {
  const response = await fetch(`${API_BASE}/${id}/convert`, {
    method: 'POST'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to convert quote')
  }

  return response.json()
}

/**
 * Generate electronic signature link
 */
export const generateSignatureLink = async (id: string): Promise<{ signatureUrl: string }> => {
  const response = await fetch(`${API_BASE}/${id}/generate-signature-link`, {
    method: 'POST'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate signature link')
  }

  return response.json()
}

/**
 * Download quote PDF
 */
export const downloadPDF = async (id: string, quoteNumber: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}/pdf?download=true`)

  if (!response.ok) {
    throw new Error('Failed to download PDF')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `quote-${quoteNumber}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * Send quote via email
 */
export const sendEmail = async (
  id: string,
  data: {
    recipientEmail: string
    subject?: string
    message?: string
  }
): Promise<{ success: boolean }> => {
  const response = await fetch('/api/email/send-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteId: id, ...data })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send email')
  }

  return response.json()
}

export const quoteService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteQuote,
  convertToInvoice,
  generateSignatureLink,
  downloadPDF,
  sendEmail
}
```

---

## Expense Service

### expenseService.ts

```typescript
import { Expense, ExpenseFormData } from '@/types/expense'

const API_BASE = '/api/expenses'

export const getAll = async (filters?: {
  startDate?: string
  endDate?: string
  category?: string
}): Promise<Expense[]> => {
  const params = new URLSearchParams()
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.category) params.append('category', filters.category)

  const response = await fetch(`${API_BASE}?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch expenses')
  }

  return response.json()
}

export const getById = async (id: string): Promise<Expense> => {
  const response = await fetch(`${API_BASE}/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch expense')
  }

  return response.json()
}

export const create = async (data: ExpenseFormData): Promise<Expense> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create expense')
  }

  return response.json()
}

export const update = async (id: string, data: Partial<ExpenseFormData>): Promise<Expense> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update expense')
  }

  return response.json()
}

export const deleteExpense = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete expense')
  }

  return response.json()
}

/**
 * Scan receipt with OCR
 */
export const scanReceipt = async (imageFile: File): Promise<{
  vendor: string
  amount: number
  date: string
  category?: string
}> => {
  // Convert file to base64
  const base64 = await fileToBase64(imageFile)

  const response = await fetch('/api/expenses/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to scan receipt')
  }

  return response.json()
}

// Helper function
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      resolve(base64.split(',')[1])
    }
    reader.onerror = reject
  })
}

export const expenseService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteExpense,
  scanReceipt
}
```

---

## Service Service (Catalog)

### serviceService.ts

```typescript
import { Service, ServiceFormData } from '@/types/service'

const API_BASE = '/api/services'

export const getAll = async (filters?: {
  active?: boolean
}): Promise<Service[]> => {
  const params = new URLSearchParams()
  if (filters?.active !== undefined) params.append('active', String(filters.active))

  const response = await fetch(`${API_BASE}?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch services')
  }

  return response.json()
}

export const getById = async (id: string): Promise<Service> => {
  const response = await fetch(`${API_BASE}/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch service')
  }

  return response.json()
}

export const create = async (data: ServiceFormData): Promise<Service> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create service')
  }

  return response.json()
}

export const update = async (id: string, data: Partial<ServiceFormData>): Promise<Service> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update service')
  }

  return response.json()
}

export const deleteService = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete service')
  }

  return response.json()
}

export const serviceService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteService
}
```

---

## Usage in Components

### With React Query

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceService } from '@/services/invoiceService'

export const InvoiceList: React.FC = () => {
  const queryClient = useQueryClient()

  // Fetch invoices
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceService.getAll()
  })

  // Create invoice mutation
  const createMutation = useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: invoiceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  if (isLoading) return <Skeleton />
  if (error) return <Alert variant="destructive">{error.message}</Alert>

  return (
    <div>
      {invoices?.map(invoice => (
        <InvoiceCard
          key={invoice._id}
          invoice={invoice}
          onDelete={() => deleteMutation.mutate(invoice._id)}
        />
      ))}
    </div>
  )
}
```

---

### Direct Usage

```tsx
const handleCreateInvoice = async (data: InvoiceFormData) => {
  try {
    const invoice = await invoiceService.create(data)
    toast.success('Invoice created')
    router.push(`/dashboard/invoices/${invoice._id}`)
  } catch (error) {
    toast.error(error.message)
  }
}
```

---

## Error Handling Patterns

### Centralized Error Handler

```typescript
// utils/handleApiError.ts
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

// Usage
try {
  await invoiceService.create(data)
} catch (error) {
  const message = handleApiError(error)
  toast.error(message)
}
```

---

## Type Safety

### Request/Response Types

```typescript
// types/invoice.ts
export interface InvoiceFormData {
  clientId: string
  templateId?: string
  items: InvoiceItem[]
  issueDate: Date
  dueDate: Date
  paymentTerms?: string
  notes?: string
  legalMentions?: string
}

export interface Invoice extends InvoiceFormData {
  _id: string
  userId: string
  invoiceNumber: string
  status: InvoiceStatus
  subtotal: number
  taxTotal: number
  total: number
  isFinalized: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## Best Practices

1. **Always handle errors** - Use try/catch or React Query error handling
2. **Type everything** - Use TypeScript interfaces for all data
3. **Invalidate queries** - After mutations, invalidate relevant queries
4. **Show user feedback** - Toast notifications for success/error
5. **Loading states** - Show skeletons or spinners during requests
6. **Optimistic updates** - Update UI before server response (optional)
7. **Retry logic** - React Query retries failed requests automatically
8. **Caching** - React Query caches responses to reduce API calls

---

## Testing Services

### Unit Tests

```typescript
import { invoiceService } from '@/services/invoiceService'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/invoices', (req, res, ctx) => {
    return res(ctx.json([mockInvoice]))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('invoiceService', () => {
  it('should fetch all invoices', async () => {
    const invoices = await invoiceService.getAll()
    expect(invoices).toHaveLength(1)
    expect(invoices[0].invoiceNumber).toBe('FAC2025-001')
  })

  it('should handle errors', async () => {
    server.use(
      rest.get('/api/invoices', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }))
      })
    )

    await expect(invoiceService.getAll()).rejects.toThrow('Server error')
  })
})
```

---

## Future Enhancements

1. **Request interceptors** - Add auth tokens automatically
2. **Response interceptors** - Handle 401 globally
3. **Retry logic** - Custom retry for specific errors
4. **Request cancellation** - AbortController for cleanup
5. **Batch requests** - Combine multiple requests
6. **GraphQL support** - Alternative to REST
7. **WebSocket** - Real-time updates
8. **Offline support** - Queue requests when offline
9. **Request deduplication** - Prevent duplicate requests
10. **Analytics tracking** - Log API usage
