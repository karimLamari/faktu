import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  unit: 'unit' | 'hour' | 'day' | 'month' | 'kg';
}

export interface IReminder {
  sentAt: Date;
  sentBy?: string;
  type: 'friendly' | 'firm' | 'final';
  customMessage?: string;
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
  reminders: IReminder[];
  items: IInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'card' | 'online' | 'other';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';  // Synchronisé avec status
  notes?: string;
  privateNotes?: string;
  terms?: string;
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  // Champs de conformité légale (Article L123-22 Code de commerce)
  isFinalized: boolean;              // Facture verrouillée et immutable
  finalizedAt?: Date;                // Date de finalisation
  finalizedBy?: mongoose.Types.ObjectId;  // Utilisateur ayant finalisé
  pdfPath?: string;                  // Chemin permanent du PDF sur disque
  pdfHash?: string;                  // SHA-256 hash pour vérification d'intégrité
  // Soft delete pour factures finalisées
  deletedAt?: Date;                  // Date de suppression logique
  deletedBy?: mongoose.Types.ObjectId;    // Utilisateur ayant supprimé
  // Template utilisé (pour cohérence et conformité légale)
  templateId?: mongoose.Types.ObjectId;  // Référence vers InvoiceTemplate
  templateSnapshot?: any;                 // Snapshot complet du template au moment de la création
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

const ReminderSchema = new Schema<IReminder>({
  sentAt: { type: Date, required: true, default: Date.now },
  sentBy: { type: String },
  type: { type: String, enum: ['friendly', 'firm', 'final'], required: true },
  customMessage: { type: String },
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  invoiceNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid'],
    default: 'draft',
  },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  paymentDate: { type: Date },
  sentAt: { type: Date },
  reminders: { type: [ReminderSchema], default: [] },
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
  // Champs de conformité légale
  isFinalized: { type: Boolean, default: false, required: true, index: true },
  finalizedAt: { type: Date },
  finalizedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  pdfPath: { type: String },  // invoices/userId/year/FAC-2025-0001.pdf
  pdfHash: { type: String },  // SHA-256 pour vérification intégrité
  // Soft delete
  deletedAt: { type: Date, index: true },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Template (optionnel pour compatibilité avec factures existantes)
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'InvoiceTemplate',
    required: false,
    index: true
  },
  templateSnapshot: {
    type: Schema.Types.Mixed,
    required: false
  },
}, { timestamps: true });

// Indexes
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ userId: 1, clientId: 1 });
InvoiceSchema.index({ userId: 1, issueDate: -1 });
InvoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });
// Indexes pour conformité légale
InvoiceSchema.index({ userId: 1, isFinalized: 1 });
InvoiceSchema.index({ userId: 1, deletedAt: 1 });
InvoiceSchema.index({ isFinalized: 1, deletedAt: 1 });

// 🔄 Hook pour synchroniser paymentStatus depuis status (DB compatibility)
InvoiceSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    // Mapper status vers paymentStatus compatible
    const mapping: Record<string, any> = {
      'draft': 'pending',
      'sent': 'pending',
      'paid': 'paid',
      'partially_paid': 'partially_paid',
      'overdue': 'overdue',
      'cancelled': 'cancelled'
    };
    
    this.paymentStatus = mapping[this.status] || 'pending';
  }
  next();
});

InvoiceSchema.pre('findOneAndUpdate', function(next) {
  const update: any = this.getUpdate();
  if (update.$set && update.$set.status) {
    // Mapper status vers paymentStatus lors des updates
    const mapping: Record<string, any> = {
      'draft': 'pending',
      'sent': 'pending',
      'paid': 'paid',
      'partially_paid': 'partially_paid',
      'overdue': 'overdue',
      'cancelled': 'cancelled'
    };
    
    update.$set.paymentStatus = mapping[update.$set.status] || 'pending';
  }
  next();
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);