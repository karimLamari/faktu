import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

// Dossier racine pour le stockage des contrats (HORS de public/)
const CONTRACTS_STORAGE_ROOT = path.join(process.cwd(), 'contracts');

/**
 * Génère un chemin de stockage sécurisé pour un contrat
 * Structure: contracts/userId/clientId/timestamp_filename.ext
 *
 * @param userId - ID de l'utilisateur
 * @param clientId - ID du client
 * @param originalFilename - Nom original du fichier
 * @returns Chemin relatif depuis CONTRACTS_STORAGE_ROOT
 */
export function generateContractPath(
  userId: string,
  clientId: string,
  originalFilename: string
): string {
  const timestamp = Date.now();
  const ext = path.extname(originalFilename);
  const baseNameWithoutExt = path.basename(originalFilename, ext);

  // Nettoyer le nom de fichier
  const safeName = baseNameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 100); // Limiter la longueur

  const filename = `${timestamp}_${safeName}${ext}`;

  return path.join(userId, clientId, filename);
}

/**
 * Sauvegarde un contrat sur le serveur
 *
 * @param file - Objet File du navigateur
 * @param userId - ID de l'utilisateur
 * @param clientId - ID du client
 * @returns Chemin relatif du fichier sauvegardé
 */
export async function saveContractToServer(
  file: File,
  userId: string,
  clientId: string
): Promise<string> {
  // Générer le chemin de stockage
  const relativePath = generateContractPath(userId, clientId, file.name);
  const fullPath = path.join(CONTRACTS_STORAGE_ROOT, relativePath);

  // Créer les dossiers parents si nécessaire
  await ensureDirectoryExists(fullPath);

  // Convertir le File en Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Sauvegarder le fichier
  await writeFile(fullPath, buffer);

  console.log(`✅ Contrat sauvegardé: ${relativePath}`);
  return relativePath;
}

/**
 * Lit un contrat depuis le serveur
 *
 * @param relativePath - Chemin relatif depuis CONTRACTS_STORAGE_ROOT
 * @returns Buffer du fichier
 */
export async function readContractFromServer(relativePath: string): Promise<Buffer> {
  const fullPath = path.join(CONTRACTS_STORAGE_ROOT, relativePath);
  const buffer = await readFile(fullPath);
  return buffer;
}

/**
 * Vérifie si un contrat existe
 *
 * @param relativePath - Chemin relatif depuis CONTRACTS_STORAGE_ROOT
 * @returns true si le fichier existe
 */
export async function contractExists(relativePath: string): Promise<boolean> {
  const fullPath = path.join(CONTRACTS_STORAGE_ROOT, relativePath);
  try {
    await access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Supprime un contrat du serveur
 *
 * @param relativePath - Chemin relatif depuis CONTRACTS_STORAGE_ROOT
 */
export async function deleteContractFromServer(relativePath: string): Promise<void> {
  const fullPath = path.join(CONTRACTS_STORAGE_ROOT, relativePath);
  try {
    await unlink(fullPath);
    console.log(`🗑️ Contrat supprimé: ${relativePath}`);
  } catch (error) {
    console.error(`Erreur suppression contrat ${relativePath}:`, error);
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
  const fullPath = path.join(CONTRACTS_STORAGE_ROOT, relativePath);
  const normalizedPath = path.normalize(fullPath);
  const normalizedRoot = path.normalize(CONTRACTS_STORAGE_ROOT);

  return normalizedPath.startsWith(normalizedRoot);
}
