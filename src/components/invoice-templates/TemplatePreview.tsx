'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { generateInvoiceHtml } from '@/lib/templates/invoice-pdf-generator';
import type { TemplatePreset } from '@/lib/invoice-templates/presets';

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
    type: 'company',
    companyInfo: {
      name: 'Entreprise Client SA',
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
 * Composant de preview en temps réel du template de facture
 * Utilise iframe avec srcDoc pour isoler les styles
 * 
 * @example
 * <TemplatePreview
 *   template={currentTemplate}
 *   loading={isGenerating}
 * />
 */
export function TemplatePreview({
  template,
  sampleData = DEFAULT_SAMPLE_DATA,
  className = '',
  loading = false,
}: TemplatePreviewProps) {
  // État pour le niveau de zoom (0.4 à 0.7)
  const [zoomLevel, setZoomLevel] = useState(0.5);

  // Générer le HTML avec le template actuel
  const previewHtml = useMemo(() => {
    try {
      return generateInvoiceHtml({
        invoice: sampleData.invoice,
        client: sampleData.client,
        user: sampleData.user,
        template,
      });
    } catch (error) {
      console.error('Erreur génération preview:', error);
      return `
        <html>
          <body style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: #ef4444;">
            <div style="text-align: center;">
              <h2>⚠️ Erreur de preview</h2>
              <p>${error instanceof Error ? error.message : 'Erreur inconnue'}</p>
            </div>
          </body>
        </html>
      `;
    }
  }, [template, sampleData]);

  return (
    <div className={`relative ${className}`}>
      {/* Header avec contrôles de zoom */}
      <div className="flex items-center justify-between mb-4">
        
        <div className="flex items-center gap-3 mx-auto">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mise à jour...</span>
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
            <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(0.7, zoomLevel + 0.1))}
              disabled={zoomLevel >= 0.7}
              className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoomer"
            >
              <ZoomIn className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview container - Pleine page avec zoom adapté */}
      <div className="relative bg-gray-100 rounded-xl overflow-auto shadow-2xl p-4 flex items-start justify-center min-h-[500px] max-h-[700px]">
        {/* Wrapper avec zoom pour voir la page A4 complète */}
        <div 
          className="bg-white shadow-xl transition-transform duration-300"
          style={{
            width: '210mm',
            height: '297mm',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
          }}
        >
          <iframe
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            title="Aperçu de la facture"
            sandbox="allow-same-origin allow-scripts"
            loading="lazy"
            style={{
              width: '210mm',
              height: '297mm',
            }}
          />
        </div>

        {/* Overlay de chargement */}
        {loading && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-800 border border-gray-700 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="text-sm font-medium text-gray-200">
                Génération de l'aperçu...
              </span>
            </div>
          </div>
        )}
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
              <span className="font-mono text-gray-700">{template.colors.primary}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Style d'en-tête</span>
            <div className="font-medium text-gray-700 mt-1 capitalize">
              {template.layout.headerStyle}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Espacement</span>
            <div className="font-medium text-gray-700 mt-1 capitalize">
              {template.layout.spacing}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Bordures</span>
            <div className="font-medium text-gray-700 mt-1">
              {template.layout.borderRadius}px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
