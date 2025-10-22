import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Client from '@/models/Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ClientList from '@/components/clients/ClientList';
import { redirect } from 'next/navigation';

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  await dbConnect();
  const clients = await Client.find({ userId: session.user.id }).sort({ 'companyInfo.legalName': 1, name: 1 }).lean();
  // Conversion ObjectId en string pour le composant client
  const clientsData = clients.map((client: any) => ({
    ...client,
    _id: client._id.toString(),
    userId: client.userId.toString(),
  }));
  return (
    <DashboardLayout>
      <ClientList initialClients={clientsData} />
    </DashboardLayout>
  );
}
