# Invoice Template System Documentation

## Overview
Flexible and customizable invoice PDF generation system built with `@react-pdf/renderer`. Supports 5 professionally designed templates with extensive customization options.

## Architecture

### Core Principles
1. **Template Snapshot Pattern** - Invoice stores complete template configuration at creation time
2. **React-PDF Rendering** - Browser-based PDF generation (no headless browser needed)
3. **Immutability** - Template changes don't affect existing invoices
4. **Customization** - Colors, fonts, layout, sections, and text fully customizable
5. **Legal Compliance** - French accounting standards support

---

## Directory Structure

```
src/lib/invoice-templates/
├── core/
│   ├── router.tsx              # Template routing and rendering
│   ├── validation.ts           # Zod schemas for template config
│   └── utils.ts                # Calculation and formatting utilities
├── templates/
│   ├── ModerneTemplate.tsx     # Sidebar layout (30% + 70%)
│   ├── ClassiqueTemplate.tsx   # Vertical formal with borders
│   ├── MinimalisteTemplate.tsx # Centered, list-based
│   ├── StudioTemplate.tsx      # Asymmetric with diagonal header
│   └── CreatifTemplate.tsx     # Bold diagonal header
├── components/
│   ├── TemplatePreview.tsx     # Live preview component
│   ├── TemplateSelector.tsx    # Template picker UI
│   └── TemplateCustomizer.tsx  # Customization form
├── config/
│   └── presets.ts              # Default templates and legal text
└── index.ts                    # Public exports
```

---

## Available Templates

### 1. ModerneTemplate
**Style**: Sidebar layout with colored left panel

**Layout**:
```
┌────────────┬──────────────────────┐
│            │                      │
│  Sidebar   │   Header             │
│  (30%)     │   Client Info        │
│            │   Items Table        │
│  Logo      │   Totals             │
│  Company   │   Payment Terms      │
│  Info      │   Legal Mentions     │
│            │                      │
└────────────┴──────────────────────┘
```

**Features**:
- Colored sidebar (customizable primary color)
- Clean table design
- Professional appearance
- Best for modern businesses

**Default Colors**:
```typescript
{
  primary: '#2563eb',      // Blue-600
  secondary: '#f3f4f6',    // Gray-100
  accent: '#3b82f6',       // Blue-500
  text: '#1f2937',         // Gray-800
  background: '#ffffff'
}
```

---

### 2. ClassiqueTemplate
**Style**: Traditional vertical layout with decorative borders

**Layout**:
```
┌────────────────────────────────┐
│ ╔════════════════════════════╗ │
│ ║  Header                    ║ │
│ ║  Logo + Company Info       ║ │
│ ╚════════════════════════════╝ │
│                                │
│  Client Information            │
│                                │
│  Items Table (bordered)        │
│                                │
│  Totals (right-aligned)        │
│                                │
│  Payment Terms                 │
│  Legal Mentions                │
└────────────────────────────────┘
```

**Features**:
- Elegant double border header
- Classic table with borders
- Formal appearance
- Best for traditional industries (law, accounting, consulting)

**Default Colors**:
```typescript
{
  primary: '#1f2937',      // Gray-800 (dark)
  secondary: '#f9fafb',    // Gray-50
  accent: '#6b7280',       // Gray-500
  text: '#111827',
  background: '#ffffff'
}
```

---

### 3. MinimalisteTemplate
**Style**: Centered layout with minimal decoration

**Layout**:
```
┌────────────────────────────────┐
│                                │
│        Logo (centered)         │
│      Company Name              │
│                                │
│      Client Information        │
│                                │
│      Items (list format)       │
│      - Item 1                  │
│      - Item 2                  │
│                                │
│      Totals (boxed)            │
│                                │
│      Payment Terms             │
│                                │
└────────────────────────────────┘
```

**Features**:
- No tables (list-based items)
- Generous white space
- Clean typography
- Best for creative professionals, designers

