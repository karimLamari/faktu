# Components Documentation

## Overview
React components organized by feature domain. Built with React 19, TypeScript, and Tailwind CSS. Uses Shadcn UI component library for consistent design system.

## Technology Stack
- **Framework**: React 19.0.0
- **Styling**: Tailwind CSS 3.4 + CSS Variables
- **UI Library**: Shadcn UI (Radix UI primitives)
- **Forms**: React Hook Form 7.65 + Zod validation
- **Icons**: Lucide React 0.546
- **Charts**: Recharts 3.4
- **State**: Zustand 5.0.8 + React Context

---

## Directory Structure

```
src/components/
├── invoices/           # Invoice management components
├── quotes/             # Quote management components
├── clients/            # Client management components
├── expenses/           # Expense tracking components
├── services/           # Service catalog components
├── analytics/          # Analytics and charts
├── dashboard/          # Dashboard layout and widgets
├── settings/           # Settings and configuration
├── profile/            # User profile components
├── forms/              # Reusable form components
├── ui/                 # Shadcn UI primitives
└── providers/          # Context providers

```

---

## Invoice Components (`/invoices`)

### InvoiceFormModal.tsx
**Purpose**: Create and edit invoices with full validation.

**Features**:
- React Hook Form with Zod validation
- Client selection dropdown
- Dynamic line items (add/remove)
- Auto-calculation of totals
- Template selection
- Live preview
- Date pickers (issue date, due date)
- Payment terms input
- Notes and legal mentions
- Draft save vs finalize

**Props**:
```typescript
interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  invoice?: Invoice          // For editing
  clientId?: string          // Pre-select client
  onSuccess?: (invoice: Invoice) => void
}
```

**State Management**:
- Form state via `useZodForm`
- Items array with `useFieldArray`
- Template preview via `useState`

**Validation**:
- Client required
- At least 1 item
- Positive quantities and prices
- Due date >= issue date
- Valid tax rates (0-100)

**Usage**:
```tsx
<InvoiceFormModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSuccess={(invoice) => {
    toast.success('Invoice created')
    router.push(`/dashboard/invoices/${invoice._id}`)
  }}
/>
```

---

### InvoiceList.tsx
**Purpose**: Paginated list of invoices with filtering.

**Features**:
- Server-side filtering
- Status badges (draft, sent, paid, overdue)
- Quick actions (view, edit, delete, send email)
- Bulk selection (future)
- Infinite scroll or pagination
- Empty state handling
- Loading skeletons

**Props**:
```typescript
interface InvoiceListProps {
  clientId?: string          // Filter by client
  status?: InvoiceStatus     // Filter by status
  limit?: number             // Items per page
}
```

**Data Fetching**:
```typescript
const { data: invoices, isLoading, error } = useQuery({
  queryKey: ['invoices', filters],
  queryFn: () => invoiceService.getAll(filters)
})
```

**Filtering**:
- Search by invoice number
- Filter by status
- Filter by client
- Date range picker
- Sort by date, amount, status

---

### InvoiceCard.tsx
**Purpose**: Individual invoice card display.

**Features**:
- Invoice number and client name
- Total amount with currency
- Status badge with color coding
- Due date with overdue indicator
- Quick actions dropdown
- Finalization lock indicator

**Props**:
```typescript
interface InvoiceCardProps {
  invoice: Invoice
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  compact?: boolean          // Smaller variant
}
```

**Status Colors**:
```typescript
const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500'
}
```

---

### InvoicePreview.tsx
**Purpose**: Live PDF preview before finalizing.

**Features**:
- Real-time rendering with React-PDF
- Template selection dropdown
- Color customization
- Zoom controls
- Download preview button
- Side-by-side edit mode

**Props**:
```typescript
interface InvoicePreviewProps {
  invoice: Invoice
  client: Client
  user: User
  template?: InvoiceTemplate
  editable?: boolean
}
```

**Rendering**:
```tsx
import { PDFViewer } from '@react-pdf/renderer'
import { renderTemplate } from '@/lib/invoice-templates/core/router'

<PDFViewer width="100%" height="800px">
  {renderTemplate(invoice, client, user, template)}
</PDFViewer>
```

