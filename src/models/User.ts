import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface IInvoiceNumbering {
  prefix: string;
  nextNumber: number;
  year: number;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  companyName: string;
  legalForm: 'SARL' | 'EURL' | 'SASU' | 'Auto-entrepreneur' | 'Profession libérale';
  siret?: string;
  address: IAddress;
  phone?: string;
  logo?: string;
  iban?: string;
  defaultCurrency: 'EUR' | 'USD' | 'GBP';
  defaultTaxRate: number;
  invoiceNumbering: IInvoiceNumbering;
  googleId?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true, match: /^\d{5}$/ },
  country: { type: String, default: 'France' },
}, { _id: false });

const InvoiceNumberingSchema = new Schema<IInvoiceNumbering>({
  prefix: { type: String, default: 'FAC', maxlength: 10 },
  nextNumber: { type: Number, default: 1, min: 1 },
  year: { type: Number, default: () => new Date().getFullYear() },
}, { _id: false });

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: function (this: IUser) { return !this.googleId; }, select: false },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  legalForm: { type: String, enum: ['SARL', 'EURL', 'SASU', 'Auto-entrepreneur', 'Profession libérale'], required: true },
  siret: { type: String, match: /^\d{14}$/, sparse: true, unique: true, index: true },
  address: { type: AddressSchema, required: true },
  phone: { type: String, match: /^\+?[\d\s\-()]+$/ },
  logo: { type: String },
  defaultCurrency: { type: String, default: 'EUR', enum: ['EUR', 'USD', 'GBP'] },
  defaultTaxRate: { type: Number, default: 20.0, min: 0, max: 100 },
  iban: { type: String },
  invoiceNumbering: { type: InvoiceNumberingSchema, default: () => ({}) },
  googleId: { type: String, sparse: true, unique: true, index: true },
  emailVerified: { type: Date },
}, { timestamps: true });

// Indexes
// UserSchema.index({ email: 1 });
// UserSchema.index({ googleId: 1 });
// UserSchema.index({ siret: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);