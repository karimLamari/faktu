/**
 * Invoice PDF Router Component
 * Routes to template-specific components based on template.name
 * 
 * Architecture:
 * - Each template has its own rendering logic
 * - Moderne: Sidebar layout (30% left colored + 70% content)
 * - Classique: Vertical formal with decorative double border
 * - Minimaliste: Centered vertical, list-based (no table)
 * - Créatif: Asymmetric with diagonal header and accent bar
 */

import React from 'react';
import type { TemplatePreset } from '../config/presets';
import { ModerneTemplate } from '../templates/ModerneTemplate';
import { ClassiqueTemplate } from '../templates/ClassiqueTemplate';
import { MinimalisteTemplate } from '../templates/MinimalisteTemplate';
import { CreatifTemplate } from '../templates/CreatifTemplate';

// Note: Helvetica, Helvetica-Bold, Times, Courier sont des fonts natives dans @react-pdf
// Aucun enregistrement n'est nécessaire

export interface InvoicePDFProps {
  invoice: any;
  client: any;
  user: any;
  template: TemplatePreset;
}

/**
 * Main Invoice PDF Component
 * Routes to template-specific renderers based on template.name
 * Each template manages its own styles internally
 */
export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, client, user, template }) => {
  // Route to correct template renderer based on template name
  switch (template.name) {
    case 'Classique':
      return <ClassiqueTemplate invoice={invoice} client={client} user={user} template={template} />;
    
    case 'Minimaliste':
      return <MinimalisteTemplate invoice={invoice} client={client} user={user} template={template} />;
    
    case 'Créatif':
      return <CreatifTemplate invoice={invoice} client={client} user={user} template={template} />;
    
    case 'Moderne':
    default:
      return <ModerneTemplate invoice={invoice} client={client} user={user} template={template} />;
  }
};
