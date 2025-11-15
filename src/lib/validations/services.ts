import { z } from 'zod';

/**
 * 🔧 Validations pour les Services/Prestations
 */

// Categories communes (peut être étendu)
export const serviceCategoryEnum = z.enum([
  'Développement',
  'Design',
  'Conseil',
  'Formation',
  'Maintenance',
  'Support',
  'Hébergement',
  'Marketing',
  'Rédaction',
  'Traduction',
  'Autre'
]);

// Base service schema (sans transform)
const serviceSchemaBase = z.object({
  name: z.string()
    .min(1, 'Le nom de la prestation est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .trim()
    .optional()
    .or(z.literal('')),
  
  unitPrice: z.number({ 
    message: 'Le prix unitaire est requis et doit être un nombre' 
  })
    .min(0, 'Le prix ne peut pas être négatif')
    .max(999999.99, 'Le prix est trop élevé'),
  
  taxRate: z.number({ 
    message: 'Le taux de TVA est requis et doit être un nombre' 
  })
    .min(0, 'Le taux de TVA ne peut pas être négatif')
    .max(100, 'Le taux de TVA ne peut pas dépasser 100%')
    .default(20),
  
  category: serviceCategoryEnum.optional().or(z.literal('')),
  
  isActive: z.boolean().default(true),
});

// Create service schema avec transform
export const createServiceSchema = serviceSchemaBase.transform((data) => {
  // Nettoyer les champs optionnels vides
  const cleaned: any = { ...data };
  
  if (cleaned.description === '') delete cleaned.description;
  if (cleaned.category === '') delete cleaned.category;
  
  return cleaned;
});

// Update service schema (tous les champs optionnels)
export const updateServiceSchema = serviceSchemaBase.partial().transform((data) => {
  // Nettoyer les champs optionnels vides
  const cleaned: any = { ...data };
  
  if (cleaned.description === '') delete cleaned.description;
  if (cleaned.category === '') delete cleaned.category;
  
  return cleaned;
});

// Schema pour la sélection de services (formulaires factures/devis)
export const serviceSelectionSchema = z.object({
  serviceId: z.string().min(1, 'Le service est requis'),
  quantity: z.number()
    .min(0.01, 'La quantité doit être supérieure à 0')
    .max(9999, 'La quantité est trop élevée')
    .default(1),
  customDescription: z.string().max(500).optional(),
  customUnitPrice: z.number()
    .min(0, 'Le prix ne peut pas être négatif')
    .max(999999.99, 'Le prix est trop élevé')
    .optional(),
});

// Schema pour les items de service dans les factures/devis
export const serviceItemSchema = z.object({
  serviceId: z.string().optional(), // Optionnel pour les items personnalisés
  name: z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  quantity: z.number()
    .min(0.01, 'La quantité doit être supérieure à 0')
    .max(9999, 'La quantité est trop élevée'),
  unitPrice: z.number()
    .min(0, 'Le prix ne peut pas être négatif')
    .max(999999.99, 'Le prix est trop élevé'),
  taxRate: z.number()
    .min(0, 'Le taux de TVA ne peut pas être négatif')
    .max(100, 'Le taux de TVA ne peut pas dépasser 100%'),
  total: z.number()
    .min(0, 'Le total ne peut pas être négatif')
    .max(9999999.99, 'Le total est trop élevé')
    .optional(), // Calculé automatiquement
});

// Schema pour les filtres de recherche de services
export const serviceFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  category: serviceCategoryEnum.optional(),
  isActive: z.boolean().optional(),
  minPrice: z.number()
    .min(0, 'Le prix minimum ne peut pas être négatif')
    .max(999999.99, 'Le prix minimum est trop élevé')
    .optional(),
  maxPrice: z.number()
    .min(0, 'Le prix maximum ne peut pas être négatif')
    .max(999999.99, 'Le prix maximum est trop élevé')
    .optional(),
});

// Schema pour l'import de services
export const serviceImportSchema = z.object({
  services: z.array(serviceSchemaBase).max(100, 'Trop de services à importer'),
  overwrite: z.boolean().default(false),
});

// Schema pour les statistiques de services
export const serviceStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  startDate: z.string().optional(), // Date ISO
  endDate: z.string().optional(),   // Date ISO
});

// Types
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceSelectionInput = z.infer<typeof serviceSelectionSchema>;
export type ServiceItemInput = z.infer<typeof serviceItemSchema>;
export type ServiceFiltersInput = z.infer<typeof serviceFiltersSchema>;
export type ServiceImportInput = z.infer<typeof serviceImportSchema>;
export type ServiceStatsInput = z.infer<typeof serviceStatsSchema>;
export type ServiceCategory = z.infer<typeof serviceCategoryEnum>;

// Export groupé pour une utilisation facile
export const serviceSchemas = {
  create: createServiceSchema,
  update: updateServiceSchema,
  selection: serviceSelectionSchema,
  item: serviceItemSchema,
  filters: serviceFiltersSchema,
  import: serviceImportSchema,
  stats: serviceStatsSchema,
  base: serviceSchemaBase,
  category: serviceCategoryEnum,
};