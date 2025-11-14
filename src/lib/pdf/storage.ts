import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

/**
 * Configuration du stockage des PDF
 * Les PDF sont stockés dans le dossier /invoices à la racine du projet
 * Structure : /invoices/userId/year/month/invoiceNumber.pdf
 */
const PDF_STORAGE_ROOT = path.join(process.cwd(), 'invoices');

/**
 * Génère le chemin de stockage pour un PDF de facture
 * Format : invoices/userId/2025/01/FAC-2025-001.pdf
 */
export function generatePdfPath(
  userId: string,
  invoiceNumber: string,
  issueDate: Date
): string {
  const year = issueDate.getFullYear();
  const month = String(issueDate.getMonth() + 1).padStart(2, '0');

  // Nettoyer le numéro de facture pour le nom de fichier (enlever caractères spéciaux)
  const safeInvoiceNumber = invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_');

  return path.join(userId, String(year), month, `${safeInvoiceNumber}.pdf`);
}

/**
 * Crée les dossiers nécessaires pour stocker un PDF
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  try {
    await access(dir);
  } catch {
    // Le dossier n'existe pas, on le crée
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Sauvegarde un PDF sur le serveur
 * @param pdfBuffer Buffer contenant le PDF
 * @param relativePath Chemin relatif (généré par generatePdfPath)
 * @returns Chemin relatif du fichier sauvegardé
 */
export async function savePdfToServer(
  pdfBuffer: Buffer,
  relativePath: string
): Promise<string> {
  const fullPath = path.join(PDF_STORAGE_ROOT, relativePath);

  // Créer les dossiers si nécessaire
  await ensureDirectoryExists(fullPath);

  // Écrire le fichier
  await writeFile(fullPath, pdfBuffer);

  console.log(`✅ PDF sauvegardé: ${relativePath}`);

  return relativePath;
}

/**
 * Lit un PDF depuis le serveur
 * @param relativePath Chemin relatif du PDF
 * @returns Buffer du PDF
 */
export async function readPdfFromServer(relativePath: string): Promise<Buffer> {
  const fullPath = path.join(PDF_STORAGE_ROOT, relativePath);

  try {
    const buffer = await readFile(fullPath);
    return buffer;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`PDF non trouvé: ${relativePath}`);
    }
    throw error;
  }
}

/**
 * Vérifie si un PDF existe sur le serveur
 * @param relativePath Chemin relatif du PDF
 * @returns true si le fichier existe
 */
export async function pdfExists(relativePath: string): Promise<boolean> {
  const fullPath = path.join(PDF_STORAGE_ROOT, relativePath);
  try {
    await access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Supprime un PDF du serveur (à utiliser avec précaution !)
 * En principe, on ne devrait JAMAIS supprimer une facture finalisée
 * Cette fonction est là uniquement pour le nettoyage des brouillons
 */
export async function deletePdfFromServer(relativePath: string): Promise<void> {
  const fullPath = path.join(PDF_STORAGE_ROOT, relativePath);
  try {
    await unlink(fullPath);
    console.log(`🗑️ PDF supprimé: ${relativePath}`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`❌ Erreur suppression PDF: ${relativePath}`, error);
    }
  }
}

/**
 * Obtient la taille d'un PDF en octets
 */
export async function getPdfSize(relativePath: string): Promise<number> {
  const fullPath = path.join(PDF_STORAGE_ROOT, relativePath);
  const stats = await fs.promises.stat(fullPath);
  return stats.size;
}

/**
 * Formate la taille d'un fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
