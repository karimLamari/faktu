import { NextRequest } from 'next/server';
import InvoiceAudit, { IInvoiceChange } from '@/models/InvoiceAudit';

/**
 * Extrait l'adresse IP de la requête Next.js
 */
export function extractIpAddress(req: NextRequest): string {
  // Vérifier les headers de proxy (Vercel, Cloudflare, etc.)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Extrait le User-Agent de la requête
 */
export function extractUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'unknown';
}

/**
 * Logger une action sur une facture dans le système d'audit
 * 
 * @param invoiceId - ID de la facture concernée
 * @param userId - ID du propriétaire de la facture
 * @param action - Type d'action effectuée
 * @param performedBy - ID de l'utilisateur ayant effectué l'action
 * @param req - Requête Next.js (pour extraire IP et User-Agent)
 * @param changes - Liste des modifications (optionnel)
 * @param metadata - Métadonnées supplémentaires (optionnel)
 * @returns L'entrée d'audit créée ou null si erreur
 */
export async function logInvoiceAction(
  invoiceId: string,
  userId: string,
  action: 'created' | 'updated' | 'finalized' | 'sent' | 'deleted' | 'modification_attempt',
  performedBy: string,
  req?: NextRequest,
  changes: IInvoiceChange[] = [],
  metadata?: Record<string, any>
) {
  try {
    const ipAddress = req ? extractIpAddress(req) : undefined;
    const userAgent = req ? extractUserAgent(req) : undefined;

    // Utiliser la méthode statique du modèle directement
    const auditEntry = await (InvoiceAudit as any).logAction(
      invoiceId,
      userId,
      action,
      performedBy,
      changes,
      ipAddress,
      userAgent,
      metadata
    );

    return auditEntry;
  } catch (error) {
    console.error('❌ Erreur logInvoiceAction:', error);
    // Ne pas bloquer l'opération principale
    return null;
  }
}

/**
 * Détecte les changements entre deux objets facture
 * Utile pour logger les modifications précises
 * 
 * @param oldInvoice - Facture avant modification
 * @param newInvoice - Facture après modification
 * @param fieldsToTrack - Champs à surveiller (optionnel, tous par défaut)
 * @returns Liste des changements détectés
 */
export function detectInvoiceChanges(
  oldInvoice: any,
  newInvoice: any,
  fieldsToTrack?: string[]
): IInvoiceChange[] {
  const changes: IInvoiceChange[] = [];
  
  // Champs critiques à surveiller par défaut
  const defaultFields = [
    'invoiceNumber',
    'total',
    'subtotal',
    'taxAmount',
    'items',
    'issueDate',
    'dueDate',
    'status',
    'paymentStatus',
    'amountPaid',
    'balanceDue',
    'clientId',
  ];

  const fields = fieldsToTrack || defaultFields;

  for (const field of fields) {
    const oldValue = oldInvoice[field];
    const newValue = newInvoice[field];

    // Comparaison simple (peut être améliorée pour objets complexes)
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}

/**
 * Récupère l'historique d'audit d'une facture
 * 
 * @param invoiceId - ID de la facture
 * @param limit - Nombre max d'entrées à retourner
 * @returns Liste des entrées d'audit triées par date (plus récent en premier)
 */
export async function getInvoiceAuditHistory(
  invoiceId: string,
  limit: number = 50
) {
  try {
    const history = await InvoiceAudit.find({ invoiceId })
      .sort({ performedAt: -1 })
      .limit(limit)
      .populate('performedBy', 'firstName lastName email')
      .lean();

    return history;
  } catch (error) {
    console.error('❌ Erreur récupération audit history:', error);
    return [];
  }
}

/**
 * Vérifie si une facture a des tentatives de modification suspectes
 * 
 * @param invoiceId - ID de la facture
 * @param timeWindowMinutes - Fenêtre de temps à vérifier (par défaut 60 min)
 * @returns true si tentatives de modification détectées
 */
export async function hasRecentModificationAttempts(
  invoiceId: string,
  timeWindowMinutes: number = 60
): Promise<boolean> {
  try {
    const cutoffDate = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    const attempts = await InvoiceAudit.countDocuments({
      invoiceId,
      action: 'modification_attempt',
      performedAt: { $gte: cutoffDate },
    });

    return attempts > 0;
  } catch (error) {
    console.error('❌ Erreur vérification tentatives:', error);
    return false;
  }
}
