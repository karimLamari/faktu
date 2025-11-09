import mongoose, { Schema, Document } from 'mongoose';

export interface IClientAddress {
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

export interface ICompanyInfo {
  legalName?: string;
  siret?: string;
}

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'individual' | 'business';
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: IClientAddress;
  companyInfo?: ICompanyInfo;
  paymentTerms: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClientAddressSchema = new Schema<IClientAddress>({
  street: String,
  city: String,
  zipCode: String,
  country: String,
}, { _id: false });

const CompanyInfoSchema = new Schema<ICompanyInfo>({
  legalName: String,
  siret: { type: String, match: /^\d{14}$/ },
}, { _id: false });

const ClientSchema = new Schema<IClient>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['individual', 'business'], required: true },
  name: { type: String, required: true, trim: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true, match: /.+\@.+\..+/ },
  phone: { type: String, match: /^\+?[\d\s\-()]+$/ },
  address: { type: ClientAddressSchema },
  companyInfo: { type: CompanyInfoSchema },
  paymentTerms: { type: Number, default: 30, min: 0 },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Indexes
ClientSchema.index({ userId: 1 });
ClientSchema.index({ email: 1 });
ClientSchema.index({ name: 1 });
ClientSchema.index({ type: 1 });

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);