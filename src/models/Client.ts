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

export interface IContract {
  _id?: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description?: string;
  uploadedAt: Date;
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
  contracts?: IContract[];
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

const ContractSchema = new Schema<IContract>({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  description: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

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
  contracts: [ContractSchema],
  paymentTerms: { type: Number, default: 30, min: 0 },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Indexes
ClientSchema.index({ userId: 1 });
ClientSchema.index({ email: 1 });
ClientSchema.index({ name: 1 });
ClientSchema.index({ type: 1 });

// Forcer la suppression du modèle en cache si il existe
if (mongoose.models.Client) {
  delete mongoose.models.Client;
}

export default mongoose.model<IClient>('Client', ClientSchema);