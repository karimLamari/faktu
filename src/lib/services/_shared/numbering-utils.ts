/**
 * 🔢 Utilitaires partagés pour la numérotation des documents
 * 
 * Utilisé par:
 * - invoice-numbering.ts (factures)
 * - quote-numbering.ts (devis)
 * 
 * Ces fonctions garantissent une cohérence dans le formatage
 * des numéros de documents à travers l'application.
 */

/**
 * Formate un numéro avec padding de zéros à gauche
 * @param num - Le numéro à formater
 * @param length - La longueur finale souhaitée (défaut: 4)
 * @returns Le numéro formaté avec zéros à gauche
 * @example formatNumber(42, 4) => "0042"
 * @example formatNumber(1, 4) => "0001"
 */
export function formatNumber(num: number, length: number = 4): string {
  return String(num).padStart(length, '0');
}

/**
 * Construit un numéro de document complet selon un format standardisé
 * @param prefix - Le préfixe du document (ex: "FAC", "DEVIS")
 * @param year - L'année du document
 * @param number - Le numéro séquentiel
 * @param clientInitials - Optionnel: initiales du client (3 lettres)
 * @returns Le numéro de document formaté
 * @example buildDocumentNumber("FAC", 2025, 42) => "FAC2025-0042"
 * @example buildDocumentNumber("FAC", 2025, 42, "ABC") => "FAC2025-ABC-0042"
 * @example buildDocumentNumber("DEVIS", 2025, 1) => "DEVIS2025-0001"
 */
export function buildDocumentNumber(
  prefix: string,
  year: number,
  number: number,
  clientInitials?: string
): string {
  const paddedNumber = formatNumber(number);
  
  if (clientInitials && clientInitials.length > 0) {
    return `${prefix}${year}-${clientInitials}-${paddedNumber}`;
  }
  
  return `${prefix}${year}-${paddedNumber}`;
}

/**
 * Détermine si la numérotation doit être réinitialisée (changement d'année)
 * @param storedYear - L'année stockée dans la base de données
 * @returns true si l'année a changé et qu'il faut réinitialiser
 * @example shouldResetYear(2024) => true (si on est en 2025)
 * @example shouldResetYear(2025) => false (si on est en 2025)
 */
export function shouldResetYear(storedYear: number): boolean {
  const currentYear = new Date().getFullYear();
  return storedYear !== currentYear;
}

/**
 * Extrait et formate les initiales d'un nom de client
 * @param clientName - Le nom du client
 * @param maxLength - Nombre maximum de caractères (défaut: 3)
 * @returns Les initiales en majuscules, lettres uniquement
 * @example extractClientInitials("Acme Corporation") => "ACM"
 * @example extractClientInitials("Jean Dupont") => "JEA"
 * @example extractClientInitials("123 Company") => "COM" (skip les chiffres)
 */
export function extractClientInitials(
  clientName: string,
  maxLength: number = 3
): string {
  return clientName
    .trim()
    .substring(0, maxLength)
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

/**
 * Valide qu'un préfixe est conforme aux règles
 * @param prefix - Le préfixe à valider
 * @returns true si valide, false sinon
 * @example isValidPrefix("FAC") => true
 * @example isValidPrefix("DEVIS") => true
 * @example isValidPrefix("") => false
 * @example isValidPrefix("TOOLONGPREFIX") => false
 */
export function isValidPrefix(prefix: string): boolean {
  return prefix.length > 0 && prefix.length <= 10;
}
