"use client";

import { useState } from "react";
import { z } from "zod";
import { invoiceSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { EmptyStateButton } from "@/components/ui/EmptyStateButton";
import InvoiceCard from "./InvoiceCard";
import InvoiceFilters from "./InvoiceFilters";
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
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [notif, setNotif] = useState<string>("");
  
  // Formulaire modal state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editInvoice, setEditInvoice] = useState<IInvoice | null>(null);

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

  // Filtrage des factures
  const filteredInvoices = invoices.filter((inv) => {
    // Filtre par statut
    if (statusFilter && inv.status !== statusFilter) {
      return false;
    }
    
    // Filtre par recherche
    if (search) {
      const client = clients.find((c) => c._id.toString() === inv.clientId?.toString());
      const clientName = client?.companyInfo?.legalName || client?.name || "";
      const searchLower = search.toLowerCase();
      return (
        inv.invoiceNumber?.toLowerCase().includes(searchLower) ||
        clientName.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Factures</h2>
            <Button onClick={openNew}>Nouvelle facture</Button>
          </div>
          
          {notif && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">
              {notif}
            </div>
          )}

          {/* Composant de filtres */}
          <InvoiceFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onClearFilters={() => {
              setSearch('');
              setStatusFilter('');
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInvoices.map((inv) => {
              const client = clients.find((c) => c._id.toString() === inv.clientId?.toString());
              const clientName = client?.companyInfo?.legalName || client?.name || "";
              return (
                <InvoiceCard
                  key={inv._id?.toString() || inv.invoiceNumber}
                  invoice={inv}
                  clientName={clientName}
                  statusColor={statusColors[inv.status] || "bg-gray-100 text-gray-800"}
                  onEdit={openEdit}
                  onDelete={async (invoice) => {
                    if (!invoice._id) return;
                    if (!window.confirm("Supprimer cette facture ?")) return;
                    try {
                      const res = await fetch(`/api/invoices/${invoice._id}`, { method: "DELETE" });
                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || "Erreur lors de la suppression");
                      }
                      setInvoices((prev) => prev.filter((i) => i._id !== invoice._id));
                      setNotif("Facture supprimée avec succès.");
                    } catch (e: any) {
                      alert(e.message || "Erreur inconnue lors de la suppression");
                    }
                  }}
                  onPDF={handleExportPDF}
                />
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
