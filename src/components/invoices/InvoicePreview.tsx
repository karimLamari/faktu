"use client";

import { IInvoice } from "@/models/Invoice";
import { X, Download, Mail, FileText, Monitor, Tablet, Smartphone, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { DEFAULT_TEMPLATE, type TemplatePreset } from "@/lib/invoice-templates";

type ViewMode = 'desktop' | 'tablet' | 'mobile' | 'print';

interface InvoicePreviewProps {
  invoice: IInvoice;
  clientName: string;
  clientData?: any; // Données complètes du client
  userData?: {
    companyName?: string;
    legalForm?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    siret?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
    bankCode?: string;
    branchCode?: string;
    address?: {
      street?: string;
      city?: string;
      zipCode?: string;
      country?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF?: () => void;
  onSendEmail?: () => void;
  isProfileComplete?: boolean;
}

export function InvoicePreview({
  invoice,
  clientName,
  clientData,
  userData,
  isOpen,
  onClose,
  onDownloadPDF,
  onSendEmail,
  isProfileComplete = true,
}: InvoicePreviewProps) {
  const [template, setTemplate] = useState<TemplatePreset>(DEFAULT_TEMPLATE);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('print');

  // Charger le template de l'utilisateur au montage
  useEffect(() => {
    const loadUserTemplate = async () => {
      try {
        const response = await fetch('/api/invoice-templates');
        if (response.ok) {
          const templates = await response.json();
          const defaultTemplate = templates.find((t: any) => t.isDefault);
          if (defaultTemplate) {
            setTemplate(defaultTemplate);
          }
        }
      } catch (error) {
        console.error('Erreur chargement template:', error);
      } finally {
        setLoadingTemplate(false);
      }
    };

    if (isOpen) {
      loadUserTemplate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Génération du HTML avec le template de l'utilisateur
  const getInvoiceHtml = () => {
    if (loadingTemplate) {
      return `
        <html>
          <body style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
            <div style="text-align: center;">
              <div style="width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
              <p style="color: #6b7280;">Chargement du template...</p>
            </div>
            <style>
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
          </body>
        </html>
      `;
    }

    try {
      // Pour la preview, on utilise une iframe avec le PDF endpoint
      return `
        <html>
          <body style="margin: 0; padding: 0; height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f4f6;">
            <div style="text-align: center; font-family: sans-serif;">
              <p style="color: #6b7280; margin-bottom: 16px;">Prévisualisation de la facture</p>
              <a 
                href="/api/invoices/${invoice._id}/pdf" 
                target="_blank"
                style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
              >
                📄 Ouvrir le PDF
              </a>
              <p style="color: #9ca3af; margin-top: 12px; font-size: 14px;">
                La prévisualisation complète s'ouvrira dans un nouvel onglet
              </p>
            </div>
          </body>
        </html>
      `;
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
    };
  };

  // Configuration des dimensions selon le mode
  const getViewDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px', scale: 'scale(min(calc((100vw - 4rem) / 375px), calc((100vh - 16rem) / 667px)))' };
      case 'tablet':
        return { width: '768px', height: '1024px', scale: 'scale(min(calc((100vw - 4rem) / 768px), calc((100vh - 16rem) / 1024px)))' };
      case 'desktop':
        return { width: '1440px', height: '900px', scale: 'scale(min(calc((100vw - 4rem) / 1440px), calc((100vh - 16rem) / 900px)))' };
      case 'print':
      default:
        return { width: '210mm', height: '297mm', scale: 'scale(min(calc((100vw - 8rem) / 210mm), calc((100vh - 16rem) / 297mm)))' };
    }
  };

  const dimensions = getViewDimensions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full h-full m-4 overflow-hidden flex flex-col animate-slide-in-up border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Aperçu Facture</h2>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-800/50 rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('print')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'print'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="Vue PDF (A4)"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="Vue Desktop (1440x900)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('tablet')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'tablet'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="Vue Tablette (768x1024)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="Vue Mobile (375x667)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-800/50 rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* A4 Preview with iframe - Adapté selon le mode */}
        <div className="flex-1 overflow-hidden bg-gray-800 flex items-center justify-center p-4">
          <div 
            className="bg-white shadow-2xl origin-center transition-all duration-300"
            style={{ 
              width: dimensions.width,
              height: dimensions.height,
              transform: dimensions.scale,
              transformOrigin: 'center center'
            }}
          >
            <iframe
              srcDoc={getInvoiceHtml()}
              className="w-full h-full border-0"
              title="Invoice Preview"
              sandbox="allow-same-origin allow-scripts"
              style={{
                width: dimensions.width,
                height: dimensions.height
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-t border-gray-700/50 bg-gray-800/50 flex-shrink-0">
          <div className="text-sm text-gray-400">
            {!isProfileComplete && (
              <span className="text-blue-400 font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Facture professionnelle → Profil requis
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 w-full sm:w-auto"
            >
              Fermer
            </Button>
            {onSendEmail && (
              <Button
                onClick={onSendEmail}
                disabled={!isProfileComplete}
                className={`flex items-center justify-center gap-2 w-full sm:w-auto ${
                  isProfileComplete 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Envoyer par email</span>
                <span className="sm:hidden">Envoyer</span>
              </Button>
            )}
            {onDownloadPDF && (
              <Button
                onClick={onDownloadPDF}
                disabled={!isProfileComplete}
                className={`flex items-center justify-center gap-2 w-full sm:w-auto ${
                  isProfileComplete 
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Télécharger PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
