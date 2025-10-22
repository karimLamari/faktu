
import type { Client } from "./ClientList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  return (
    <Card className="p-4 flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-lg mb-1">{client.name}</h3>
        <p className="text-sm text-gray-600">{client.email}</p>
        <p className="text-sm text-gray-600">{client.phone}</p>
        {address && <p className="text-sm text-gray-600">{address}</p>}
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(client)} disabled={loading}>Modifier</Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNewInvoice(client)}
        >
          Nouvelle facture
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(client._id)} disabled={loading}>
          Supprimer
        </Button>
      </div>
    </Card>
  );
};

export default ClientCard;
