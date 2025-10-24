import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Mail, Phone, MapPin, FileText, Calendar, AlertCircle, Loader2 } from "lucide-react";

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
  <form onSubmit={onSubmit} className="space-y-6">
    {/* Type de client */}
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <User className="w-4 h-4" />
        Type de client
      </Label>
      <select
        className="w-full h-12 border-2 border-gray-300 rounded-xl px-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
        name="type"
        value={form.type || "business"}
        onChange={onChange}
        required
      >
        <option value="business">🏢 Entreprise</option>
        <option value="individual">👤 Particulier</option>
      </select>
    </div>

    {/* Section Informations personnelles */}
    <div className="bg-blue-50 rounded-xl p-4 space-y-4 border border-blue-100">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600" />
        {form.type === 'business' ? 'Contact principal' : 'Informations personnelles'}
      </h3>
      
      {form.type === 'individual' ? (
        // Pour les particuliers: Prénom + Nom requis
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              Prénom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={form.firstName || ""}
              onChange={onChange}
              required
              className="h-11 rounded-xl"
              placeholder="Jean"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Nom de famille <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={form.lastName || ""}
              onChange={onChange}
              required
              className="h-11 rounded-xl"
              placeholder="Dupont"
            />
          </div>
        </div>
      ) : (
        // Pour les entreprises: Nom du contact optionnel
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Nom du contact principal (optionnel)
          </Label>
          <Input
            id="name"
            name="name"
            value={form.name || ""}
            onChange={onChange}
            className="h-11 rounded-xl"
            placeholder="Jean Dupont"
          />
        </div>
      )}
    </div>

    {/* Section Contact */}
    <div className="bg-green-50 rounded-xl p-4 space-y-4 border border-green-100">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Mail className="w-4 h-4 text-green-600" />
        Coordonnées de contact
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Mail className="w-3 h-3" />
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={form.email || ""}
          onChange={onChange}
          className="h-11 rounded-xl"
          placeholder="contact@exemple.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Phone className="w-3 h-3" />
          Téléphone
        </Label>
        <Input
          id="phone"
          name="phone"
          value={form.phone || ""}
          onChange={onChange}
          className="h-11 rounded-xl"
          placeholder="+33 6 12 34 56 78"
        />
      </div>
    </div>

    {/* Section Adresse */}
    <div className="bg-orange-50 rounded-xl p-4 space-y-4 border border-orange-100">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-orange-600" />
        Adresse
      </h3>
      
      <div className="space-y-3">
        <Input
          name="address.street"
          value={form.address?.street || ""}
          onChange={onChange}
          placeholder="Numéro et rue"
          className="h-11 rounded-xl"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="address.zipCode"
            value={form.address?.zipCode || ""}
            onChange={onChange}
            placeholder="Code postal"
            className="h-11 rounded-xl"
          />
          <Input
            name="address.city"
            value={form.address?.city || ""}
            onChange={onChange}
            placeholder="Ville"
            className="h-11 rounded-xl"
          />
        </div>
        
        <Input
          name="address.country"
          value={form.address?.country || ""}
          onChange={onChange}
          placeholder="Pays"
          className="h-11 rounded-xl"
        />
      </div>
    </div>

    {/* Section Entreprise (conditionnelle) */}
    {form.type === 'business' && (
      <div className="bg-purple-50 rounded-xl p-4 space-y-4 border border-purple-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-600" />
          Informations société
        </h3>
        
        <div className="space-y-3">
          <Input
            name="companyInfo.legalName"
            value={form.companyInfo?.legalName || ""}
            onChange={onChange}
            placeholder="Raison sociale"
            className="h-11 rounded-xl"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              name="companyInfo.siret"
              value={form.companyInfo?.siret || ""}
              onChange={onChange}
              placeholder="SIRET"
              className="h-11 rounded-xl"
            />
            <Input
              name="companyInfo.vatNumber"
              value={form.companyInfo?.vatNumber || ""}
              onChange={onChange}
              placeholder="N° TVA Intracommunautaire"
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      </div>
    )}

    {/* Section Paramètres */}
    <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-600" />
        Paramètres
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="paymentTerms" className="text-sm font-medium text-gray-700">
          Conditions de paiement (jours)
        </Label>
        <Input
          id="paymentTerms"
          name="paymentTerms"
          type="number"
          min={0}
          value={form.paymentTerms || 30}
          onChange={onChange}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FileText className="w-3 h-3" />
          Notes
        </Label>
        <Input
          id="notes"
          name="notes"
          value={form.notes || ""}
          onChange={onChange}
          className="h-11 rounded-xl"
          placeholder="Notes internes..."
        />
      </div>

      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={form.isActive ?? true}
          onChange={onChange}
          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Client actif
        </label>
      </div>
    </div>

    {/* Message d'erreur */}
    {error && (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <span className="text-sm font-medium text-red-800">{error}</span>
      </div>
    )}

    {/* Actions */}
    <div className="flex gap-3 pt-4 border-t border-gray-200">
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
          className="flex-1 h-12 rounded-xl border-2"
        >
          {cancelLabel}
        </Button>
      )}
      <Button 
        type="submit" 
        disabled={loading}
        className={`flex-1 h-12 rounded-xl ${isEdit ? 'bg-indigo-600 hover:bg-blue-700 shadow-md' : 'bg-green-600 hover:bg-green-700 shadow-md'}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Enregistrement...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  </form>
);

export default ClientForm;
