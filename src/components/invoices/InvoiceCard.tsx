import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IInvoice } from "@/models/Invoice";
import { Calendar, Euro, FileText, Mail, Bell, Trash2, Edit, Download } from "lucide-react";

interface InvoiceCardProps {
  invoice: IInvoice;
  clientName: string;
  statusColor: string;
  onEdit: (invoice: IInvoice) => void;
  onDelete: (invoice: IInvoice) => void;
  onPDF: (id: string) => void;
  onSendEmail?: (invoice: IInvoice) => void;
  onSendReminder?: (invoice: IInvoice) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ 
  invoice, 
  clientName, 
  statusColor, 
  onEdit, 
  onDelete, 
  onPDF,
  onSendEmail,
  onSendReminder,
}) => {
  const canSendEmail = invoice.status === 'draft' || !invoice.sentAt;
  const canSendReminder = ['sent', 'overdue', 'partially_paid'].includes(invoice.status) && invoice.paymentStatus !== 'paid';
  const reminderCount = invoice.reminders?.length || 0;

  // Configuration des couleurs par statut
  const statusConfig = {
    draft: { color: 'bg-gray-500', bgLight: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '📝' },
    sent: { color: 'bg-indigo-600', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '📨' },
    paid: { color: 'bg-green-600', bgLight: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '✅' },
    overdue: { color: 'bg-red-600', bgLight: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '⚠️' },
    partially_paid: { color: 'bg-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '⏳' },
  };

  const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <Card className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl transition-all duration-200 hover:shadow-lg">
      {/* Barre de statut colorée en haut */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${config.color}`} />
      
      <div className="p-6">
        {/* Header avec numéro et badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
              #{String(invoice.invoiceNumber).slice(-3)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{invoice.invoiceNumber}</h3>
              <Badge className={`${config.bgLight} ${config.text} border ${config.border} text-xs font-semibold`}>
                {config.icon} {invoice.status}
              </Badge>
            </div>
          </div>
          {reminderCount > 0 && (
            <Badge variant="outline" className="text-xs font-semibold border-orange-200 bg-orange-50 text-orange-700">
              <Bell className="w-3 h-3 mr-1" />
              {reminderCount}
            </Badge>
          )}
        </div>

        {/* Informations principales */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{clientName}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div className="text-xs">
                <p className="text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">
                  {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('fr-FR') : "-"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-orange-400" />
              <div className="text-xs">
                <p className="text-gray-500">Échéance</p>
                <p className="font-semibold text-gray-900">
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Montant en grand */}
          <div className={`${config.bgLight} rounded-xl p-4 border ${config.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Montant</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(invoice.total || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
          </div>

          {/* Info envoi */}
          {invoice.sentAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
              <Mail className="w-3 h-3" />
              Envoyée le {new Date(invoice.sentAt).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          {/* Ligne 1: Actions email en priorité */}
          {(canSendEmail || canSendReminder) && (
            <div className={`grid ${canSendEmail && canSendReminder ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              {canSendEmail && onSendEmail && (
                <Button 
                  size="sm" 
                  className="rounded-xl bg-indigo-600 hover:bg-blue-700 text-white shadow-md font-semibold"
                  onClick={() => onSendEmail(invoice)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              )}
              {canSendReminder && onSendReminder && (
                <Button 
                  size="sm"
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md font-semibold"
                  onClick={() => onSendReminder(invoice)}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Relancer
                </Button>
              )}
            </div>
          )}
          
          {/* Ligne 2: Actions secondaires */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all font-medium"
              onClick={() => onEdit(invoice)}
            >
              <Edit className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 rounded-xl hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all font-medium"
              onClick={() => onPDF(invoice._id?.toString() || "")}
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all px-3"
              onClick={() => onDelete(invoice)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InvoiceCard;