---

### InvoiceFilters.tsx
**Purpose**: Advanced filtering sidebar/modal.

**Features**:
- Status multi-select
- Client autocomplete
- Date range picker
- Amount range slider
- Payment status
- Template filter
- Clear all filters button

**Props**:
```typescript
interface InvoiceFiltersProps {
  filters: InvoiceFilters
  onChange: (filters: InvoiceFilters) => void
  onReset: () => void
}
```

---

### FinalizeInvoiceDialog.tsx
**Purpose**: Confirmation dialog before finalizing.

**Features**:
- Profile completion check
- Warning about immutability
- Preview of invoice
- Generate PDF checkbox
- Send email checkbox
- Confirm button with loading state

**Props**:
```typescript
interface FinalizeInvoiceDialogProps {
  invoice: Invoice
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}
```

**Validations**:
```typescript
const canFinalize = useMemo(() => {
  return (
    user.isProfileComplete() &&
    invoice.items.length > 0 &&
    invoice.clientId &&
    !invoice.isFinalized
  )
}, [user, invoice])
```

---

### EmailModals.tsx
**Purpose**: Send invoice/quote via email.

**Components**:
- `SendInvoiceEmailModal`
- `SendQuoteEmailModal`
- `SendReminderModal`

**Features**:
- Recipient email (pre-filled from client)
- Subject line customization
- Message body editor
- PDF attachment checkbox
- Preview email button
- Send with confirmation

**Props**:
```typescript
interface SendInvoiceEmailModalProps {
  invoice: Invoice
  client: Client
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}
```

**Email Sending**:
```typescript
const sendEmail = async (data) => {
  await invoiceService.sendEmail(invoice._id, {
    recipientEmail: data.email,
    subject: data.subject,
    message: data.message
  })
  toast.success('Invoice sent successfully')
}
```

---

### InvoiceStatusBadge.tsx
**Purpose**: Visual status indicator.

**Features**:
- Color-coded badges
- Icons per status
- Hover tooltip with details
- Overdue calculation

**Props**:
```typescript
interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  dueDate?: Date
  showLabel?: boolean
}
```

---

## Client Components (`/clients`)

### ClientForm.tsx
**Purpose**: Create/edit client information.

**Features**:
- Personal/company toggle
- Address autocomplete
- SIRET validation (French)
- Email and phone validation
- Payment terms configuration
- Contract upload section

**Props**:
```typescript
interface ClientFormProps {
  client?: Client
  onSubmit: (data: ClientFormData) => Promise<void>
  onCancel: () => void
}
```

**Conditional Fields**:
```tsx
{type === 'business' && (
  <>
    <Input name="companyInfo.siret" label="SIRET" maxLength={14} />
    <Input name="companyInfo.tvaNumber" label="TVA Number" />
  </>
)}
```

---

### ClientList.tsx
**Purpose**: List all clients with search and filters.

**Features**:
- Search by name/email
- Filter by type (individual/business)
- Active/inactive toggle
- Client cards with stats
- Quick actions (edit, delete, view invoices)

**Props**:
```typescript
interface ClientListProps {
  searchQuery?: string
  filterType?: 'individual' | 'business' | 'all'
  onClientSelect?: (client: Client) => void
}
```

---

### ClientCard.tsx
**Purpose**: Client card with stats.

**Features**:
- Client name and type badge
- Contact information
- Total revenue
- Invoice count
- Last invoice date
- Quick actions dropdown

**Props**:
```typescript
interface ClientCardProps {
  client: Client
  showStats?: boolean
  onEdit?: () => void
  onDelete?: () => void
}
```

---

### ContractManager.tsx
**Purpose**: Upload and manage client contracts.

**Features**:
- Drag-and-drop upload
- File type validation (PDF, DOC, DOCX)
- File size limit (5MB)
- Preview contracts
- Download contracts
- Delete confirmation

