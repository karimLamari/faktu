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

export interface IQuoteNumbering {
  prefix: string;
  nextNumber: number;
  year: number;
}

export interface ISubscription {
  plan: 'free' | 'pro' | 'business';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEndsAt?: Date;
}

export interface IUsage {
  invoicesThisMonth: number;
  quotesThisMonth: number;
  expensesThisMonth: number;
  clientsCount: number;
  lastResetDate: Date;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  // Champs optionnels - peuvent être complétés plus tard
  companyName?: string;
  legalForm?: 'SARL' | 'EURL' | 'SASU' | 'Auto-entrepreneur' | 'Profession libérale';
  siret?: string;
  address?: IAddress;
  phone?: string;
  logo?: string;
  iban?: string;
  // Informations légales pour facturation (optionnelles)
  rcsCity?: string; // Ville d'immatriculation RCS (ex: "Paris")
  capital?: number; // Capital social en euros
  tvaNumber?: string; // Numéro de TVA intracommunautaire
  insuranceCompany?: string; // Nom de la compagnie d'assurance RC Pro
  insurancePolicy?: string; // Numéro de police d'assurance
  defaultCurrency: 'EUR' | 'USD' | 'GBP';
  defaultTaxRate: number;
  invoiceNumbering: IInvoiceNumbering;
  quoteNumbering: IQuoteNumbering;
  subscription?: ISubscription;
  usage?: IUsage;
  googleId?: string;
  emailVerified?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String },
  city: { type: String },
  zipCode: { type: String, match: /^\d{5}$/ },
  country: { type: String, default: 'France' },
}, { _id: false });

const InvoiceNumberingSchema = new Schema<IInvoiceNumbering>({
  prefix: { type: String, default: 'FAC', maxlength: 10 },
  nextNumber: { type: Number, default: 1, min: 1 },
  year: { type: Number, default: () => new Date().getFullYear() },
}, { _id: false });

const QuoteNumberingSchema = new Schema<IQuoteNumbering>({
  prefix: { type: String, default: 'DEVIS', maxlength: 10 },
  nextNumber: { type: Number, default: 1, min: 1 },
  year: { type: Number, default: () => new Date().getFullYear() },
}, { _id: false });

const SubscriptionSchema = new Schema<ISubscription>({
  plan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'trialing'],
    default: 'active'
  },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  trialEndsAt: { type: Date }
}, { _id: false });

const UsageSchema = new Schema<IUsage>({
  invoicesThisMonth: {
    type: Number,
    default: 0
  },
  quotesThisMonth: {
    type: Number,
    default: 0
  },
  expensesThisMonth: {
    type: Number,
    default: 0
  },
  clientsCount: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: Date,
    default: () => new Date()
  }
}, { _id: false });

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: function (this: IUser) { return !this.googleId; }, select: false },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  // Champs optionnels - peuvent être complétés plus tard dans les paramètres
  companyName: { type: String, trim: true },
  legalForm: { type: String, enum: ['SARL', 'EURL', 'SASU', 'Auto-entrepreneur', 'Profession libérale'] },
  siret: { type: String, match: /^\d{14}$/, sparse: true, unique: true, index: true },
  address: { type: AddressSchema },
  phone: { type: String, match: /^\+?[\d\s\-()]+$/ },
  logo: { type: String },
  defaultCurrency: { type: String, default: 'EUR', enum: ['EUR', 'USD', 'GBP'] },
  defaultTaxRate: { type: Number, default: 20.0, min: 0, max: 100 },
  iban: { type: String },
  // Informations légales pour facturation (optionnelles)
  rcsCity: { type: String, trim: true },
  capital: { type: Number, min: 0 },
  tvaNumber: { type: String, trim: true },
  insuranceCompany: { type: String, trim: true },
  insurancePolicy: { type: String, trim: true },
  invoiceNumbering: { type: InvoiceNumberingSchema, default: () => ({}) },
  quoteNumbering: { type: QuoteNumberingSchema, default: () => ({}) },
  subscription: { type: SubscriptionSchema, default: () => ({ plan: 'free', status: 'active' }) },
  usage: { type: UsageSchema, default: () => ({}) },
  googleId: { type: String, sparse: true, unique: true, index: true },
  emailVerified: { type: Date },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpiry: { type: Date, select: false },
}, { timestamps: true });

// Indexes
// UserSchema.index({ email: 1 });
// UserSchema.index({ googleId: 1 });
// UserSchema.index({ siret: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);