**Default Colors**:
```typescript
{
  primary: '#000000',
  secondary: '#f5f5f5',
  accent: '#404040',
  text: '#262626',
  background: '#ffffff'
}
```

---

### 4. StudioTemplate
**Style**: Asymmetric design with diagonal header

**Layout**:
```
┌────────────────────────────────┐
│ ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱  │
│╱  FACTURE                   ╱ │
│╱  Logo                     ╱  │
│╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱    │
│                                │
│  Company │ Client              │
│  ─────────────────             │
│  Items (no borders)            │
│                                │
│  ═══════ Totals ═══════        │
│                                │
└────────────────────────────────┘
```

**Features**:
- Diagonal accent bar
- Two-column header
- Borderless table
- Modern and dynamic
- Best for tech companies, startups

**Default Colors**:
```typescript
{
  primary: '#8b5cf6',      // Purple-500
  secondary: '#f5f3ff',    // Purple-50
  accent: '#a78bfa',       // Purple-400
  text: '#1f2937',
  background: '#ffffff'
}
```

---

### 5. CreatifTemplate
**Style**: Bold diagonal header with asymmetric layout

**Layout**:
```
┌────────────────────────────────┐
│ ╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲  │
│  ╲  INVOICE #0001          ╲  │
│   ╲  Large Bold Text       ╲  │
│    ╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲   │
│                                │
│  Logo (large)                  │
│                                │
│  Items (bold lines)            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                │
│  ▓▓▓▓ TOTAL: €1,234.56         │
│                                │
└────────────────────────────────┘
```

**Features**:
- Large diagonal header
- Bold typography
- Thick divider lines
- Eye-catching design
- Best for creative agencies, marketing

**Default Colors**:
```typescript
{
  primary: '#f59e0b',      // Amber-500
  secondary: '#fffbeb',    // Amber-50
  accent: '#fbbf24',       // Amber-400
  text: '#1f2937',
  background: '#ffffff'
}
```

---

## Template Configuration Schema

### Full Configuration Object
```typescript
interface InvoiceTemplateConfig {
  // Template Identity
  name: string
  templateComponent: 'ModerneTemplate' | 'ClassiqueTemplate' |
                     'MinimalisteTemplate' | 'StudioTemplate' | 'CreatifTemplate'
  isDefault: boolean

  // Color Scheme
  colors: {
    primary: string        // Main brand color (hex)
    secondary: string      // Background tints
    accent: string         // Highlights and borders
    text: string           // Main text color
    background: string     // Page background (usually white)
  }

  // Typography
  typography: {
    headingFont: 'Helvetica' | 'Times-Roman' | 'Courier'
    bodyFont: 'Helvetica' | 'Times-Roman' | 'Courier'
    headingSize: 18 | 20 | 24 | 28  // Points
    bodySize: 10 | 11 | 12 | 14      // Points
  }

  // Layout Configuration
  layout: {
    logoPosition: 'left' | 'center' | 'right'
    logoSize: 'small' | 'medium' | 'large'  // 60px, 80px, 100px
    headerStyle: 'simple' | 'bold' | 'elegant'
    spacing: 'compact' | 'normal' | 'spacious'  // 8px, 12px, 16px
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

  // Custom Text Overrides
  customText: {
    header?: string                    // Custom header text
    footer?: string                    // Custom footer text
    paymentInstructions?: string       // Payment details
    legalMentions?: string            // Legal footer text
  }
}
```

---

## Core Modules

### router.tsx
**Purpose**: Route template selection and render correct component

```typescript
export const renderTemplate = (
  invoice: Invoice,
  client: Client,
  user: User,
  template?: InvoiceTemplate
): React.ReactElement => {
  const config = template || getDefaultTemplate()
  const templateComponent = config.templateComponent

  switch (templateComponent) {
    case 'ModerneTemplate':
      return <ModerneTemplate {...props} />
    case 'ClassiqueTemplate':
      return <ClassiqueTemplate {...props} />
    case 'MinimalisteTemplate':
      return <MinimalisteTemplate {...props} />
    case 'StudioTemplate':
      return <StudioTemplate {...props} />
    case 'CreatifTemplate':
      return <CreatifTemplate {...props} />
    default:
      return <ModerneTemplate {...props} />
  }
}
```