**Props**:
```typescript
interface ContractManagerProps {
  clientId: string
  contracts: Contract[]
  onUpload: (file: File) => Promise<void>
  onDelete: (contractId: string) => Promise<void>
}
```

---

## Expense Components (`/expenses`)

### ExpenseFormModal.tsx
**Purpose**: Create/edit expenses with OCR.

**Features**:
- Vendor input
- Amount and tax inputs
- Category dropdown
- Date picker
- Payment method selector
- Receipt image upload
- OCR scan button (Pro feature)
- Invoice number linking

**Props**:
```typescript
interface ExpenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  expense?: Expense
  onSuccess?: (expense: Expense) => void
}
```

**OCR Integration**:
```typescript
const scanReceipt = async (imageFile: File) => {
  setIsScanning(true)
  const result = await expenseService.scanReceipt(imageFile)

  // Auto-fill form
  setValue('vendor', result.vendor)
  setValue('amount', result.amount)
  setValue('date', result.date)
  setValue('category', result.category)

  setIsScanning(false)
}
```

---

### ExpenseList.tsx
**Purpose**: List and filter expenses.

**Features**:
- Date range filtering
- Category filtering
- Payment method filtering
- Search by vendor
- Total expenses display
- Tax recovery summary
- Export to CSV

**Props**:
```typescript
interface ExpenseListProps {
  filters?: ExpenseFilters
  groupBy?: 'category' | 'month' | 'vendor'
}
```

---

### ExpenseCard.tsx
**Purpose**: Individual expense display.

**Features**:
- Vendor name and category
- Amount with tax breakdown
- Receipt thumbnail
- Payment method icon
- Edit/delete actions
- Link to invoice (if applicable)

**Props**:
```typescript
interface ExpenseCardProps {
  expense: Expense
  onEdit?: () => void
  onDelete?: () => void
  showReceipt?: boolean
}
```

---

### ExpenseFiltersModal.tsx
**Purpose**: Advanced expense filtering.

**Features**:
- Date range picker
- Category multi-select
- Payment method filter
- Amount range slider
- Invoice linked filter
- Tax deductible filter

---

### ExpenseManagement.tsx
**Purpose**: Full expense management page.

**Features**:
- Expense list with filters
- Add expense button
- Summary cards (total, by category, tax recoverable)
- Export functionality
- Bulk delete

---

## Analytics Components (`/analytics`)

### KPICard.tsx
**Purpose**: Key metric display card.

**Features**:
- Metric value with formatting
- Trend indicator (up/down percentage)
- Icon representation
- Sparkline chart (optional)
- Period comparison

**Props**:
```typescript
interface KPICardProps {
  title: string
  value: number | string
  trend?: number             // Percentage change
  icon?: React.ReactNode
  format?: 'currency' | 'number' | 'percentage'
  comparison?: string        // e.g., "vs last month"
}
```

---

### RevenueExpenseChart.tsx
**Purpose**: Combined revenue/expense line chart.

**Features**:
- Recharts area/line chart
- Monthly/weekly grouping
- Revenue and expense lines
- Profit calculation
- Hover tooltips
- Legend
- Export chart data

**Props**:
```typescript
interface RevenueExpenseChartProps {
  data: Array<{
    date: string
    revenue: number
    expenses: number
  }>
  period: 'week' | 'month' | 'quarter' | 'year'
}
```

---

### TopClientsChart.tsx
**Purpose**: Bar chart of top clients by revenue.

**Features**:
- Horizontal bar chart
- Top 10 clients
- Revenue amounts
- Invoice count badge
- Click to view client

**Props**:
```typescript
interface TopClientsChartProps {
  clients: Array<{
    name: string
    revenue: number
    invoiceCount: number
  }>
  limit?: number
}
```

---

### ExpenseByCategoryChart.tsx
**Purpose**: Pie/donut chart of expense categories.

**Features**:
- Recharts pie chart
- Category colors
- Percentage labels
- Hover details
- Legend

**Props**:
```typescript
interface ExpenseByCategoryChartProps {
  data: Array<{
    category: string
    amount: number
  }>
  type?: 'pie' | 'donut'
}
```

