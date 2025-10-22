"use client";

import { useState } from "react";
import { z } from "zod";
import { invoiceSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { EmptyStateButton } from "@/components/ui/EmptyStateButton";
import { Table } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IInvoice } from "@/models/Invoice";
import InvoiceFormModal from "./InvoiceFormModal";

interface InvoiceListProps {
  initialInvoices: IInvoice[];
  clients: { _id: string; name: string; companyInfo?: { legalName?: string } }[];
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-200 text-gray-800",
  sent: "bg-blue-200 text-blue-800",
  paid: "bg-green-200 text-green-800",
  overdue: "bg-red-200 text-red-800",
  cancelled: "bg-yellow-200 text-yellow-800",
};

export function InvoiceList({ initialInvoices, clients }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<IInvoice[]>(initialInvoices);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [notif, setNotif] = useState<string>("");
  // Formulaire modal state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editInvoice, setEditInvoice] = useState<IInvoice | null>(null);

  // Listener pour ouverture modale depuis ClientList
  useState(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: any) => {
      const clientId = e.detail?.clientId || clients[0]?._id || "";
      setForm({
        clientId,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
        items: [],
        status: "draft",
      });
      setEditInvoice(null);
      setFormError(null);
      setShowForm(true);
    };
    window.addEventListener('open-invoice-modal', handler);
    return () => window.removeEventListener('open-invoice-modal', handler);
  });

  const openNew = () => {
    setForm({
      clientId: clients[0]?._id || "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: [],
      status: "draft",
    });
    setEditInvoice(null);
    setFormError(null);
    setShowForm(true);
  };
  const openEdit = (inv: IInvoice) => {
    setForm({ ...inv });
    setEditInvoice(inv);
    setFormError(null);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setForm(null);
    setEditInvoice(null);
    setFormError(null);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      // Calcul de balanceDue si absent (fallback sécurité)
      let payload = { ...form };
      if (typeof payload.balanceDue !== 'number') {
        const total = typeof payload.total === 'number' ? payload.total : 0;
        const amountPaid = typeof payload.amountPaid === 'number' ? payload.amountPaid : 0;
        payload.balanceDue = total - amountPaid;
      }
      invoiceSchema.parse(payload); // validation Zod
      const method = editInvoice ? "PATCH" : "POST";
      const url = editInvoice ? `/api/invoices/${editInvoice._id}` : "/api/invoices";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }
      const saved = await res.json();
      if (editInvoice) {
        setInvoices((prev: IInvoice[]) => prev.map((i) => (i._id === saved._id ? { ...i, ...saved } : i)));
        setNotif("Facture modifiée");
      } else {
        setInvoices((prev: IInvoice[]) => [saved, ...prev]);
        setNotif("Facture créée");
      }
      closeForm();
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setFormLoading(false);
    }
  };

  // ...

  return (
    <div>
      {invoices.length === 0 ? (
        <EmptyStateButton
          label="Nouvelle facture"
          onClick={openNew}
          color="blue"
          description="Aucune facture pour l'instant. Créez-en une pour commencer !"
        />
      ) : (
        <div>
          <Button onClick={openNew} className="mb-4">Nouvelle facture</Button>
          {notif && <div className="mb-2 text-green-600">{notif}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoices
              .filter((inv) => {
                if (!search) return true;
                const client = clients.find((c) => c._id.toString() === inv.clientId?.toString());
                const clientName = client?.companyInfo?.legalName || client?.name || "";
                return (
                  inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
                  clientName.toLowerCase().includes(search.toLowerCase())
                );
              })
              .map((inv) => {
                const client = clients.find((c) => c._id.toString() === inv.clientId?.toString());
                const clientName = client?.companyInfo?.legalName || client?.name || "";
                return (
                  <Card key={inv._id?.toString() || inv.invoiceNumber} className="p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{inv.invoiceNumber}</h3>
                      <p className="text-sm text-gray-600">Client : {clientName}</p>
                      <p className="text-sm text-gray-600">Date : {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : ""}</p>
                      <p className="text-sm text-gray-600">Montant : {inv.total?.toFixed(2) || ""} €</p>
                      <p className="text-sm text-gray-600">Échéance : {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : ""}</p>
                      <Badge className={statusColors[inv.status] || "bg-gray-100 text-gray-800"}>{inv.status}</Badge>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Statut paiement : <span className="font-semibold">{inv.paymentStatus}</span></span>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openEdit(inv)}>Modifier</Button>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        if (!inv._id) return;
                        if (!window.confirm("Supprimer cette facture ?")) return;
                        try {
                          const res = await fetch(`/api/invoices/${inv._id}`, { method: "DELETE" });
                          if (!res.ok) {
                            const data = await res.json();
                            throw new Error(data.error || "Erreur lors de la suppression");
                          }
                          setInvoices((prev) => prev.filter((i) => i._id !== inv._id));
                          setNotif("Facture supprimée avec succès.");
                        } catch (e: any) {
                          alert(e.message || "Erreur inconnue lors de la suppression");
                        }
                      }}>Supprimer</Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportPDF(inv._id?.toString() || "")}>PDF</Button>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}
      <InvoiceFormModal
        open={showForm}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        form={form}
        setForm={setForm}
        formError={formError}
        formLoading={formLoading}
        clients={clients}
        editMode={!!editInvoice}
        handleFormChange={handleFormChange}
      />
        {/* Ajout des champs paymentStatus et paymentMethod dans le formulaire modal */}
    </div>
  );
}

// Helper functions must be after the InvoiceList component


export function handleExportPDF(id: string) {
  // Ouvre le PDF dans un nouvel onglet
  if (!id) return;
  const url = `/api/invoices/${id}/pdf`;
  window.open(url, '_blank');
}
