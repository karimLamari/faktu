import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplateContent {
  header: {
    logoPosition: 'left' | 'right' | 'center';
    companyInfo: boolean;
    clientInfo: boolean;
  };
  items: {
    columns: Array<'description' | 'quantity' | 'price' | 'tax' | 'total'>;
    showTaxColumn: boolean;
  };
  footer: {
    notes?: string;
    terms?: string;
    paymentInfo: boolean;
  };
}

export interface ITemplateStyles {
  primaryColor: string;
  fontFamily: string;
  logoSize: 'small' | 'medium' | 'large' | string;
}

export interface ITemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'invoice' | 'quote';
  content: ITemplateContent;
  styles: ITemplateStyles;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['invoice', 'quote'], required: true },
  content: {
    header: {
      logoPosition: { type: String, enum: ['left', 'right', 'center'], default: 'left' },
      companyInfo: { type: Boolean, default: true },
      clientInfo: { type: Boolean, default: true },
    },
    items: {
      columns: [{ type: String, enum: ['description', 'quantity', 'price', 'tax', 'total'] }],
      showTaxColumn: { type: Boolean, default: true },
    },
    footer: {
      notes: String,
      terms: String,
      paymentInfo: { type: Boolean, default: true },
    },
  },
  styles: {
    primaryColor: { type: String, default: '#000000' },
    fontFamily: { type: String, default: 'Arial' },
    logoSize: { type: String, default: 'medium' },
  },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes
TemplateSchema.index({ userId: 1, isDefault: 1 });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);
