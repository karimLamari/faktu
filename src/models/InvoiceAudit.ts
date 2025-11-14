import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface IInvoiceAudit extends Document {
  invoiceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: 'created' | 'updated' | 'finalized' | 'sent' | 'deleted' | 'modification_attempt';
  changes: IInvoiceChange[];
  performedBy: mongoose.Types.ObjectId;
  performedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;  // Données supplémentaires contextuelles
}

const InvoiceChangeSchema = new Schema<IInvoiceChange>({
  field: { type: String, required: true },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
}, { _id: false });

const InvoiceAuditSchema = new Schema<IInvoiceAudit>({
  invoiceId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Invoice', 
    required: true,
    index: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'finalized', 'sent', 'deleted', 'modification_attempt'],
    required: true,
    index: true
  },
  changes: { 
    type: [InvoiceChangeSchema], 
    default: [] 
  },
  performedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  performedAt: { 
    type: Date, 
    default: Date.now, 
    required: true,
    index: true
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { 
  timestamps: false  // Pas besoin de timestamps automatiques, on a performedAt
});

// Indexes composés pour requêtes fréquentes
InvoiceAuditSchema.index({ invoiceId: 1, performedAt: -1 });
InvoiceAuditSchema.index({ userId: 1, action: 1, performedAt: -1 });
InvoiceAuditSchema.index({ performedAt: -1 });  // Pour cleanup des vieux logs

// Méthode statique helper pour logger une action
InvoiceAuditSchema.statics.logAction = async function(
  invoiceId: string,
  userId: string,
  action: string,
  performedBy: string,
  changes: IInvoiceChange[] = [],
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>
) {
  try {
    const auditEntry = new this({
      invoiceId,
      userId,
      action,
      changes,
      performedBy,
      ipAddress,
      userAgent,
      metadata,
      performedAt: new Date(),
    });
    
    await auditEntry.save();
    console.log(`📝 Audit log créé: ${action} sur facture ${invoiceId}`);
    return auditEntry;
  } catch (error) {
    console.error('❌ Erreur création audit log:', error);
    // Ne pas bloquer l'opération principale si audit échoue
    return null;
  }
};

export default mongoose.models.InvoiceAudit || mongoose.model<IInvoiceAudit>('InvoiceAudit', InvoiceAuditSchema);
