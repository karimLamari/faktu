import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ClientFormProps = {
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  error?: string | null;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isEdit?: boolean;
};

const ClientForm: React.FC<ClientFormProps> = ({
  form,
  onChange,
  onSubmit,
  loading,
  error,
  onCancel,
  submitLabel = "Ajouter",
  cancelLabel = "Annuler",
  isEdit = false,
}) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <div>
      <label className="block text-sm font-medium">Type</label>
      <select
        className="w-full border rounded px-2 py-1"
        name="type"
        value={form.type || "business"}
        onChange={onChange}
        required
      >
        <option value="business">Entreprise</option>
        <option value="individual">Particulier</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium">Nom</label>
      <input
        className="w-full border rounded px-2 py-1"
        name="name"
        value={form.name || ""}
        onChange={onChange}
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Prénom</label>
      <input
        className="w-full border rounded px-2 py-1"
        name="firstName"
        value={form.firstName || ""}
        onChange={onChange}
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Nom de famille</label>
      <input
        className="w-full border rounded px-2 py-1"
        name="lastName"
        value={form.lastName || ""}
        onChange={onChange}
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Email</label>
      <input
        className="w-full border rounded px-2 py-1"
        name="email"
        value={form.email || ""}
        onChange={onChange}
        type="email"
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Téléphone</label>
      <input
        className="w-full border rounded px-2 py-1"
        name="phone"
        value={form.phone || ""}
        onChange={onChange}
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Adresse</label>
      <input
        className="w-full border rounded px-2 py-1 mb-1"
        name="address.street"
        value={form.address?.street || ""}
        onChange={onChange}
        placeholder="Rue"
      />
      <input
        className="w-full border rounded px-2 py-1 mb-1"
        name="address.zipCode"
        value={form.address?.zipCode || ""}
        onChange={onChange}
        placeholder="Code postal"
      />
      <input
        className="w-full border rounded px-2 py-1 mb-1"
        name="address.city"
        value={form.address?.city || ""}
        onChange={onChange}
        placeholder="Ville"
      />
      <input
        className="w-full border rounded px-2 py-1"
        name="address.country"
        value={form.address?.country || ""}
        onChange={onChange}
        placeholder="Pays"
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Société (optionnel)</label>
      <input
        className="w-full border rounded px-2 py-1 mb-1"
        name="companyInfo.legalName"
        value={form.companyInfo?.legalName || ""}
        onChange={onChange}
        placeholder="Raison sociale"
      />
      <input
        className="w-full border rounded px-2 py-1 mb-1"
        name="companyInfo.siret"
        value={form.companyInfo?.siret || ""}
        onChange={onChange}
        placeholder="SIRET"
      />
      <input
        className="w-full border rounded px-2 py-1"
        name="companyInfo.vatNumber"
        value={form.companyInfo?.vatNumber || ""}
        onChange={onChange}
        placeholder="N° TVA"
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Conditions de paiement (jours)</label>
      <input
        className="w-full border rounded px-2 py-1"
        name="paymentTerms"
        type="number"
        min={0}
        value={form.paymentTerms || 30}
        onChange={onChange}
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Notes</label>
      <input
        className="w-full border rounded px-2 py-1"
        name="notes"
        value={form.notes || ""}
        onChange={onChange}
      />
    </div>
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="isActive"
        name="isActive"
        checked={form.isActive ?? true}
        onChange={onChange}
      />
      <label htmlFor="isActive" className="text-sm">Actif</label>
    </div>
    {error && <div className="text-red-600">{error}</div>}
    <div className="flex gap-2 justify-end">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
      )}
      <Button type="submit" variant="default" disabled={loading}>{submitLabel}</Button>
    </div>
  </form>
);

export default ClientForm;
