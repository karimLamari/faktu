
import type { Client } from "./ClientList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin, FileText, Edit, Trash2, User, Eye } from "lucide-react";
import Link from "next/link";

interface ClientCardProps {
  client: Client;
  loading?: boolean;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onNewInvoice: (client: Client) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, loading, onEdit, onDelete, onNewInvoice }) => {
  const address = client.address
    ? [client.address.street, client.address.zipCode, client.address.city, client.address.country]
        .filter(Boolean)
        .join(", ")
    : "";

  // Générer initiales pour l'avatar
  const initials = (client.companyInfo?.legalName || client.name || "?")
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl transition-all duration-200 hover:shadow-lg">
      {/* Barre de couleur en haut */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
      
      <div className="p-6">
        {/* Header avec avatar */}
        <div className="flex items-start gap-4 mb-5">
          {/* Avatar avec initiales */}
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
            {initials}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 truncate mb-1">
              {client.companyInfo?.legalName || client.name}
            </h3>
            {client.companyInfo?.legalName && client.name && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <User className="w-3 h-3" />
                <span className="truncate">{client.name}</span>
              </div>
            )}
            {client.companyInfo?.siret && (
              <Badge variant="outline" className="text-xs font-semibold border-blue-200 bg-blue-50 text-blue-700">
                <Building2 className="w-3 h-3 mr-1" />
                SIRET: {client.companyInfo.siret}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          {/* Voir détails - Action principale */}
          <Link href={`/dashboard/clients/${client._id}`} className="block">
            <Button
              className="w-full rounded-xl bg-indigo-600 hover:bg-blue-700 text-white shadow-md font-semibold"
              disabled={loading}
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir le client
            </Button>
          </Link>

          {/* Nouvelle facture */}
          <Button
            className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-md font-medium"
            onClick={(e) => {
              e.preventDefault();
              onNewInvoice(client);
            }}
            disabled={loading}
          >
            <FileText className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>

          {/* Actions secondaires */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl hover:bg-blue-50 hover:text-blue-600 border-gray-300 font-medium"
              onClick={(e) => {
                e.preventDefault();
                onEdit(client);
              }}
              disabled={loading}
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl hover:bg-red-50 hover:text-red-600 border-gray-300 font-medium"
              onClick={(e) => {
                e.preventDefault();
                onDelete(client._id);
              }}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ClientCard;
