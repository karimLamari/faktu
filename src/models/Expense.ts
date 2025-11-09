import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  vendor: string;
  amount: number;
  taxAmount: number;
  date: Date;
  category: string;
  description?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  receiptImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendor: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Restaurant',
        'Transport',
        'Carburant',
        'Fournitures',
        'Logiciel',
        'Matériel',
        'Formation',
        'Téléphone',
        'Internet',
        'Loyer',
        'Assurance',
        'Autre',
      ],
      default: 'Autre',
    },
    description: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Carte bancaire', 'Espèces', 'Virement', 'Chèque', 'Autre'],
      default: 'Carte bancaire',
    },
    receiptImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour filtrer par date et catégorie
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
