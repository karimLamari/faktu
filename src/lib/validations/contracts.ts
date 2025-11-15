import { z } from 'zod';

/**
 * 📄 Validations pour l'upload de contrats clients
 */

// Types MIME acceptés
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// Taille max : 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Schema pour validation d'upload de contrat
export const contractUploadSchema = z.object({
  file: z
    .custom<File>()
    .refine((file) => file instanceof File, 'Un fichier est requis')
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `Le fichier ne doit pas dépasser ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      'Format de fichier non supporté. Acceptés : PDF, Word, JPG, PNG'
    ),
  
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return undefined;
      return val.trim();
    }),
});

// Type exports
export type ContractUploadFormData = z.infer<typeof contractUploadSchema>;
