import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import QuoteManagement from '@/components/quotes/QuoteManagement';
import connectDB from '@/lib/db/mongodb';
import Quote from '@/models/Quote';
import Client from '@/models/Client';

export const metadata = {
  title: 'Devis | blink',
  description: 'Gérez vos devis professionnels',
};

export default async function QuotesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  await connectDB();
  
  const [quotes, clients] = await Promise.all([
    Quote.find({ userId: session.user.id })
      .populate('clientId', 'name email companyInfo')
      .sort({ createdAt: -1 })
      .lean(),
    Client.find({ userId: session.user.id })
      .select('_id name email companyInfo')
      .lean(),
  ]);

  const serializedQuotes = quotes.map((quote: any) => ({
    ...quote,
    _id: quote._id.toString(),
    userId: quote.userId.toString(),
    clientId: quote.clientId ? {
      _id: (quote.clientId as any)._id.toString(),
      name: (quote.clientId as any).name,
      email: (quote.clientId as any).email,
      companyInfo: (quote.clientId as any).companyInfo,
    } : {
      _id: 'deleted',
      name: 'Client supprimé',
      email: '',
      companyInfo: { legalName: 'Client supprimé' }
    },
    convertedToInvoiceId: quote.convertedToInvoiceId?.toString() || null,
    convertedAt: quote.convertedAt?.toISOString() || null,
    sentAt: quote.sentAt?.toISOString() || null,
    signedAt: quote.signedAt?.toISOString() || null,
    signedBy: quote.signedBy || null,
    issueDate: quote.issueDate?.toISOString(),
    validUntil: quote.validUntil?.toISOString(),
    createdAt: quote.createdAt?.toISOString(),
    updatedAt: quote.updatedAt?.toISOString(),
  }));

  const serializedClients = clients.map((client: any) => ({
    ...client,
    _id: client._id.toString(),
  }));

  return <QuoteManagement initialQuotes={serializedQuotes} initialClients={serializedClients} />;
}
