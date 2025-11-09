'use client';

import React, { useState } from 'react';
import { Palette, Layout, Eye, Type, FileText, Scale } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import type { TemplatePreset } from '@/lib/invoice-templates/presets';
import { LEGAL_MENTIONS_LIST, LEGAL_MENTIONS_PRESETS } from '@/lib/invoice-templates/legal-mentions';

interface TemplateCustomizerProps {
  template: TemplatePreset;
  onChange: (template: TemplatePreset) => void;
  className?: string;
}

type TabId = 'colors' | 'layout' | 'fonts' | 'sections' | 'text';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'colors', label: 'Couleurs', icon: <Palette className="w-4 h-4" /> },
  { id: 'layout', label: 'Disposition', icon: <Layout className="w-4 h-4" /> },
  { id: 'fonts', label: 'Typographie', icon: <Type className="w-4 h-4" /> },
  { id: 'sections', label: 'Sections', icon: <Eye className="w-4 h-4" /> },
  { id: 'text', label: 'Textes', icon: <FileText className="w-4 h-4" /> },
];

/**
 * Composant de personnalisation du template
 * Organisé en tabs pour une meilleure UX
 * 
 * @example
 * <TemplateCustomizer
 *   template={currentTemplate}
 *   onChange={(updated) => setCurrentTemplate(updated)}
 * />
 */