---

### VATBreakdownChart.tsx
**Purpose**: VAT analysis by rate.

**Features**:
- Stacked bar chart
- Tax rates (0%, 5.5%, 10%, 20%)
- HT/VAT/TTC breakdown
- Total tax due
- Export for tax filing

**Props**:
```typescript
interface VATBreakdownChartProps {
  data: Array<{
    rate: number
    totalHT: number
    totalVAT: number
    totalTTC: number
  }>
}
```

---

### DateRangeSelector.tsx
**Purpose**: Date range picker for analytics.

**Features**:
- Preset ranges (7d, 30d, 90d, 1y)
- Custom range picker
- Comparison period toggle
- Apply/reset buttons

**Props**:
```typescript
interface DateRangeSelectorProps {
  value: { start: Date; end: Date }
  onChange: (range: DateRange) => void
  presets?: Array<{ label: string, days: number }>
}
```

---

## Dashboard Components (`/dashboard`)

### DashboardLayout.tsx
**Purpose**: Main authenticated layout wrapper.

**Features**:
- Responsive sidebar navigation
- Top navigation bar
- User menu dropdown
- Notifications bell
- Breadcrumbs
- Mobile menu toggle
- Plan upgrade banner (if Free plan)

**Props**:
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
}
```

**Navigation Items**:
```typescript
const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/invoices', icon: FileText, label: 'Invoices' },
  { href: '/dashboard/quotes', icon: FileSignature, label: 'Quotes' },
  { href: '/dashboard/clients', icon: Users, label: 'Clients' },
  { href: '/dashboard/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/dashboard/analytics', icon: BarChart, label: 'Analytics' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
]
```

---

### DashboardOverview.tsx
**Purpose**: Main dashboard home page.

**Features**:
- KPI cards (revenue, expenses, invoices, clients)
- Recent invoices list
- Revenue chart
- Quick actions (new invoice, new quote, new client)
- Overdue invoices alert
- Onboarding checklist (if incomplete)

**Data Fetching**:
```typescript
const { data: analytics } = useQuery({
  queryKey: ['analytics', 'overview'],
  queryFn: () => analyticsService.getOverview()
})
```

---

### OnboardingChecklist.tsx
**Purpose**: Guide new users through setup.

**Features**:
- Step-by-step checklist
- Progress bar
- Completion percentage
- Quick links to complete steps
- Dismissible

**Checklist Items**:
```typescript
const steps = [
  { id: 'profile', label: 'Complete profile', completed: user.isProfileComplete() },
  { id: 'client', label: 'Add first client', completed: clientCount > 0 },
  { id: 'template', label: 'Customize template', completed: templateCount > 0 },
  { id: 'invoice', label: 'Create first invoice', completed: invoiceCount > 0 }
]
```

---

## Settings Components (`/settings`)

### ProfileSettings.tsx
**Purpose**: User profile editor.

**Features**:
- Personal information
- Company details
- Address form
- Logo upload
- IBAN input
- Legal information (RCS, capital, TVA)
- Save button with validation

---

### InvoiceSettings.tsx
**Purpose**: Invoice preferences.

**Features**:
- Default tax rate
- Invoice number prefix
- Invoice numbering config
- Default payment terms
- Default legal mentions
- Currency selection

---

### NotificationSettings.tsx
**Purpose**: Email notification preferences.

**Features**:
- Invoice sent confirmation
- Payment received notification
- Quote accepted notification
- Reminder notifications
- Email frequency settings

---

### BillingSettings.tsx
**Purpose**: Subscription and billing management.

**Features**:
- Current plan display
- Plan comparison table
- Upgrade/downgrade buttons
- Usage stats with limits
- Billing history
- Payment method management
- Cancel subscription button

---

## Form Components (`/forms`)

### FormField.tsx
**Purpose**: Reusable form field wrapper.

**Features**:
- Label with required indicator
- Error message display
- Help text
- Icon support
- Consistent styling

**Props**:
```typescript
interface FormFieldProps {
  label: string
  name: string
  error?: string
  required?: boolean
  helpText?: string
  children: React.ReactNode
}
```

---

### InvoiceItemsInput.tsx
**Purpose**: Dynamic invoice line items array.

**Features**:
- Add/remove items
- Description autocomplete (from services)
- Quantity and price inputs
- Tax rate dropdown
- Auto-calculation of totals
- Drag-to-reorder

**Props**:
```typescript
interface InvoiceItemsInputProps {
  items: InvoiceItem[]
  onChange: (items: InvoiceItem[]) => void
  services?: Service[]
}
```

---

### ClientSelector.tsx
**Purpose**: Searchable client dropdown.

**Features**:
- Search by name/email
- Create new client inline
- Display client details on select
- Keyboard navigation

**Props**:
```typescript
interface ClientSelectorProps {
  value?: string
  onChange: (clientId: string) => void
  allowCreate?: boolean
}
```

---

## UI Components (`/ui`)
Shadcn UI primitives (not documented in detail):
- Button, Input, Select, Checkbox, Radio
- Dialog, Sheet, Popover, Dropdown
- Table, Card, Badge, Avatar
- Toast, Alert, Skeleton
- Tabs, Accordion, Collapsible

---

## Providers (`/providers`)

### QueryProvider.tsx
**Purpose**: React Query configuration.

```typescript
<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>
```

---

### ThemeProvider.tsx
**Purpose**: Dark mode support (future).

```typescript
<ThemeProvider attribute="class" defaultTheme="light">
  {children}
