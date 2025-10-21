import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'card' | 'online' | 'other';
  reference?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  paymentDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['bank_transfer', 'check', 'cash', 'card', 'online', 'other'], required: true },
  reference: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'completed' },
}, { timestamps: true });

// Indexes
PaymentSchema.index({ userId: 1, invoiceId: 1 });
PaymentSchema.index({ userId: 1, paymentDate: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
