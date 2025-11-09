import mongoose, { Schema, Document } from 'mongoose';

export interface IQuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  unit: 'unit' | 'hour' | 'day' | 'month' | 'kg';
}

export interface IQuote extends Document {
  userId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  quoteNumber: string; // Format: DEVIS-2025-0001
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  issueDate: Date;
  validUntil: Date; // Date d'expiration du devis
  convertedToInvoiceId?: mongoose.Types.ObjectId; // Lien vers facture créée
  convertedAt?: Date; // Date de conversion
  sentAt?: Date;
  
  // Signature électronique
  signatureToken?: string; // Token unique pour signer le devis
  signatureTokenExpiry?: Date; // Expiration du lien de signature
  signedAt?: Date; // Date de signature
  signatureData?: string; // Base64 de la signature canvas
  signerName?: string; // Nom du signataire
  signerEmail?: string; // Email du signataire
  signerIp?: string; // IP de signature (traçabilité)
  
  items: IQuoteItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  
  notes?: string; // Notes publiques (visibles par client)
  privateNotes?: string; // Notes privées (internes)
  terms?: string; // Conditions du devis
  
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const QuoteItemSchema = new Schema<IQuoteItem>({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.001 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, required: true, min: 0, max: 100 },
  unit: { type: String, default: 'unit', enum: ['unit', 'hour', 'day', 'month', 'kg'] },
}, { _id: false });

const QuoteSchema = new Schema<IQuote>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  quoteNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
    default: 'draft',
  },
  issueDate: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  convertedToInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  convertedAt: { type: Date },
  sentAt: { type: Date },
  
  // Signature électronique
  signatureToken: { type: String, select: false, index: true, sparse: true },
  signatureTokenExpiry: { type: Date, select: false },
  signedAt: { type: Date },
  signatureData: { type: String }, // Base64 image
  signerName: { type: String },
  signerEmail: { type: String },
  signerIp: { type: String },
  
  items: { type: [QuoteItemSchema], required: true },
  subtotal: { type: Number, required: true, min: 0 },
  taxAmount: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  
  notes: { type: String },
  privateNotes: { type: String },
  terms: { type: String },
  
  pdfUrl: { type: String },
  pdfGeneratedAt: { type: Date },
}, { timestamps: true });

// Indexes
QuoteSchema.index({ userId: 1, status: 1 });
QuoteSchema.index({ userId: 1, clientId: 1 });
QuoteSchema.index({ userId: 1, issueDate: -1 });
QuoteSchema.index({ userId: 1, quoteNumber: 1 }, { unique: true });

export default mongoose.models.Quote || mongoose.model<IQuote>('Quote', QuoteSchema);
