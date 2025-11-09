'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { TEMPLATE_LIST, type TemplatePreset } from '@/lib/invoice-templates/presets';

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelect: (templateId: string, template: TemplatePreset) => void;
  className?: string;
}

/**
 * Composant pour sélectionner un template pré-défini
 * Affiche une grille de cartes avec preview visuel de chaque template
 * 
 * @example
 * <TemplateSelector
 *   selectedTemplateId="modern"
 *   onSelect={(id, template) => {
 *     setSelectedId(id);
 *     setCurrentTemplate(template);
 *   }}
 * />
 */
export function TemplateSelector({
  selectedTemplateId,
  onSelect,
  className = '',
}: TemplateSelectorProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-white mb-2">
        Modèles pré-définis
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Sélectionnez un modèle de base
      </p>

      <div className="flex flex-wrap gap-3">
        {TEMPLATE_LIST.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id, template)}
              className={`
                relative px-4 py-2.5 border-2 rounded-lg transition-all
                hover:shadow-md active:scale-95 flex items-center gap-2
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 text-gray-300'
                }
              `}
            >
              {/* Preview couleurs miniature */}
              <div className="flex gap-0.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: template.colors.primary }}
                />
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: template.colors.accent }}
                />
              </div>

              {/* Nom */}
              <span className="text-sm font-semibold">
                {template.name}
              </span>

              {/* Check icon */}
              {isSelected && (
                <Check className="w-4 h-4" strokeWidth={3} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
