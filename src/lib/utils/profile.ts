/**
 * Utilitaires pour la validation et complétion du profil utilisateur
 */

/**
 * Vérifie si un profil utilisateur est complet pour générer des factures/devis
 * Requis pour : Génération PDF, Envoi Email, Rappels de paiement
 * 
 * @param user - Objet utilisateur (partiel ou complet)
 * @returns true si le profil contient tous les champs obligatoires
 */
export function isProfileComplete(user: {
  companyName?: string | null;
  legalForm?: string | null;
  address?: {
    street?: string | null;
    city?: string | null;
    zipCode?: string | null;
  } | null;
} | null | undefined): boolean {
  if (!user) return false;
  
  return !!(
    user.companyName &&
    user.legalForm &&
    user.address?.street &&
    user.address?.city &&
    user.address?.zipCode
  );
}

/**
 * Retourne la liste des champs manquants pour compléter un profil
 * Utile pour afficher des messages d'erreur précis à l'utilisateur
 * 
 * @param user - Objet utilisateur (partiel ou complet)
 * @returns Array de noms de champs manquants en français
 */
export function getMissingProfileFields(user: {
  companyName?: string | null;
  legalForm?: string | null;
  address?: {
    street?: string | null;
    city?: string | null;
    zipCode?: string | null;
  } | null;
} | null | undefined): string[] {
  if (!user) {
    return ['Raison sociale', 'Forme juridique', 'Adresse', 'Ville', 'Code postal'];
  }
  
  const missing: string[] = [];
  
  if (!user.companyName) missing.push('Raison sociale');
  if (!user.legalForm) missing.push('Forme juridique');
  if (!user.address?.street) missing.push('Adresse');
  if (!user.address?.city) missing.push('Ville');
  if (!user.address?.zipCode) missing.push('Code postal');
  
  return missing;
}

/**
 * Calcule le pourcentage de complétion du profil
 * Basé sur les 5 champs obligatoires
 * 
 * @param user - Objet utilisateur (partiel ou complet)
 * @returns Pourcentage entre 0 et 100
 */
export function getProfileCompletionPercentage(user: {
  companyName?: string | null;
  legalForm?: string | null;
  address?: {
    street?: string | null;
    city?: string | null;
    zipCode?: string | null;
  } | null;
} | null | undefined): number {
  if (!user) return 0;
  
  let completed = 0;
  const total = 5;
  
  if (user.companyName) completed++;
  if (user.legalForm) completed++;
  if (user.address?.street) completed++;
  if (user.address?.city) completed++;
  if (user.address?.zipCode) completed++;
  
  return Math.round((completed / total) * 100);
}
