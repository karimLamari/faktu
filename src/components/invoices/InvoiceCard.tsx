import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IInvoice } from "@/models/Invoice";

interface InvoiceCardProps {
  invoice: IInvoice;
  clientName: string;
  statusColor: string;
  onEdit: (invoice: IInvoice) => void;
  onDelete: (invoice: IInvoice) => void;
  onPDF: (id: string) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, clientName, statusColor, onEdit, onDelete, onPDF }) => {
  return (
    <Card className="p-4 flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-lg mb-1">{invoice.invoiceNumber}</h3>
        <p className="text-sm text-gray-600">Client : {clientName}</p>
        <p className="text-sm text-gray-600">Date : {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : ""}</p>
        <p className="text-sm text-gray-600">Montant : {invoice.total?.toFixed(2) || ""} €</p>
        <p className="text-sm text-gray-600">Échéance : {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ""}</p>
        <Badge className={statusColor}>{invoice.status}</Badge>
        <div className="mt-2">
          <span className="text-xs text-gray-500">Statut paiement : <span className="font-semibold">{invoice.paymentStatus}</span></span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button size="sm" variant="outline" onClick={() => onEdit(invoice)}>Modifier</Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(invoice)}>Supprimer</Button>
        <Button size="sm" variant="outline" onClick={() => onPDF(invoice._id?.toString() || "")}>PDF</Button>
      </div>
    </Card>
  );
};

export default InvoiceCard;
