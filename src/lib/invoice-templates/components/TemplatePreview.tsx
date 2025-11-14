'use client';

import React, { useMemo, useState, useEffect } from 'react';
import type { TemplatePreset } from '../config/presets';

interface TemplatePreviewProps {
  template: TemplatePreset;
  sampleData?: {
    invoice: any;
    client: any;
    user: any;
  };
  className?: string;
}

const DEFAULT_SAMPLE_DATA = {
  invoice: {
    invoiceNumber: 'FAC-2024-001',
    issueDate: new Date('2024-11-01'),
    dueDate: new Date('2024-12-01'),
    status: 'sent',
    items: [
      {
        description: 'Développement web',
        quantity: 10,
        unitPrice: 85,
        taxRate: 20,
        unit: 'hour',
      },
      {
        description: 'Design graphique',
        quantity: 5,
        unitPrice: 75,
        taxRate: 20,
        unit: 'hour',
      },
    ],
    subtotal: 1225,
    taxAmount: 245,
    total: 1470,
    amountPaid: 500,
    balanceDue: 970,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'partially_paid',
    notes: 'Merci pour votre confiance !',
  },
  client: {
    name: 'Entreprise Client SA',
    type: 'company',
    email: 'client@entreprise-client.fr',
    companyInfo: {
      siret: '123 456 789 00012',
    },
    address: {
      street: '123 Avenue de la République',
      zipCode: '75011',
      city: 'Paris',
      country: 'France',
    },
  },
  user: {
    companyName: 'Votre Entreprise',
    legalForm: 'SARL',
    siret: '987 654 321 00012',
    email: 'contact@entreprise.fr',
    phone: '01 23 45 67 89',
    address: {
      street: '456 Rue du Commerce',
      zipCode: '75015',
      city: 'Paris',
      country: 'France',
    },
    bankName: 'Banque Populaire',
    iban: 'FR76 1234 5678 9012 3456 7890 123',
    bic: 'CCBPFRPPXXX',
    logo: null,
  },
};

export function TemplatePreview({
  template,
  sampleData = DEFAULT_SAMPLE_DATA,
  className = '',
}: TemplatePreviewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [PDFViewerWrapper, setPDFViewerWrapper] = useState<any>(null);

  // Charger le wrapper uniquement côté client
  useEffect(() => {
    setIsMounted(true);
    import('./PDFViewerWrapper').then((mod) => {
      setPDFViewerWrapper(() => mod.default);
    });
  }, []);

  const normalizedTemplate = useMemo(() => {
    return {
      ...template,
      name: template.name || 'Moderne',
      colors: {
        primary: template.colors?.primary || '#2563eb',
        secondary: template.colors?.secondary || '#64748b',
        accent: template.colors?.accent || '#10b981',
        text: template.colors?.text || '#1e293b',
        background: template.colors?.background || '#ffffff',
      },
      fonts: {
        heading: template.fonts?.heading || 'Helvetica',
        body: template.fonts?.body || 'Helvetica',
        size: {
          base: template.fonts?.size?.base || 10,
          heading: template.fonts?.size?.heading || 18,
          small: template.fonts?.size?.small || 8,
        },
      },
      layout: {
        logoPosition: template.layout?.logoPosition || 'left',
        logoSize: template.layout?.logoSize || 'medium',
        headerStyle: template.layout?.headerStyle || 'modern',
        borderRadius: template.layout?.borderRadius ?? 4,
        spacing: template.layout?.spacing || 'normal',
      },
      sections: {
        showLogo: template.sections?.showLogo ?? true,
        showBankDetails: template.sections?.showBankDetails ?? true,
        showPaymentTerms: template.sections?.showPaymentTerms ?? true,
        showLegalMentions: template.sections?.showLegalMentions ?? true,
        showItemDetails: template.sections?.showItemDetails ?? false,
        showCompanyDetails: template.sections?.showCompanyDetails ?? true,
        showClientDetails: template.sections?.showClientDetails ?? true,
      },
      customText: {
        invoiceTitle: template.customText?.invoiceTitle || 'FACTURE',
        paymentTermsLabel: template.customText?.paymentTermsLabel || 'Modalités de paiement',
        bankDetailsLabel: template.customText?.bankDetailsLabel || 'Coordonnées Bancaires',
        legalMentions: template.customText?.legalMentions || '',
        legalMentionsType: template.customText?.legalMentionsType || 'societe-standard',
        footerText: template.customText?.footerText,
      },
    };
  }, [template]);

  // Show loading state until client is mounted and PDFViewerWrapper is loaded
  // This ensures server and client render the same initial HTML
  if (!isMounted || !PDFViewerWrapper) {
    return (
      <div className={`w-full h-full ${className}`}>
        <div className="w-full h-full min-h-[700px] flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Chargement du visualiseur PDF...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <PDFViewerWrapper template={normalizedTemplate} sampleData={sampleData} />
    </div>
  );
}
