'use client';

import ExpenseCard from './ExpenseCard';

interface ExpenseListProps {
  expenses: any[];
  onEdit: (expense: any) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-8xl mb-6 animate-bounce">📸</div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Aucune dépense pour le moment
        </h3>
        <p className="text-gray-400 text-center max-w-md mb-6">
          Commencez à photographier vos factures pour suivre vos dépenses automatiquement !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense._id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
