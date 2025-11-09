/**
 * Service de parsing intelligent pour extraire les données d'une facture
 * à partir du texte OCR extrait par Tesseract.js
 */

export interface ParsedExpenseData {
  vendor: string;
  amount: number;
  taxAmount: number;
  date: Date | null;
  invoiceNumber: string;
  confidence: number;
}

/**
 * Extrait le montant total de la facture avec patterns améliorés
 */
function extractAmount(text: string): number {
  // Patterns améliorés pour trouver le montant total (contexte + variations)
  const patterns = [
    // Patterns avec contexte fort
    /total[\s:]+(?:ttc|à payer)?[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    /net[\s]+à[\s]+payer[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    /montant[\s]+(?:total|ttc)[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    /total[\s]+ttc[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    /à[\s]+payer[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    
    // Patterns en anglais
    /total[\s]+amount[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    /amount[\s]+due[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    
    // Patterns avec variations d'espacement
    /total\s*:\s*([0-9]+[,.]?[0-9]*)/i,
    /montant\s*:\s*([0-9]+[,.]?[0-9]*)/i,
    
    // Pattern avec ligne suivante (ex: "Total\n45.99€")
    /total[\s]*\n[\s]*([0-9]+[,.]?[0-9]*)\s*€?/i,
  ];

  // Rechercher avec les patterns contextuels
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(',', '.'));
      // Vérifier que c'est un montant plausible (> 0.01€ et < 1M€)
      if (amount > 0.01 && amount < 1000000) {
        return amount;
      }
    }
  }

  // Fallback intelligent: chercher les montants avec € et prendre le plus grand
  // mais en excluant les montants HT si on trouve un TTC
  const amountsWithContext = text.match(/([a-z\s]+)[\s:]*([0-9]+[,.]?[0-9]*)\s*€/gi);
  if (amountsWithContext) {
    // Trier par priorité: TTC > Total > autres
    const prioritized = amountsWithContext
      .map(match => {
        const numMatch = match.match(/([0-9]+[,.]?[0-9]*)\s*€/);
        const amount = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : 0;
        const priority = match.toLowerCase().includes('ttc') ? 3 :
                        match.toLowerCase().includes('total') ? 2 : 1;
        return { amount, priority };
      })
      .filter(item => item.amount > 0.01 && item.amount < 1000000)
      .sort((a, b) => b.priority - a.priority || b.amount - a.amount);
    
    if (prioritized.length > 0) {
      return prioritized[0].amount;
    }
  }

  // Dernier recours: tous les montants avec €
  const amounts = text.match(/([0-9]+[,.]?[0-9]*)\s*€/g);
  if (amounts && amounts.length > 0) {
    const numbers = amounts
      .map(a => parseFloat(a.replace('€', '').replace(',', '.')))
      .filter(n => n > 0.01 && n < 1000000);
    if (numbers.length > 0) {
      return Math.max(...numbers);
    }
  }

  return 0;
}

/**
 * Extrait le montant de la TVA
 */
function extractTaxAmount(text: string): number {
  const patterns = [
    /tva[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    /t\.v\.a\.?[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    /montant tva[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
    /tva\s+[0-9]+%[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i, // "TVA 20% 6.16 €"
    /dont tva[\s:]*([0-9]+[,.]?[0-9]*)\s*€?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }

  return 0;
}

/**
 * Extrait la date de la facture
 */
function extractDate(text: string): Date | null {
  // Formats de date français
  const patterns = [
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/,  // JJ/MM/AAAA
    /(\d{2,4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,  // AAAA/MM/JJ
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let day, month, year;
      
      if (match[3].length === 4) {
        // Format JJ/MM/AAAA
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
      } else if (match[1].length === 4) {
        // Format AAAA/MM/JJ
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else {
        // Par défaut JJ/MM/AA
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
        if (year < 100) year += 2000;
      }

      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

/**
 * Extrait le nom du fournisseur (première ligne en gras/grande) avec logique améliorée
 */
function extractVendor(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Stratégie 1: Recherche de patterns commerciaux connus
  const commercialPatterns = [
    /(?:société|entreprise|sarl|sas|sa|eurl)[\s:]*([a-z0-9\s&'-]+)/i,
    /^([A-Z][A-Z\s&'-]{2,30})(?:\s+(?:SA|SAS|SARL|EURL))?$/m, // Nom en majuscules
  ];
  
  for (const pattern of commercialPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const vendor = match[1].trim();
      if (vendor.length > 2 && vendor.length < 50) {
        return cleanVendorName(vendor);
      }
    }
  }
  
  // Stratégie 2: Analyser les premières lignes (contexte)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Exclure les lignes qui sont clairement des métadonnées
    if (line.match(/facture|ticket|reçu|siège|capital|r\.c\.s|tva|siret|date|n°|page|^[0-9]/i)) {
      continue;
    }
    
    // Privilégier les lignes courtes (noms) vs longues (adresses)
    if (line.length >= 3 && line.length <= 40) {
      // Vérifier que ce n'est pas juste une adresse
      if (!line.match(/^[0-9]+\s+rue|^[0-9]+\s+avenue|^[0-9]+\s+boulevard/i)) {
        return cleanVendorName(line);
      }
    }
  }
  
  // Stratégie 3: Recherche de mots-clés contextuels
  const contextMatch = text.match(/fournisseur[\s:]*([a-z0-9\s&'-]+)/i);
  if (contextMatch && contextMatch[1]) {
    return cleanVendorName(contextMatch[1].split(/\n|;|,/)[0]);
  }

  // Fallback: prendre la première ligne non vide valide
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length >= 3 && firstLine.length <= 50) {
      return cleanVendorName(firstLine);
    }
  }

  return 'Fournisseur inconnu';
}

/**
 * Nettoie le nom du fournisseur (retire les suffixes inutiles)
 */
function cleanVendorName(name: string): string {
  return name
    .replace(/\s+(SA|SAS|SARL|EURL|SCI|SASU|SELARL)$/i, '') // Supprimer forme juridique
    .replace(/\s+\([^)]*\)/g, '') // Supprimer parenthèses
    .replace(/\s{2,}/g, ' ') // Normaliser espaces
    .trim()
    .substring(0, 100); // Limiter à 100 caractères
}

/**
 * Extrait le numéro de facture
 */
function extractInvoiceNumber(text: string): string {
  const patterns = [
    /facture[\s#:n°]*([a-z0-9\-]+)/i,
    /n°[\s]*([a-z0-9\-]+)/i,
    /invoice[\s#:]*([a-z0-9\-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return '';
}

/**
 * Parse le texte OCR et extrait les informations de la facture
 */
export function parseExpenseFromOCR(ocrText: string): ParsedExpenseData {
  console.log('🔍 Début du parsing - Texte reçu (200 premiers caractères):', ocrText.substring(0, 200));
  
  const cleanText = ocrText.toLowerCase();

  const amount = extractAmount(cleanText);
  console.log('💰 Montant extrait:', amount);
  
  const taxAmount = extractTaxAmount(cleanText);
  console.log('📊 TVA extraite:', taxAmount);
  
  const date = extractDate(ocrText); // Original text pour les nombres
  console.log('📅 Date extraite:', date);
  
  const vendor = extractVendor(ocrText);
  console.log('🏪 Fournisseur extrait:', vendor);
  
  const invoiceNumber = extractInvoiceNumber(ocrText);
  console.log('🔢 Numéro de facture extrait:', invoiceNumber);

  // Calcul de confiance basé sur les données extraites
  let confidence = 0;
  if (amount > 0) confidence += 30;
  if (taxAmount > 0) confidence += 20;
  if (date) confidence += 20;
  if (vendor !== 'Fournisseur inconnu') confidence += 20;
  if (invoiceNumber) confidence += 10;

  console.log('✅ Score de confiance:', confidence + '%');

  return {
    vendor,
    amount,
    taxAmount,
    date: date || new Date(),
    invoiceNumber,
    confidence,
  };
}
