import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

// Dossier racine pour le stockage des factures (HORS de public/)
const INVOICES_STORAGE_ROOT = path.join(process.cwd(), 'invoices');

/**
 * Génère un chemin de stockage sécurisé pour une facture PDF
 * Structure: invoices/userId/year/FAC-2025-0001.pdf
 *
 * @param userId - ID de l'utilisateur
 * @param year - Année de la facture
 * @param invoiceNumber - Numéro de facture complet (ex: FAC-2025-0001)
 * @returns Chemin relatif depuis INVOICES_STORAGE_ROOT
 */
export function generateInvoicePdfPath(
  userId: string,
  year: number,
  invoiceNumber: string
): string {
  // Nettoyer le numéro de facture pour le nom de fichier
  const safeInvoiceNumber = invoiceNumber
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 100);

  const filename = `${safeInvoiceNumber}.pdf`;
  return path.join(userId, year.toString(), filename);
}

/**
 * Sauvegarde un PDF de facture sur le serveur
 *
 * @param pdfBuffer - Buffer du PDF généré
 * @param userId - ID de l'utilisateur
 * @param year - Année de la facture
 * @param invoiceNumber - Numéro de facture
 * @returns Chemin relatif du fichier sauvegardé
 */
export async function saveInvoicePdfToServer(
  pdfBuffer: Buffer,
  userId: string,
  year: number,
  invoiceNumber: string
): Promise<string> {
  // Générer le chemin de stockage
  const relativePath = generateInvoicePdfPath(userId, year, invoiceNumber);
  const fullPath = path.join(INVOICES_STORAGE_ROOT, relativePath);

  // Créer les dossiers parents si nécessaire
  await ensureDirectoryExists(fullPath);

  // Sauvegarder le fichier
  await writeFile(fullPath, pdfBuffer);

  console.log(`✅ Facture PDF sauvegardée: ${relativePath}`);
  return relativePath;
}

/**
 * Lit un PDF de facture depuis le serveur
 *
 * @param relativePath - Chemin relatif depuis INVOICES_STORAGE_ROOT
 * @returns Buffer du fichier PDF
 */
export async function readInvoicePdfFromServer(relativePath: string): Promise<Buffer> {
  const fullPath = path.join(INVOICES_STORAGE_ROOT, relativePath);
  
  // Vérification sécurité (pas de path traversal)
  if (!isSecurePath(relativePath)) {
    throw new Error('Chemin non sécurisé détecté');
  }
  
  const buffer = await readFile(fullPath);
  return buffer;
}

/**
 * Vérifie si un PDF de facture existe
 *
 * @param relativePath - Chemin relatif depuis INVOICES_STORAGE_ROOT
 * @returns true si le fichier existe
 */
export async function invoicePdfExists(relativePath: string): Promise<boolean> {
  const fullPath = path.join(INVOICES_STORAGE_ROOT, relativePath);
  try {
    await access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calcule le hash SHA-256 d'un PDF pour vérification d'intégrité
 *
 * @param pdfBuffer - Buffer du PDF
 * @returns Hash SHA-256 en hexadécimal
 */
export function calculatePdfHash(pdfBuffer: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(pdfBuffer);
  return hash.digest('hex');
}

/**
 * Vérifie l'intégrité d'un PDF en comparant les hash
 *
 * @param relativePath - Chemin relatif du PDF sur disque
 * @param expectedHash - Hash attendu (stocké en DB)
 * @returns true si le hash correspond
 */
export async function verifyPdfIntegrity(
  relativePath: string,
  expectedHash: string
): Promise<{ verified: boolean; currentHash: string; message: string }> {
  try {
    // Lire le PDF depuis le disque
    const pdfBuffer = await readInvoicePdfFromServer(relativePath);
    
    // Calculer le hash actuel
    const currentHash = calculatePdfHash(pdfBuffer);
    
    // Comparer avec le hash attendu
    const verified = currentHash === expectedHash;
    
    return {
      verified,
      currentHash,
      message: verified 
        ? 'PDF intègre - Aucune modification détectée' 
        : '⚠️ PDF altéré - Hash ne correspond pas'
    };
  } catch (error: any) {
    return {
      verified: false,
      currentHash: '',
      message: `Erreur vérification: ${error.message}`
    };
  }
}

/**
 * Supprime un PDF de facture du serveur (soft delete recommandé)
 * ⚠️ À utiliser uniquement pour factures non finalisées
 *
 * @param relativePath - Chemin relatif depuis INVOICES_STORAGE_ROOT
 */
export async function deleteInvoicePdfFromServer(relativePath: string): Promise<void> {
  const fullPath = path.join(INVOICES_STORAGE_ROOT, relativePath);
  
  // Vérification sécurité
  if (!isSecurePath(relativePath)) {
    throw new Error('Chemin non sécurisé détecté');
  }
  
  try {
    await unlink(fullPath);
    console.log(`🗑️ Facture PDF supprimée: ${relativePath}`);
  } catch (error) {
    console.error(`Erreur suppression facture PDF ${relativePath}:`, error);
    throw error;
  }
}

/**
 * Crée les dossiers parents si nécessaire
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  try {
    await access(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Valide qu'un chemin est sécurisé (pas de path traversal)
 *
 * @param relativePath - Chemin à valider
 * @returns true si le chemin est sécurisé
 */
export function isSecurePath(relativePath: string): boolean {
  const fullPath = path.join(INVOICES_STORAGE_ROOT, relativePath);
  const normalizedPath = path.normalize(fullPath);
  const normalizedRoot = path.normalize(INVOICES_STORAGE_ROOT);

  return normalizedPath.startsWith(normalizedRoot);
}

/**
 * Obtient les informations d'un PDF de facture
 *
 * @param relativePath - Chemin relatif du PDF
 * @returns Taille du fichier et date de création
 */
export async function getInvoicePdfInfo(relativePath: string): Promise<{
  exists: boolean;
  size?: number;
  createdAt?: Date;
}> {
  const fullPath = path.join(INVOICES_STORAGE_ROOT, relativePath);
  
  try {
    const stats = await fs.promises.stat(fullPath);
    return {
      exists: true,
      size: stats.size,
      createdAt: stats.birthtime
    };
  } catch {
    return { exists: false };
  }
}
