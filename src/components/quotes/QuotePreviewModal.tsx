'use client';

import React, { useEffect, useState } from 'react';
import { IQuote } from '@/models/Quote';
import { FiFileText, FiDownload } from 'react-icons/fi';
import { Monitor, Tablet, Smartphone, Printer } from 'lucide-react';

type ViewMode = 'desktop' | 'tablet' | 'mobile' | 'print';

interface QuotePreviewModalProps {
  quote: IQuote & { clientId: { name: string; email?: string } };
  isOpen: boolean;
  onClose: () => void;
}

export default function QuotePreviewModal({ quote, isOpen, onClose }: QuotePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('print');

  React.useEffect(() => {
    if (isOpen && !pdfUrl) {
      loadPdf();
    }
  }, [isOpen]);

  const loadPdf = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotes/${quote._id}/pdf`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du chargement du PDF');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error: any) {
      alert(error.message || 'Erreur lors du chargement du PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `devis-${quote.quoteNumber}.pdf`;
    a.click();
  };

  // Configuration des dimensions selon le mode
  const getViewDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', scale: 0.5 };
      case 'tablet':
        return { width: '768px', scale: 0.7 };
      case 'desktop':
        return { width: '100%', scale: 1 };
      case 'print':
      default:
        return { width: '100%', scale: 1 };
    }
  };

  const dimensions = getViewDimensions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiFileText className="w-6 h-6" /> Aperçu du devis
            </h2>
            <p className="text-sm text-blue-100 mt-1">{quote.quoteNumber}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Selector */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('print')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'print'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20'
                }`}
                title="Vue PDF (A4)"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20'
                }`}
                title="Vue Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('tablet')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'tablet'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20'
                }`}
                title="Vue Tablette"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20'
                }`}
                title="Vue Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            
            {pdfUrl && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
              >
                <FiDownload className="w-4 h-4" /> Télécharger
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
            >
              ✖️ Fermer
            </button>
          </div>
        </div>

        {/* PDF Viewer - responsive selon le mode */}
        <div className="flex-1 overflow-hidden p-4 bg-gray-800/50 flex items-center justify-center">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Chargement du PDF...</p>
              </div>
            </div>
          )}
          {!isLoading && pdfUrl && (
            <div 
              className="h-full transition-all duration-300 mx-auto"
              style={{ 
                width: dimensions.width,
                maxWidth: '100%'
              }}
            >
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded-lg border border-gray-700 shadow-2xl"
                title="Aperçu du devis"
                style={{
                  transform: viewMode !== 'print' && viewMode !== 'desktop' ? `scale(${dimensions.scale})` : 'none',
                  transformOrigin: 'top center'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