</ThemeProvider>
```

---

## Custom Hooks

### useInvoices.tsx
```typescript
const useInvoices = (filters?: InvoiceFilters) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => invoiceService.getAll(filters)
  })

  const createInvoice = useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => queryClient.invalidateQueries(['invoices'])
  })

  return { invoices: data, isLoading, error, createInvoice }
}
```

---

### useZodForm.tsx
**Purpose**: React Hook Form with Zod integration.

```typescript
const useZodForm = <T extends z.ZodType>(schema: T) => {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onBlur'
  })
}
```

---

## Component Patterns

### Loading States
```tsx
{isLoading && <Skeleton className="h-20 w-full" />}
{error && <Alert variant="destructive">{error.message}</Alert>}
{data && <InvoiceList invoices={data} />}
```

### Empty States
```tsx
{invoices.length === 0 && (
  <EmptyState
    icon={<FileText />}
    title="No invoices yet"
    description="Create your first invoice to get started"
    action={<Button onClick={openModal}>Create Invoice</Button>}
  />
)}
```

### Error Handling
```tsx
const onSubmit = async (data) => {
  try {
    await createInvoice(data)
    toast.success('Invoice created')
  } catch (error) {
    toast.error(error.message)
  }
}
```

---

## Styling Conventions

### Tailwind Utilities
```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-semibold text-gray-900">
    Invoice #{invoice.invoiceNumber}
  </h2>
</div>
```

### Responsive Design
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### CSS Variables
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
}
```

---

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Color contrast compliance (WCAG AA)

---

## Performance Optimization

1. **Code Splitting**: Dynamic imports for modals
2. **Lazy Loading**: Images with loading="lazy"
3. **Memoization**: useMemo for expensive calculations
4. **Debouncing**: Search inputs
5. **Virtual Scrolling**: Long lists (future)

---

## Testing

### Component Tests
```typescript
describe('InvoiceFormModal', () => {
  it('should render form fields', () => {...})
  it('should validate required fields', () => {...})
  it('should calculate totals correctly', () => {...})
  it('should submit form data', () => {...})
})
```

### Integration Tests
```typescript
describe('Invoice Creation Flow', () => {
  it('should create invoice and redirect', () => {...})
})
```

---

## Future Enhancements

1. Dark mode support
2. Keyboard shortcuts
3. Bulk operations
4. Advanced filtering
5. Export to Excel
6. Print view optimization
7. Drag-and-drop reordering
8. Real-time collaboration
9. Offline support (PWA)
10. Mobile app (React Native)
