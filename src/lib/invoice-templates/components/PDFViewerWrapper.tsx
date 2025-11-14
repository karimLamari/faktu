'use client';

import React, { useEffect, useState } from 'react';
import type { TemplatePreset } from '../config/presets';

interface PDFViewerWrapperProps {
  template: TemplatePreset;
  sampleData: {
    invoice: any;
    client: any;
    user: any;
  };
}

/**
 * Wrapper client-only pour PDFViewer
 * Charge dynamiquement @react-pdf/renderer uniquement côté client
 */
export default function PDFViewerWrapper({ template, sampleData }: PDFViewerWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [PDFComponents, setPDFComponents] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Charger @react-pdf/renderer et InvoicePDF dynamiquement
    Promise.all([
      import('@react-pdf/renderer'),
      import('../core/router')
    ])
      .then(([pdfModule, routerModule]) => {
        setPDFComponents({
          PDFViewer: pdfModule.PDFViewer,
          InvoicePDF: routerModule.InvoicePDF,
        });
      })
      .catch((err) => {
        console.error('Erreur chargement PDF:', err);
        setError('Impossible de charger le visualiseur PDF');
      });
  }, []);

  // Afficher un spinner pendant le chargement
  if (!isClient || !PDFComponents) {
    return (
      <div className="w-full h-full min-h-[700px] flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">
            {error || 'Chargement du visualiseur PDF...'}
          </p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (error) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-red-50 rounded-xl border-2 border-red-200">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const { PDFViewer, InvoicePDF } = PDFComponents;

  // Créer une clé unique basée sur le template et ses propriétés critiques
  // pour forcer le remount quand ces propriétés changent
  const viewerKey = `${template.name}-${template.customText.legalMentionsType || 'default'}-${template.colors.primary}`;

  return (
    <PDFViewer
      key={viewerKey} // Force remount quand le template ou ses propriétés critiques changent
      width="100%"
      height="100%"
      style={{
        border: 'none',
        borderRadius: '0.75rem',
        minHeight: '700px',
      }}
      showToolbar={true}
    >
      <InvoicePDF
        invoice={sampleData.invoice}
        client={sampleData.client}
        user={sampleData.user}
        template={template as any}
      />
    </PDFViewer>
  );
}