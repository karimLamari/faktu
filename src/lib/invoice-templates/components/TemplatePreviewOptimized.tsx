'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { InvoicePDF } from '../core/router';
import type { TemplatePreset } from '../config/presets';
import { usePdfPreview } from '@/hooks/usePdfPreview';

interface TemplatePreviewProps {
  template: TemplatePreset;
  sampleData?: {
    invoice: any;
    client: any;
    user: any;
  };
  className?: string;
  loading?: boolean;
}

/**
 * Données d'exemple pour la preview
 */
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

/**
 * Version optimisée du composant TemplatePreview
 * Utilise le hook usePdfPreview pour gérer le cache et le debounce
 */
export function TemplatePreviewOptimized({
  template,
  sampleData = DEFAULT_SAMPLE_DATA,
  className = '',
  loading = false,
}: TemplatePreviewProps) {
  const [zoomLevel, setZoomLevel] = useState(0.5);

  // Normaliser le template
  const normalizedTemplate = useMemo(() => ({
    ...template,
    layout: {
      logoPosition: template.layout?.logoPosition || 'left',
      logoSize: template.layout?.logoSize || 'medium',
      headerStyle: template.layout?.headerStyle || 'modern',
      borderRadius: template.layout?.borderRadius ?? 4,
      spacing: template.layout?.spacing || 'normal',
    },
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
  }), [template]);

  // Générer le PDF avec le hook optimisé
  const { pdfUrl, isGenerating, error } = usePdfPreview(
    <InvoicePDF 
      invoice={sampleData.invoice} 
      client={sampleData.client} 
      user={sampleData.user} 
      template={normalizedTemplate as any} 
    />,
    [normalizedTemplate, sampleData],
    { debounceMs: 300, cacheSize: 5 }
  );

  return (
    <div className={`relative ${className}`}>
      {/* Header avec contrôles de zoom */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 mx-auto">
          {(loading || isGenerating) && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mise à jour...</span>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-400">
              Erreur de génération
            </div>
          )}
          
          {/* Contrôles de zoom */}
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setZoomLevel(Math.max(0.4, zoomLevel - 0.1))}
              disabled={zoomLevel <= 0.4}
              className="p-1.5 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Dézoomer"
            >
              <ZoomOut className="w-4 h-4 text-gray-300" />
            </button>
            
            <span className="text-sm font-medium text-gray-300 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            
            <button
              onClick={() => setZoomLevel(Math.min(0.7, zoomLevel + 0.1))}
              disabled={zoomLevel >= 0.7}
              className="p-1.5 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoomer"
            >
              <ZoomIn className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview PDF dans iframe */}
      <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-gray-800/50 shadow-2xl">
        <div 
          className="overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800"
          style={{ 
            maxHeight: '70vh',
            minHeight: '500px',
          }}
        >
          {pdfUrl ? (
            <div className="flex justify-center p-4 bg-gray-900">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="bg-white shadow-xl"
                style={{
                  width: `${842 * zoomLevel}px`, // A4 width
                  height: `${1191 * zoomLevel}px`, // A4 height
                  border: 'none',
                  transform: 'scale(1)',
                  transformOrigin: 'top center',
                }}
                title="Aperçu de la facture"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ height: '500px' }}>
              <div className="text-center space-y-3">
                <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto" />
                <span className="text-sm font-medium text-gray-200">
                  Génération de l'aperçu...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Infos additionnelles */}
      <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-500">Couleur principale</span>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: template.colors.primary }}
              />
              <span className="font-mono text-gray-300">{template.colors.primary}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Style d'en-tête</span>
            <div className="font-medium text-gray-300 mt-1 capitalize">
              {template.layout.headerStyle}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Espacement</span>
            <div className="font-medium text-gray-300 mt-1 capitalize">
              {template.layout.spacing}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Bordures</span>
            <div className="font-medium text-gray-300 mt-1">
              {template.layout.borderRadius}px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
