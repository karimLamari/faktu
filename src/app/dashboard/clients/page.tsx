import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';
import User from '@/models/User';
import ClientList from '@/components/clients/ClientList';
import { redirect } from 'next/navigation';

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  await dbConnect();
  const clients = await Client.find({ userId: session.user.id }).sort({ 'companyInfo.legalName': 1, name: 1 }).lean();
  const user = await User.findById(session.user.id).lean() as any;
  
  // Vérifier si le profil est complet
  const isProfileComplete = !!(
    user?.companyName &&
    user?.legalForm &&
    user?.address?.street &&
    user?.address?.city &&
    user?.address?.zipCode
  );
  
  // Conversion ObjectId en string pour le composant client
  const clientsData = clients.map((client: any) => ({
    ...client,
    _id: client._id.toString(),
    userId: client.userId.toString(),
    // Convertir les _id des contracts aussi
    contracts: client.contracts?.map((contract: any) => ({
      ...contract,
      _id: contract._id?.toString(),
    })) || [],
  }));
  return (
    <ClientList initialClients={clientsData} isProfileComplete={isProfileComplete} />
  );
}
