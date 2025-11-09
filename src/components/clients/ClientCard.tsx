
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
  const initials = (client.name || "?")
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card className="group relative overflow-hidden bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50 transition-all duration-200">
      {/* Barre de couleur en haut */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
      
      <div className="p-6">
        {/* Header avec avatar */}
        <div className="flex items-start gap-4 mb-5">
          {/* Avatar avec initiales */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 flex-shrink-0">
            {initials}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white truncate mb-1">
              {client.name || 'Client'}
            </h3>
            {client.companyInfo?.siret && (
              <Badge variant="outline" className="text-xs font-semibold border-blue-700/50 bg-blue-900/30 text-blue-400 mt-2">
                <Building2 className="w-3 h-3 mr-1" />
                SIRET: {client.companyInfo.siret}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-gray-700/50">
          {/* Voir détails - Action principale */}
          <Link href={`/dashboard/clients/${client._id}`} className="block">
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg shadow-indigo-500/20 font-semibold"
              disabled={loading}
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir le client
            </Button>
          </Link>

          {/* Nouvelle facture */}
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20 font-medium"
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
              className="rounded-xl bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-blue-900/30 hover:text-blue-400 hover:border-blue-600 font-medium"
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
              className="rounded-xl bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-400 hover:border-red-600 font-medium"
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
