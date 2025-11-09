import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import ExpenseManagement from '@/components/expenses/ExpenseManagement';
import connectDB from '@/lib/db/mongodb';
import Expense from '@/models/Expense';

export const metadata = {
  title: 'Mes Dépenses | blink',
  description: 'Gérez vos dépenses avec OCR automatique',
};

export default async function ExpensesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Récupérer les dépenses côté serveur
  await connectDB();
  const expenses = await Expense.find({ userId: session.user.id })
    .sort({ date: -1 })
    .lean();

  // Sérialiser les données pour correspondre au type Expense du service
  const serializedExpenses = expenses.map(exp => ({
    _id: exp._id.toString(),
    userId: exp.userId.toString(),
    vendor: exp.vendor,
    amount: exp.amount,
    taxAmount: exp.taxAmount || 0,
    date: exp.date.toISOString(),
    category: exp.category,
    description: exp.description,
    invoiceNumber: exp.invoiceNumber,
    paymentMethod: exp.paymentMethod,
    receiptImage: exp.receiptImage,
    createdAt: exp.createdAt?.toISOString(),
    updatedAt: exp.updatedAt?.toISOString(),
  }));

  return <ExpenseManagement initialExpenses={serializedExpenses as any} />;
}