**Functions**:
- `renderTemplate(invoice, client, user, template)` - Main render function
- `getTemplateComponent(name)` - Get template by name
- `getAllTemplates()` - List all available templates

---

### validation.ts
**Purpose**: Zod schemas for template configuration validation

```typescript
// Color validation (hex format)
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/)

// Colors schema
export const templateColorsSchema = z.object({
  primary: hexColorSchema,
  secondary: hexColorSchema,
  accent: hexColorSchema,
  text: hexColorSchema,
  background: hexColorSchema
})

// Typography schema
export const templateTypographySchema = z.object({
  headingFont: z.enum(['Helvetica', 'Times-Roman', 'Courier']),
  bodyFont: z.enum(['Helvetica', 'Times-Roman', 'Courier']),
  headingSize: z.number().min(14).max(32),
  bodySize: z.number().min(8).max(16)
})

// Layout schema
export const templateLayoutSchema = z.object({
  logoPosition: z.enum(['left', 'center', 'right']),
  logoSize: z.enum(['small', 'medium', 'large']),
  headerStyle: z.enum(['simple', 'bold', 'elegant']),
  spacing: z.enum(['compact', 'normal', 'spacious'])
})

// Sections schema
export const templateSectionsSchema = z.object({
  showLogo: z.boolean(),
  showCompanyInfo: z.boolean(),
  showClientInfo: z.boolean(),
  showPaymentTerms: z.boolean(),
  showNotes: z.boolean(),
  showLegalMentions: z.boolean(),
  showSignature: z.boolean()
})

// Custom text schema
export const templateCustomTextSchema = z.object({
  header: z.string().optional(),
  footer: z.string().optional(),
  paymentInstructions: z.string().optional(),
  legalMentions: z.string().optional()
})

// Full template schema
export const invoiceTemplateSchema = z.object({
  name: z.string().min(2).max(50),
  templateComponent: z.enum([
    'ModerneTemplate',
    'ClassiqueTemplate',
    'MinimalisteTemplate',
    'StudioTemplate',
    'CreatifTemplate'
  ]),
  isDefault: z.boolean(),
  colors: templateColorsSchema,
  typography: templateTypographySchema,
  layout: templateLayoutSchema,
  sections: templateSectionsSchema,
  customText: templateCustomTextSchema
})
```

**Usage**:
```typescript
try {
  const validatedTemplate = invoiceTemplateSchema.parse(userInput)
  // Save to database
} catch (error) {
  // Validation errors
  console.error(error.errors)
}
```

---

### utils.ts
**Purpose**: Helper functions for calculations and formatting

```typescript
// Calculate VAT grouped by rate
export const calculateVATByRate = (items: InvoiceItem[]): VATBreakdown[] => {
  const vatMap = new Map<number, { totalHT: number, totalVAT: number }>()

  items.forEach(item => {
    const existing = vatMap.get(item.taxRate) || { totalHT: 0, totalVAT: 0 }
    vatMap.set(item.taxRate, {
      totalHT: existing.totalHT + item.amount,
      totalVAT: existing.totalVAT + item.taxAmount
    })
  })

  return Array.from(vatMap.entries()).map(([rate, totals]) => ({
    rate,
    totalHT: totals.totalHT,
    totalVAT: totals.totalVAT,
    totalTTC: totals.totalHT + totals.totalVAT
  }))
}

// Format currency
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Format date
export const formatDate = (date: Date, format: string = 'dd/MM/yyyy'): string => {
  return format(date, format, { locale: fr })
}

// Calculate totals
export const calculateInvoiceTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxTotal = items.reduce((sum, item) => sum + item.taxAmount, 0)
  const total = subtotal + taxTotal

  return { subtotal, taxTotal, total }
}

// Get logo size in pixels
export const getLogoSize = (size: 'small' | 'medium' | 'large'): number => {
  const sizes = { small: 60, medium: 80, large: 100 }
  return sizes[size]
}

// Get spacing value
export const getSpacing = (spacing: 'compact' | 'normal' | 'spacious'): number => {
  const spacings = { compact: 8, normal: 12, spacious: 16 }
  return spacings[spacing]
}
```

