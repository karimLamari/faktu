import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  unit: 'unit' | 'hour' | 'day' | 'month' | 'kg';
}

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  issueDate: Date;
  dueDate: Date;
  paymentDate?: Date;
  sentAt?: Date;
  items: IInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'card' | 'online' | 'other';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  notes?: string;
  privateNotes?: string;
  terms?: string;
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.001 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, required: true, min: 0, max: 100 },
  unit: { type: String, default: 'unit', enum: ['unit', 'hour', 'day', 'month', 'kg'] },
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid'],
    default: 'draft',
  },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  paymentDate: { type: Date },
  sentAt: { type: Date },
  items: { type: [InvoiceItemSchema], required: true },
  subtotal: { type: Number, required: true, min: 0 },
  taxAmount: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  amountPaid: { type: Number, default: 0, min: 0 },
  balanceDue: { type: Number, required: true, min: 0 },
  paymentMethod: { 
    type: String, 
    enum: ['bank_transfer', 'check', 'cash', 'card', 'online', 'other'],
    default: 'bank_transfer'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  notes: { type: String },
  privateNotes: { type: String },
  terms: { type: String },
  pdfUrl: { type: String },
  pdfGeneratedAt: { type: Date },
}, { timestamps: true });

// Indexes
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ userId: 1, clientId: 1 });
InvoiceSchema.index({ userId: 1, issueDate: -1 });
InvoiceSchema.index({ invoiceNumber: 1 });

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);