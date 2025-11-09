import { auth } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import User from '@/models/User';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { redirect } from 'next/navigation';

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  await dbConnect();
  const invoices = await Invoice.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  const clients = await Client.find({ userId: session.user.id }).lean();
  const user = await User.findById(session.user.id).lean() as any;
  
  // Vérifier si le profil est complet
  const isProfileComplete = !!(
    user?.companyName &&
    user?.legalForm &&
    user?.address?.street &&
    user?.address?.city &&
    user?.address?.zipCode
  );
  
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
    email: client.email,
  }));
  
  // Préparer les données utilisateur pour le calcul de progression et l'aperçu
  const userData = {
    companyName: user?.companyName,
    legalForm: user?.legalForm,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    phone: user?.phone,
    siret: user?.siret,
    iban: user?.iban,
    bic: user?.bic,
    bankName: user?.bankName,
    bankCode: user?.bankCode,
    branchCode: user?.branchCode,
    address: user?.address ? {
      street: user.address.street,
      city: user.address.city,
      zipCode: user.address.zipCode,
      country: user.address.country,
    } : undefined,
  };
  
  return (
    <InvoiceList 
      initialInvoices={invoicesData} 
      clients={clientsData}
      isProfileComplete={isProfileComplete}
      userData={userData}
    />
  );
}