---

## Template Components (React-PDF)

### Common Props Interface
All templates receive the same props:

```typescript
interface TemplateProps {
  invoice: Invoice
  client: Client
  user: User
  template: InvoiceTemplateConfig
}
```

---

### ModerneTemplate.tsx Structure

```tsx
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

export const ModerneTemplate: React.FC<TemplateProps> = ({
  invoice,
  client,
  user,
  template
}) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: template.colors.background,
      fontFamily: template.typography.bodyFont,
      fontSize: template.typography.bodySize
    },
    sidebar: {
      width: '30%',
      backgroundColor: template.colors.primary,
      color: '#ffffff',
      padding: 20
    },
    content: {
      width: '70%',
      padding: 20
    },
    // ... more styles
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {template.sections.showLogo && user.logo && (
            <Image src={user.logo} style={styles.logo} />
          )}

          {template.sections.showCompanyInfo && (
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{user.companyName}</Text>
              <Text>{user.address?.street}</Text>
              <Text>{user.address?.city}</Text>
              {user.siret && <Text>SIRET: {user.siret}</Text>}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text>Date: {formatDate(invoice.issueDate)}</Text>
          </View>

          {/* Client Info */}
          {template.sections.showClientInfo && (
            <View style={styles.clientInfo}>
              <Text style={styles.label}>Client:</Text>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text>{client.address?.street}</Text>
              <Text>{client.address?.city}</Text>
            </View>
          )}

          {/* Items Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.colDescription}>Description</Text>
              <Text style={styles.colQty}>Qté</Text>
              <Text style={styles.colPrice}>P.U. HT</Text>
              <Text style={styles.colTax}>TVA</Text>
              <Text style={styles.colTotal}>Total HT</Text>
            </View>

            {/* Table Rows */}
            {invoice.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colDescription}>{item.description}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={styles.colTax}>{item.taxRate}%</Text>
                <Text style={styles.colTotal}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Total HT</Text>
              <Text>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>TVA</Text>
              <Text>{formatCurrency(invoice.taxTotal)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text>Total TTC</Text>
              <Text>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>

          {/* Payment Terms */}
          {template.sections.showPaymentTerms && invoice.paymentTerms && (
            <View style={styles.paymentTerms}>
              <Text style={styles.label}>Conditions de paiement:</Text>
              <Text>{invoice.paymentTerms}</Text>
              {user.iban && <Text>IBAN: {user.iban}</Text>}
            </View>
          )}

          {/* Legal Mentions */}
          {template.sections.showLegalMentions && (
            <View style={styles.legalMentions}>
              <Text>{template.customText.legalMentions || getDefaultLegalMentions()}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
```

---

## Preset Configuration

### presets.ts

```typescript
export const DEFAULT_TEMPLATES: Record<string, InvoiceTemplateConfig> = {
  moderne: {
    name: 'Moderne',
    templateComponent: 'ModerneTemplate',
    isDefault: true,
    colors: {
      primary: '#2563eb',
      secondary: '#f3f4f6',
      accent: '#3b82f6',
      text: '#1f2937',
      background: '#ffffff'
    },
    typography: {
      headingFont: 'Helvetica',
      bodyFont: 'Helvetica',
      headingSize: 24,
      bodySize: 11
    },
    layout: {
      logoPosition: 'left',
      logoSize: 'medium',
      headerStyle: 'bold',
      spacing: 'normal'
    },
    sections: {
      showLogo: true,
      showCompanyInfo: true,
      showClientInfo: true,
      showPaymentTerms: true,
      showNotes: true,
      showLegalMentions: true,
      showSignature: false
    },
    customText: {
      legalMentions: DEFAULT_LEGAL_MENTIONS_FR
    }
  },
  // ... other presets
}

export const DEFAULT_LEGAL_MENTIONS_FR = `
Mentions légales obligatoires :
- TVA non applicable, article 293B du CGI (si auto-entrepreneur)
- En cas de retard de paiement, indemnité forfaitaire pour frais de recouvrement : 40 euros (article L441-6 du Code de commerce)
- Taux de pénalité de retard : 3 fois le taux d'intérêt légal
- Escompte pour paiement anticipé : néant
`.trim()
```

