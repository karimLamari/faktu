import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  setForm: (f: any) => void;
  formError: string | null;
  formLoading: boolean;
  clients: { _id: string; name: string }[];
  editMode: boolean;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  formError,
  formLoading,
  clients,
  editMode,
  handleFormChange,
}) => {
  if (!open) return null;

  // Calcul automatique à chaque changement d'items
  useEffect(() => {
    if (!form?.items || !Array.isArray(form.items)) return;
    let subtotal = 0;
    let taxAmount = 0;
    form.items.forEach((item: any) => {
      const q = parseFloat(item.quantity) || 0;
      const up = parseFloat(item.unitPrice) || 0;
      const tva = parseFloat(item.taxRate) || 0;
      const ht = q * up;
      subtotal += ht;
      taxAmount += ht * (tva / 100);
    });
    const total = subtotal + taxAmount;
    const amountPaid = typeof form.amountPaid === 'number' ? form.amountPaid : 0;
    const balanceDue = total - amountPaid;
    if (
      form.subtotal !== subtotal ||
      form.taxAmount !== taxAmount ||
      form.total !== total ||
      form.balanceDue !== balanceDue
    ) {
      setForm({ ...form, subtotal, taxAmount, total, balanceDue });
    }
    // eslint-disable-next-line
  }, [form?.items, form?.amountPaid]);

  // Handler pour changer un champ d'item
  const handleItemChange = (idx: number, field: string, value: any) => {
    const items = form.items ? [...form.items] : [];
    let v = value;
    // Forcer le type number pour les champs numériques
    if (["quantity", "unitPrice", "taxRate"].includes(field)) {
      v = value === "" ? "" : Number(value);
    }
    items[idx] = { ...items[idx], [field]: v };
    setForm({ ...form, items });
  };

  // Ajouter une ligne
  const addItem = () => {
    const items = form.items ? [...form.items] : [];
    items.push({ description: "", quantity: 1, unitPrice: 0, taxRate: 0, unit: "unit" });
    setForm({ ...form, items });
  };
  // Supprimer une ligne
  const removeItem = (idx: number) => {
    const items = form.items ? [...form.items] : [];
    items.splice(idx, 1);
    setForm({ ...form, items });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{editMode ? "Modifier la facture" : "Nouvelle facture"}</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Client</label>
            <select
              className="w-full border rounded px-2 py-1"
              name="clientId"
              value={form?.clientId || ""}
              onChange={handleFormChange}
              required
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Date d'émission</label>
              <input
                className="w-full border rounded px-2 py-1"
                name="issueDate"
                type="date"
                value={
                  form?.issueDate
                    ? (typeof form.issueDate === 'string'
                        ? form.issueDate.slice(0, 10)
                        : new Date(form.issueDate).toISOString().slice(0, 10))
                    : ""
                }
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date d'échéance</label>
              <input
                className="w-full border rounded px-2 py-1"
                name="dueDate"
                type="date"
                value={
                  form?.dueDate
                    ? (typeof form.dueDate === 'string'
                        ? form.dueDate.slice(0, 10)
                        : new Date(form.dueDate).toISOString().slice(0, 10))
                    : ""
                }
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
          {/* Items dynamiques */}
          <div className="border rounded p-2 mt-2">
            <label className="block text-sm font-medium mb-1">Lignes de facture</label>
            {form.items && form.items.length > 0 ? (
              form.items.map((item: any, idx: number) => (
                <div key={idx} className="mb-2 border-b pb-2 last:border-b-0 last:pb-0">
                  <div className="flex gap-2 mb-1">
                    <input
                      className="flex-1 border rounded px-2 py-1"
                      placeholder="Description"
                      value={item.description || ""}
                      onChange={e => handleItemChange(idx, "description", e.target.value)}
                      required
                    />
                    <button type="button" className="text-red-500 px-2" onClick={() => removeItem(idx)} title="Supprimer la ligne" disabled={form.items.length === 1}>×</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      className="border rounded px-2 py-1"
                      type="number"
                      min="0.001"
                      step="0.001"
                      placeholder="Qté"
                      value={item.quantity ?? ""}
                      onChange={e => handleItemChange(idx, "quantity", e.target.value)}
                      required
                    />
                    <input
                      className="border rounded px-2 py-1"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="PU"
                      value={item.unitPrice ?? ""}
                      onChange={e => handleItemChange(idx, "unitPrice", e.target.value)}
                      required
                    />
                    <input
                      className="border rounded px-2 py-1"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="TVA %"
                      value={item.taxRate ?? ""}
                      onChange={e => handleItemChange(idx, "taxRate", e.target.value)}
                      required
                    />
                    <select
                      className="border rounded px-2 py-1"
                      value={item.unit || "unit"}
                      onChange={e => handleItemChange(idx, "unit", e.target.value)}
                      required
                    >
                      <option value="unit">Unité</option>
                      <option value="hour">Heure</option>
                      <option value="day">Jour</option>
                      <option value="month">Mois</option>
                      <option value="kg">Kg</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm">Aucune ligne. Ajoutez-en une.</div>
            )}
            <button type="button" className="mt-2 px-3 py-1 bg-blue-100 rounded text-blue-700 text-sm" onClick={addItem}>+ Ajouter une ligne</button>
          </div>
          {/* Calculs automatiques */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <label className="block text-xs">Sous-total</label>
              <input
                className="w-full border rounded px-2 py-1 bg-gray-100"
                name="subtotal"
                type="number"
                value={form?.subtotal || 0}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs">TVA</label>
              <input
                className="w-full border rounded px-2 py-1 bg-gray-100"
                name="taxAmount"
                type="number"
                value={form?.taxAmount || 0}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs">Total</label>
              <input
                className="w-full border rounded px-2 py-1 bg-gray-100"
                name="total"
                type="number"
                value={form?.total || 0}
                readOnly
              />
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              className="w-full border rounded px-2 py-1"
              name="notes"
              value={form?.notes || ""}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          {formError && <div className="text-red-600">{formError}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={formLoading}>Annuler</Button>
            <Button type="submit" variant="default" disabled={formLoading}>{editMode ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
