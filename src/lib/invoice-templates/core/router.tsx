/**
 * Invoice PDF Router Component
 * Routes to template-specific components based on template.templateComponent
 *
 * ═══════════════════════════════════════════════════════════════
 * 🎨 5 TEMPLATES ARCHITECTURALEMENT DISTINCTS
 * ═══════════════════════════════════════════════════════════════
 *
 * Architecture:
 * - Moderne: Sidebar layout (30% left colored + 70% content)
 * - Classique: Vertical formal with decorative double border
 * - Minimaliste: Centered vertical, list-based (no table)
 * - Studio: Asymmetric with diagonal header and accent bar
 * - Créatif: Diagonal header with bold asymmetric layout
 */

import React from 'react';
import type { TemplatePreset } from '../config/presets';
import { ModerneTemplate } from '../templates/ModerneTemplate';
import { ClassiqueTemplate } from '../templates/ClassiqueTemplate';
import { MinimalisteTemplate } from '../templates/MinimalisteTemplate';
import { StudioTemplate } from '../templates/StudioTemplate';
import { CreatifTemplate } from '../templates/CreatifTemplate';

// Note: Helvetica, Helvetica-Bold, Times-Roman, Courier sont des fonts natives dans @react-pdf
// Aucun enregistrement n'est nécessaire

export interface InvoicePDFProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

/**
 * Main Invoice PDF Component
 * Routes to template-specific renderers based on template.templateComponent
 * Each template has its own JSX architecture and styles
 */
export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, client, user, template }) => {
  // Route based on templateComponent (architectural component name)
  const componentName = template.templateComponent || template.name;

  switch (componentName) {
    case 'ClassiqueTemplate':
    case 'Classique':
      return <ClassiqueTemplate invoice={invoice} client={client} user={user} template={template} />;

    case 'MinimalisteTemplate':
    case 'Minimaliste':
      return <MinimalisteTemplate invoice={invoice} client={client} user={user} template={template} />;

    case 'StudioTemplate':
    case 'Studio':
      return <StudioTemplate invoice={invoice} client={client} user={user} template={template} />;

    case 'CreatifTemplate':
    case 'Créatif':
      return <CreatifTemplate invoice={invoice} client={client} user={user} template={template} />;

    case 'ModerneTemplate':
    case 'Moderne':
    default:
      // Fallback to Moderne for unknown/legacy templates
      return <ModerneTemplate invoice={invoice} client={client} user={user} template={template} />;
  }
};