---

## Usage Examples

### 1. Rendering a PDF in API Route

```typescript
// src/app/api/invoices/[id]/pdf/route.ts
import { renderTemplate } from '@/lib/invoice-templates/core/router'
import { pdf } from '@react-pdf/renderer'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Fetch data
  const invoice = await Invoice.findById(params.id)
  const client = await Client.findById(invoice.clientId)
  const user = await User.findById(invoice.userId)
  const template = invoice.templateSnapshot || await getDefaultTemplate()

  // Render template
  const pdfDoc = renderTemplate(invoice, client, user, template)

  // Generate PDF buffer
  const pdfBuffer = await pdf(pdfDoc).toBuffer()

  // Return as download
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    }
  })
}
```

---

### 2. Live Preview in UI

```tsx
// src/components/invoices/InvoicePreview.tsx
import { PDFViewer } from '@react-pdf/renderer'
import { renderTemplate } from '@/lib/invoice-templates/core/router'

export const InvoicePreview: React.FC<Props> = ({ invoice, client, user, template }) => {
  return (
    <PDFViewer width="100%" height="800px">
      {renderTemplate(invoice, client, user, template)}
    </PDFViewer>
  )
}
```

---

### 3. Creating Custom Template

```tsx
// User customizes template
const customTemplate = {
  ...DEFAULT_TEMPLATES.moderne,
  name: 'My Custom Template',
  colors: {
    primary: '#8b5cf6',     // Purple
    secondary: '#f5f3ff',
    accent: '#a78bfa',
    text: '#1f2937',
    background: '#ffffff'
  },
  customText: {
    legalMentions: 'Custom legal text here...'
  }
}

// Save to database
const template = await InvoiceTemplate.create({
  userId: user._id,
  ...customTemplate
})
```

---

### 4. Snapshot Pattern on Invoice Creation

```typescript
// When creating invoice
const invoice = await Invoice.create({
  userId,
  clientId,
  items,
  // ... other fields
  templateSnapshot: await getTemplateSnapshot(templateId)
})

// Get snapshot
const getTemplateSnapshot = async (templateId?: string) => {
  if (templateId) {
    const template = await InvoiceTemplate.findById(templateId)
    return template.toObject()
  }
  return getDefaultTemplate()
}
```

---

## Customization UI Components

### TemplateSelector.tsx
```tsx
export const TemplateSelector: React.FC<Props> = ({ value, onChange }) => {
  const templates = Object.values(DEFAULT_TEMPLATES)

  return (
    <div className="grid grid-cols-2 gap-4">
      {templates.map(template => (
        <div
          key={template.templateComponent}
          onClick={() => onChange(template)}
          className={cn(
            'border-2 rounded-lg p-4 cursor-pointer',
            value?.templateComponent === template.templateComponent
              ? 'border-primary'
              : 'border-gray-200'
          )}
        >
          <div className="aspect-[210/297] bg-gray-100 mb-2">
            {/* Template thumbnail preview */}
          </div>
          <h3 className="font-semibold">{template.name}</h3>
        </div>
      ))}
    </div>
  )
}
```

---

