'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FiShoppingBag, 
  FiTruck, 
  FiDroplet, 
  FiPackage, 
  FiMonitor, 
  FiTool, 
  FiBook, 
  FiSmartphone, 
  FiWifi, 
  FiHome, 
  FiShield, 
  FiFileText,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiCreditCard,
  FiHash,
  FiX
} from 'react-icons/fi';

interface ExpenseCardProps {
  expense: {
    _id: string;
    vendor: string;
    amount: number;
    taxAmount: number;
    date: string;
    category: string;
    description?: string;
    invoiceNumber?: string;
    paymentMethod: string;
    receiptImage: string;
  };
  onEdit: (expense: any) => void;
  onDelete: (id: string) => void;
}

const categoryIcons: Record<string, any> = {
  Restaurant: FiShoppingBag,
  Transport: FiTruck,
  Carburant: FiDroplet,
  Fournitures: FiPackage,
  Logiciel: FiMonitor,
  Matériel: FiTool,
  Formation: FiBook,
  Téléphone: FiSmartphone,
  Internet: FiWifi,
  Loyer: FiHome,
  Assurance: FiShield,
  Autre: FiFileText,
};

const categoryColors: Record<string, string> = {
  Restaurant: 'bg-orange-500',
  Transport: 'bg-blue-500',
  Carburant: 'bg-yellow-500',
  Fournitures: 'bg-purple-500',
  Logiciel: 'bg-indigo-500',
  Matériel: 'bg-gray-500',
  Formation: 'bg-green-500',
  Téléphone: 'bg-pink-500',
  Internet: 'bg-cyan-500',
  Loyer: 'bg-teal-500',
  Assurance: 'bg-blue-600',
  Autre: 'bg-gray-600',
};

export default function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const [showImage, setShowImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Supprimer la dépense "${expense.vendor}" ?`)) return;
    
    setIsDeleting(true);
    try {
      await onDelete(expense._id);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const CategoryIcon = categoryIcons[expense.category] || FiFileText;

  return (
    <>
      <div className="group bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-200 overflow-hidden border border-gray-700/50">
        {/* Header with solid color */}
        <div className={`${categoryColors[expense.category] || categoryColors.Autre} p-4 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CategoryIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                {expense.category}
              </span>
            </div>
            <span className="text-lg font-bold">
              {expense.amount.toFixed(2)} €
            </span>
          </div>
          <h3 className="font-bold text-lg truncate">{expense.vendor}</h3>
        </div>

        {/* Receipt Image Thumbnail */}
        <div 
          className="relative h-40 bg-gray-800 cursor-pointer group/image"
          onClick={() => setShowImage(true)}
        >
          <Image
            src={expense.receiptImage}
            alt={expense.vendor}
            fill
            className="object-cover group-hover/image:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover/image:opacity-100 font-semibold text-sm bg-black/50 px-4 py-2 rounded-full flex items-center gap-2">
              <FiFileText className="w-4 h-4" /> Voir la facture
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-2">
              <FiCalendar className="w-4 h-4" /> {formatDate(expense.date)}
            </span>
            <span className="text-gray-400 flex items-center gap-2">
              <FiCreditCard className="w-4 h-4" /> {expense.paymentMethod}
            </span>
          </div>

          {expense.invoiceNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
              <FiHash className="w-4 h-4" />
              <span className="font-mono">{expense.invoiceNumber}</span>
            </div>
          )}

          {expense.taxAmount > 0 && (
            <div className="flex items-center justify-between text-sm bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-700/50">
              <span className="text-blue-400">TVA incluse</span>
              <span className="font-semibold text-blue-300">{expense.taxAmount.toFixed(2)} €</span>
            </div>
          )}

          {expense.description && (
            <p className="text-sm text-gray-400 line-clamp-2 italic flex items-start gap-2">
              <FiFileText className="w-4 h-4 mt-0.5 flex-shrink-0" /> {expense.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-700/50">
            <Button
              onClick={() => onEdit(expense)}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-lg shadow-indigo-500/20"
            >
              <FiEdit2 className="w-4 h-4" /> Modifier
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20"
            >
              <FiTrash2 className="w-4 h-4" /> {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={expense.receiptImage}
              alt={expense.vendor}
              fill
              className="object-contain"
            />
            <Button
              onClick={() => setShowImage(false)}
              className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur-lg text-white hover:bg-gray-800 shadow-2xl border border-gray-700/50"
            >
              <FiX className="w-4 h-4" /> Fermer
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