export function TemplateCustomizer({
  template,
  onChange,
  className = '',
}: TemplateCustomizerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('colors');

  const handleColorChange = (key: keyof typeof template.colors, value: string) => {
    onChange({
      ...template,
      colors: { ...template.colors, [key]: value },
    });
  };

  const handleLayoutChange = (key: keyof typeof template.layout, value: any) => {
    onChange({
      ...template,
      layout: { ...template.layout, [key]: value },
    });
  };

  const handleFontsChange = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      onChange({
        ...template,
        fonts: {
          ...template.fonts,
          [parent]: {
            ...(template.fonts as any)[parent],
            [child]: value,
          },
        },
      });
    } else {
      onChange({
        ...template,
        fonts: { ...template.fonts, [key]: value },
      });
    }
  };

  const handleSectionToggle = (key: keyof typeof template.sections) => {
    onChange({
      ...template,
      sections: { ...template.sections, [key]: !template.sections[key] },
    });
  };

  const handleTextChange = (key: keyof typeof template.customText, value: string) => {
    onChange({
      ...template,
      customText: { ...template.customText, [key]: value },
    });
  };

  return (
    <div className={`bg-gray-900/80 backdrop-blur-lg rounded-xl border-2 border-gray-700/50 overflow-hidden w-full ${className}`}>
      {/* Tabs navigation - Plus compact */}
      <div className="border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap
                border-b-2 flex-shrink-0
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400 bg-gray-900/50'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content - Plus compact */}
      <div className="p-3 sm:p-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
        {/* Colors tab */}
        {activeTab === 'colors' && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white mb-3">Palette de couleurs</h4>
            <div className="space-y-2">
              <ColorPicker
                label="Principale"
                value={template.colors.primary}
                onChange={(v) => handleColorChange('primary', v)}
              />
              <ColorPicker
                label="Secondaire"
                value={template.colors.secondary}
                onChange={(v) => handleColorChange('secondary', v)}
              />
              <ColorPicker
                label="Accent"
                value={template.colors.accent}
                onChange={(v) => handleColorChange('accent', v)}
              />
              <ColorPicker
                label="Texte"
                value={template.colors.text}
                onChange={(v) => handleColorChange('text', v)}
              />
              <ColorPicker
                label="Fond"
                value={template.colors.background}
                onChange={(v) => handleColorChange('background', v)}
              />
            </div>
          </div>
        )}

        {/* Layout tab */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Position du logo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => handleLayoutChange('logoPosition', pos)}
                    className={`
                      px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all capitalize
                      ${
                        template.layout.logoPosition === pos
                          ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300'
                      }
                    `}
                  >
                    {pos === 'left' && '← Gauche'}
                    {pos === 'center' && '↔ Centre'}
                    {pos === 'right' && '→ Droite'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Taille du logo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleLayoutChange('logoSize', size)}
                    className={`
                      px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all capitalize
                      ${
                        template.layout.logoSize === size
                          ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300'
                      }
                    `}
                  >
                    {size === 'small' && 'S'}
                    {size === 'medium' && 'M'}
                    {size === 'large' && 'L'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Style d'en-tête
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['modern', 'classic', 'minimal'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleLayoutChange('headerStyle', style)}
                    className={`
                      px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all capitalize
                      ${
                        template.layout.headerStyle === style
                          ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300'
                      }
                    `}
                  >
                    {style === 'modern' && 'Moderne'}
                    {style === 'classic' && 'Classique'}
                    {style === 'minimal' && 'Minimal'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Espacement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'normal', 'relaxed'] as const).map((spacing) => (
                  <button
                    key={spacing}
                    type="button"
                    onClick={() => handleLayoutChange('spacing', spacing)}
                    className={`
                      px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all capitalize
                      ${
                        template.layout.spacing === spacing
                          ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300'
                      }
                    `}
                  >
                    {spacing === 'compact' && 'Compact'}
                    {spacing === 'normal' && 'Normal'}
                    {spacing === 'relaxed' && 'Aéré'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Arrondis ({template.layout.borderRadius}px)
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={template.layout.borderRadius}
                onChange={(e) => handleLayoutChange('borderRadius', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* Fonts tab */}
        {activeTab === 'fonts' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Police des titres
              </label>
              <select
                value={template.fonts.heading}
                onChange={(e) => handleFontsChange('heading', e.target.value)}
                className="w-full h-9 border-2 border-gray-300 rounded-lg px-3 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Helvetica Neue, Arial, sans-serif">Helvetica</option>
                <option value="Georgia, Times New Roman, serif">Georgia</option>
                <option value="Inter, -apple-system, sans-serif">Inter</option>
                <option value="Poppins, -apple-system, sans-serif">Poppins</option>
                <option value="Arial, sans-serif">Arial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Police du corps
              </label>
              <select
                value={template.fonts.body}
                onChange={(e) => handleFontsChange('body', e.target.value)}
                className="w-full h-9 border-2 border-gray-300 rounded-lg px-3 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Helvetica Neue, Arial, sans-serif">Helvetica</option>
                <option value="Georgia, Times New Roman, serif">Georgia</option>
                <option value="Inter, -apple-system, sans-serif">Inter</option>
                <option value="Poppins, -apple-system, sans-serif">Poppins</option>
                <option value="Arial, sans-serif">Arial</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Base
                </label>
                <input
                  type="number"
                  min="8"
                  max="16"
                  value={template.fonts.size.base}
                  onChange={(e) => handleFontsChange('size.base', Number(e.target.value))}
                  className="w-full h-8 border-2 border-gray-300 rounded-lg px-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Titre
                </label>
                <input
                  type="number"
                  min="16"
                  max="36"
                  value={template.fonts.size.heading}
                  onChange={(e) => handleFontsChange('size.heading', Number(e.target.value))}
                  className="w-full h-8 border-2 border-gray-300 rounded-lg px-2 text-xs"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Petit
                </label>
                <input
                  type="number"
                  min="6"
                  max="12"
                  value={template.fonts.size.small}
                  onChange={(e) => handleFontsChange('size.small', Number(e.target.value))}
                  className="w-full h-8 border-2 border-gray-300 rounded-lg px-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sections tab */}
        {activeTab === 'sections' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 mb-3">
              Sections à afficher
            </p>
            {Object.entries(template.sections).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
              >
                <span className="text-xs font-medium text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace('show', '').trim()}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleSectionToggle(key as keyof typeof template.sections)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        )}

        {/* Text tab */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Titre de la facture
              </label>
              <input
                type="text"
                value={template.customText.invoiceTitle}
                onChange={(e) => handleTextChange('invoiceTitle', e.target.value)}
                className="w-full h-9 border-2 border-gray-300 rounded-lg px-3 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="FACTURE"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Label modalités paiement
              </label>
              <input
                type="text"
                value={template.customText.paymentTermsLabel}
                onChange={(e) => handleTextChange('paymentTermsLabel', e.target.value)}
                className="w-full h-9 border-2 border-gray-300 rounded-lg px-3 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Modalités de paiement"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Label coordonnées bancaires
              </label>
              <input
                type="text"
                value={template.customText.bankDetailsLabel}
                onChange={(e) => handleTextChange('bankDetailsLabel', e.target.value)}
                className="w-full h-9 border-2 border-gray-300 rounded-lg px-3 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Coordonnées Bancaires"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Scale className="w-4 h-4" />
                Mentions légales obligatoires
              </label>
              
              {/* Sélecteur de modèle pré-défini */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Choisir un modèle
                </label>
                <select
                  value={template.customText.legalMentionsType || 'societe-standard'}
                  onChange={(e) => {
                    const selectedType = e.target.value;
                    const selectedPreset = LEGAL_MENTIONS_PRESETS[selectedType];
                    if (selectedPreset) {
                      handleTextChange('legalMentionsType', selectedType);
                      handleTextChange('legalMentions', selectedPreset.template);
                    }
                  }}
                  className="w-full h-12 border-2 border-gray-300 rounded-xl px-3 sm:px-4 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ maxWidth: '100%' }}
                >
                  {LEGAL_MENTIONS_LIST.map((preset) => (
                    <option key={preset.id} value={preset.id} className="text-xs sm:text-sm py-2">
                      {preset.name}
                    </option>
                  ))}
                </select>
                
                {/* Info sur le type sélectionné */}
                {template.customText.legalMentionsType && LEGAL_MENTIONS_PRESETS[template.customText.legalMentionsType] && (
                  <div className="mt-2 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-xs text-blue-300">
                    <p className="mb-1">
                      <strong>Description :</strong>{' '}
                      {LEGAL_MENTIONS_PRESETS[template.customText.legalMentionsType].description}
                    </p>
                    <p>
                      <strong>Applicable pour :</strong>{' '}
                      {LEGAL_MENTIONS_PRESETS[template.customText.legalMentionsType].applicableFor.join(', ')}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Texte personnalisable */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Texte personnalisé (éditable)
                </label>
                <textarea
                  value={template.customText.legalMentions}
                  onChange={(e) => handleTextChange('legalMentions', e.target.value)}
                  rows={5}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="Mentions légales..."
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Personnalisable après sélection
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Pied de page (optionnel)
              </label>
              <input
                type="text"
                value={template.customText.footerText || ''}
                onChange={(e) => handleTextChange('footerText', e.target.value)}
                className="w-full h-9 border-2 border-gray-300 rounded-lg px-3 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Merci !"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