### TemplateCustomizer.tsx
```tsx
export const TemplateCustomizer: React.FC<Props> = ({ template, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Color Customization */}
      <div>
        <h3 className="font-semibold mb-2">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Primary"
            value={template.colors.primary}
            onChange={(color) => onChange({
              ...template,
              colors: { ...template.colors, primary: color }
            })}
          />
          <ColorPicker
            label="Accent"
            value={template.colors.accent}
            onChange={(color) => onChange({
              ...template,
              colors: { ...template.colors, accent: color }
            })}
          />
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="font-semibold mb-2">Typography</h3>
        <Select
          label="Heading Font"
          value={template.typography.headingFont}
          onChange={(font) => onChange({
            ...template,
            typography: { ...template.typography, headingFont: font }
          })}
          options={['Helvetica', 'Times-Roman', 'Courier']}
        />
      </div>

      {/* Section Visibility */}
      <div>
        <h3 className="font-semibold mb-2">Sections</h3>
        <Checkbox
          label="Show Logo"
          checked={template.sections.showLogo}
          onChange={(checked) => onChange({
            ...template,
            sections: { ...template.sections, showLogo: checked }
          })}
        />
      </div>
    </div>
  )
}
```

---

## PDF Generation Service

### pdf-generator.tsx
```typescript
import { pdf } from '@react-pdf/renderer'
import { renderTemplate } from '@/lib/invoice-templates/core/router'

export const generateInvoicePdf = async (
  invoice: Invoice,
  client: Client,
  user: User,
  template?: InvoiceTemplate
): Promise<Buffer> => {
  // Render React-PDF document
  const pdfDoc = renderTemplate(invoice, client, user, template)

  // Generate buffer
  const pdfBuffer = await pdf(pdfDoc).toBuffer()

  return pdfBuffer
}

export const generateQuotePdf = async (
  quote: Quote,
  client: Client,
  user: User,
  template?: QuoteTemplate
): Promise<Buffer> => {
  // Similar to invoice
}
```

---

## Legal Compliance

### French Accounting Requirements

1. **Mandatory Fields** (Article L441-3 Code de commerce):
   - Invoice number (chronological, continuous)
   - Invoice date
   - Seller identity (name, address, SIRET)
   - Buyer identity
   - Item descriptions
   - Quantities
   - Unit prices
   - Tax rates and amounts
   - Total amount (HT and TTC)
   - Payment terms
   - Late payment penalties

2. **Legal Mentions**:
   - TVA status (applicable or not)
   - RCS registration
   - Capital social (if company)
   - Late payment penalties
   - Recovery costs (40€ minimum)

3. **Immutability**:
   - Once finalized, invoice cannot be modified
   - Template snapshot ensures consistent rendering
   - PDF hash verification

---

## Performance Optimization

### Tips for Fast PDF Generation

1. **Minimize Images**: Compress logos before upload
2. **Cache Fonts**: Fonts loaded once per app lifecycle
3. **Optimize Tables**: Limit items per page
4. **Async Generation**: Use background jobs for bulk PDFs
5. **Reuse Snapshots**: Don't re-fetch template each time

---

## Testing

### Template Rendering Tests
```typescript
describe('ModerneTemplate', () => {
  it('should render all sections', async () => {
    const pdfBuffer = await generateInvoicePdf(mockInvoice, mockClient, mockUser, mockTemplate)
    expect(pdfBuffer).toBeInstanceOf(Buffer)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should apply custom colors', async () => {
    const customTemplate = { ...mockTemplate, colors: { primary: '#ff0000' } }
    const pdfBuffer = await generateInvoicePdf(mockInvoice, mockClient, mockUser, customTemplate)
    // Verify PDF contains color
  })
})
```

---

## Future Enhancements

1. **More Templates**: Add 5-10 additional designs
2. **Custom Fonts**: Upload custom font files
3. **Multi-page Support**: Automatic pagination for long invoices
4. **Watermarks**: Draft watermark for non-finalized
5. **QR Codes**: Payment QR codes
6. **Barcodes**: Invoice number barcodes
7. **Signature Images**: Digital signature rendering
8. **Multi-language**: Template text translations
9. **A4/Letter Toggle**: Support multiple paper sizes
10. **Template Marketplace**: Share/sell templates
