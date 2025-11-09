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
      <Label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <User className="w-4 h-4" />
        Type de client
      </Label>
      <select
        className="w-full h-10 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        name="type"
        value={form.type || "individual"}
        onChange={onChange}
        required
      >
        <option value="business" className="bg-gray-800">Entreprise</option>
        <option value="individual" className="bg-gray-800">Particulier</option>
      </select>
    </div>

    {/* Section Informations personnelles */}
    <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <User className="w-4 h-4 text-blue-400" />
        {form.type === 'individual' ? 'Informations personnelles' : 'Contact principal'}
      </h3>
      
      {form.type === 'business' ? (
        // Pour les entreprises: Nom du contact optionnel
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-300">
            Nom du contact principal (optionnel)
          </Label>
          <Input
            id="name"
            name="name"
            value={form.name || ""}
            onChange={onChange}
            placeholder="Jean Dupont"
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
      ) : (
        // Pour les particuliers: Prénom + Nom requis
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-300">
              Prénom <span className="text-red-400">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={form.firstName || ""}
              onChange={onChange}
              required
              placeholder="Jean"
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-300">
              Nom de famille <span className="text-red-400">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={form.lastName || ""}
              onChange={onChange}
              required
              placeholder="Dupont"
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      )}
    </div>

    {/* Section Contact */}
    <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <Mail className="w-4 h-4 text-blue-400" />
        Coordonnées de contact
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-300">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={form.email || ""}
          onChange={onChange}
          placeholder="contact@exemple.com"
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-300">
          Téléphone
        </Label>
        <Input
          id="phone"
          name="phone"
          value={form.phone || ""}
          onChange={onChange}
          placeholder="+33 6 12 34 56 78"
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>
    </div>

    {/* Section Adresse */}
    <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <MapPin className="w-4 h-4 text-blue-400" />
        Adresse
      </h3>
      
      <div className="space-y-3">
        <Input
          name="address.street"
          value={form.address?.street || ""}
          onChange={onChange}
          placeholder="Numéro et rue"
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="address.zipCode"
            value={form.address?.zipCode || ""}
            onChange={onChange}
            placeholder="Code postal"
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
          />
          <Input
            name="address.city"
            value={form.address?.city || ""}
            onChange={onChange}
            placeholder="Ville"
            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        
        <Input
          name="address.country"
          value={form.address?.country || ""}
          onChange={onChange}
          placeholder="Pays"
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>
    </div>

    {/* Section Entreprise (conditionnelle) */}
    {form.type === 'business' && (
      <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          Informations société
        </h3>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="companyInfo.legalName" className="text-sm font-medium text-gray-300">
              Raison sociale <span className="text-red-400">*</span>
            </Label>
            <Input
              id="companyInfo.legalName"
              name="companyInfo.legalName"
              value={form.companyInfo?.legalName || ""}
              onChange={onChange}
              placeholder="SARL DUPONT Consulting"
              required
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyInfo.siret" className="text-sm font-medium text-gray-300">
              SIRET <span className="text-red-400">*</span>
            </Label>
            <Input
              id="companyInfo.siret"
              name="companyInfo.siret"
              value={form.companyInfo?.siret || ""}
              onChange={onChange}
              placeholder="14 chiffres"
              maxLength={14}
              required
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>
    )}

    {/* Section Paramètres */}
    <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <Calendar className="w-4 h-4 text-blue-400" />
        Paramètres
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentTerms" className="text-sm font-medium text-gray-300">
            Conditions de paiement (jours)
          </Label>
          <Input
            id="paymentTerms"
            name="paymentTerms"
            type="number"
            min={0}
            value={form.paymentTerms || 30}
            onChange={onChange}
            className="bg-gray-800/50 border-gray-700 text-white"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={form.isActive ?? true}
            onChange={onChange}
            className="w-4 h-4 rounded border-gray-700 text-blue-600 focus:ring-blue-500 bg-gray-800"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
            Client actif
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-gray-300">
          Notes internes
        </Label>
        <Input
          id="notes"
          name="notes"
          value={form.notes || ""}
          onChange={onChange}
          placeholder="Notes internes..."
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>
    </div>

    {/* Message d'erreur */}
    {error && (
      <div className="flex items-center gap-3 p-4 bg-red-900/30 rounded-lg border border-red-700/50 animate-pulse">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <span className="text-sm font-medium text-red-300">{error}</span>
      </div>
    )}

    {/* Actions */}
    <div className="flex gap-3 pt-6 border-t border-gray-700/50">
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
          className="flex-1 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
        >
          {cancelLabel}
        </Button>
      )}
      <Button 
        type="submit" 
        disabled={loading}
        className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-lg shadow-indigo-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
