import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { redirect } from 'next/navigation';

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }
  await dbConnect();
  const invoices = await Invoice.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  const clients = await Client.find({ userId: session.user.id }).lean();
  // Conversion ObjectId en string pour le composant
  const invoicesData = invoices.map((invoice: any) => ({
    ...invoice,
    _id: invoice._id.toString(),
    userId: invoice.userId.toString(),
    clientId: invoice.clientId?.toString() || null,
  }));
  const clientsData = clients.map((client: any) => ({
    ...client,
    _id: client._id.toString(),
    userId: client.userId.toString(),
  }));
  return (
    <DashboardLayout>
      <InvoiceList initialInvoices={invoicesData} clients={clientsData} />
    </DashboardLayout>
  );
}
