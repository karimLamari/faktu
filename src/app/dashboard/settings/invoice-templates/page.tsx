'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Check, Eye, Trash2 } from 'lucide-react';
import {
  TemplateSelector,
  TemplateCustomizer,
  TemplatePreview,
  INVOICE_TEMPLATE_PRESETS,
  DEFAULT_TEMPLATE,
  getLegalMentionsPresetByLegalForm,
  LEGAL_MENTIONS_PRESETS,
  type TemplatePreset,
} from '@/lib/invoice-templates';
import { UsageBar } from '@/components/subscription/UsageBar';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { useSubscription } from '@/hooks';
import { PLANS } from '@/lib/subscription/plans';

/**
 * Page de personnalisation des templates de factures
 * Layout split: preview à gauche, customization à droite
 */
export default function InvoiceTemplatesPage() {
  const router = useRouter();
  const [currentTemplate, setCurrentTemplate] = useState<TemplatePreset>(DEFAULT_TEMPLATE);
  const [selectedPresetId, setSelectedPresetId] = useState('modern');
  const [templateName, setTemplateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [templatesCount, setTemplatesCount] = useState(0);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [userLegalForm, setUserLegalForm] = useState<string>();
  
  const { data: subscriptionData } = useSubscription();
  const plan = subscriptionData?.plan;

  // Charger les templates existants au montage
  useEffect(() => {
    loadUserTemplates();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const { user } = await response.json();
        setUserLegalForm(user.legalForm);
      }
    } catch (err) {
      console.error('Erreur chargement données utilisateur:', err);
    }
  };

  const loadUserTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoice-templates');
      
      if (response.ok) {
        const templates = await response.json();
        setSavedTemplates(templates);
        setTemplatesCount(templates.length);
        // Charger le template par défaut si existant
        const defaultTemplate = templates.find((t: any) => t.isDefault);
        if (defaultTemplate) {
          // Créer une nouvelle référence d'objet pour forcer la mise à jour React
          setCurrentTemplate({
            name: defaultTemplate.name,
            description: defaultTemplate.description || '',
            colors: { ...defaultTemplate.colors },
            fonts: { ...defaultTemplate.fonts, size: { ...defaultTemplate.fonts?.size } },
            layout: { ...defaultTemplate.layout },
            sections: { ...defaultTemplate.sections },
            customText: { ...defaultTemplate.customText },
          });
          setTemplateName(defaultTemplate.name);
          setSelectedPresetId('custom');
        }
      }
    } catch (err) {
      console.error('Erreur chargement templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (id: string, template: TemplatePreset) => {
    setSelectedPresetId(id);
    setCurrentTemplate(template);
    setTemplateName(`${template.name} - Personnalisé`);
  };

  const handleLoadSavedTemplate = (template: any) => {
    // Créer une nouvelle référence d'objet pour forcer la mise à jour React
    setCurrentTemplate({
      name: template.name,
      description: template.description || '',
      colors: { ...template.colors },
      fonts: { ...template.fonts, size: { ...template.fonts?.size } },
      layout: { ...template.layout },
      sections: { ...template.sections },
      customText: { ...template.customText },
    });
    setTemplateName(template.name);
    setSelectedPresetId('custom');
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${templateName}" ?`)) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/invoice-templates?id=${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recharger les templates
        await loadUserTemplates();
        
        // Si c'était le template actuel, réinitialiser à modern
        const deletedTemplate = savedTemplates.find(t => t._id === templateId);
        if (deletedTemplate && currentTemplate.name === deletedTemplate.name) {
          const modernPreset = INVOICE_TEMPLATE_PRESETS['modern'];
          if (modernPreset) {
            setCurrentTemplate(modernPreset);
            setTemplateName('');
            setSelectedPresetId('modern');
          }
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur lors de la suppression du modèle');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: templateName,
        description: `Template basé sur ${selectedPresetId}`,
        isDefault: true, // Définir comme template par défaut
        colors: currentTemplate.colors,
        fonts: currentTemplate.fonts,
        layout: currentTemplate.layout,
        sections: currentTemplate.sections,
        customText: currentTemplate.customText,
      };

      const response = await fetch('/api/invoice-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        
        // Vérifier si la limite est atteinte
        if (data.limitReached) {
          setUpgradeModalOpen(true);
          return;
        }
        
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      // Succès
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadUserTemplates(); // Recharger pour mettre à jour le compteur
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Personnalisation des factures
                </h1>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-400 animate-fade-in">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Sauvegardé !</span>
                </div>
              )}
              
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="flex-1 sm:flex-initial sm:min-w-[200px] px-4 py-2 bg-gray-800/50 border-2 border-gray-700 text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500"
                placeholder="Nom du template"
              />
              <button
                onClick={handleSave}
                disabled={saving || !templateName.trim()}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Enregistrement...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}
          
          {/* Usage Bar */}
          {plan && (
            <div className="mt-4">
              <UsageBar
                current={templatesCount}
                limit={PLANS[plan].templates}
                label="Modèles de factures"
                upgradeLink="/dashboard/pricing"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Saved Templates Section */}
            {savedTemplates.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Mes modèles enregistrés ({savedTemplates.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedTemplates.map((template) => (
                    <div
                      key={template._id}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        templateName === template.name
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-gray-700 bg-gray-800/50 hover:border-blue-600'
                      }`}
                    >
                      <button
                        onClick={() => handleLoadSavedTemplate(template)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{template.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                          </div>
                          {template.isDefault && (
                            <span className="ml-2 px-2 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded border border-green-700/50">
                              Par défaut
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <div 
                            className="w-6 h-6 rounded border border-gray-300" 
                            style={{ backgroundColor: template.colors?.primary || '#3B82F6' }}
                          />
                          <span className="text-xs text-gray-500">
                            {template.fonts?.body || 'Inter'}
                          </span>
                        </div>
                      </button>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteTemplate(template._id, template.name, e)}
                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer ce modèle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template selector */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ou choisir un modèle pré-défini
              </h2>
              <TemplateSelector
                selectedTemplateId={selectedPresetId}
                onSelect={handlePresetSelect}
              />
            </div>

            {/* Split layout: Preview + Customizer - 50/50 */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left: Preview (sticky, 50%) - Hidden on mobile */}
              <div className="hidden lg:block lg:sticky lg:top-24 self-start">
                <TemplatePreview
                  template={currentTemplate}
                />
              </div>

              {/* Right: Customizer (50%) */}
              <div className="w-full">
                <div className="lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2">
                  <TemplateCustomizer
                    template={currentTemplate}
                    onChange={setCurrentTemplate}
                    userLegalForm={userLegalForm}
                  />
                </div>

                {/* Save button mobile */}
                <div className="lg:hidden mt-6 sticky bottom-4 z-10">
                  <button
                    onClick={handleSave}
                    disabled={saving || !templateName.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Enregistrer le template
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bouton flottant pour preview mobile */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <Eye className="w-5 h-5" />
        <span className="font-semibold">Aperçu</span>
      </button>

      {/* Modal plein écran pour preview mobile */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black bg-opacity-95 animate-fade-in">
          <div className="h-full flex flex-col">
            {/* Header modal */}
            <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
              <h3 className="text-white font-semibold">Aperçu de la facture</h3>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Fermer
              </button>
            </div>

            {/* Preview content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-900">
              <div className="bg-white rounded-lg shadow-2xl mx-auto" style={{ maxWidth: '800px' }}>
                <TemplatePreview
                  template={currentTemplate}
                />
              </div>
            </div>

            {/* Hint swipe */}
            <div className="p-3 bg-gray-950 border-t border-gray-700 text-center">
              <p className="text-gray-400 text-xs">
                💡 Fermez l&apos;aperçu pour continuer l&apos;édition
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        feature="modèles de factures"
        currentPlan={plan || 'free'}
        requiredPlan="pro"
      />
    </div>
  );
}
