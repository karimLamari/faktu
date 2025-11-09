/**
 * Service de prétraitement d'images pour améliorer la qualité OCR
 * Applique des techniques de traitement d'image pour optimiser la reconnaissance
 */

export interface PreprocessOptions {
  denoise?: boolean;
  sharpen?: boolean;
  contrast?: boolean;
  binarize?: boolean;
  deskew?: boolean;
}

/**
 * Prétraite une image pour améliorer la qualité OCR
 * Utilise Canvas API pour les transformations côté client
 */
export async function preprocessImageForOCR(
  file: File,
  options: PreprocessOptions = {}
): Promise<File> {
  const {
    denoise = true,
    sharpen = true,
    contrast = true,
    binarize = true,
    deskew = false
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = async () => {
      try {
        // Créer un canvas avec la taille optimale pour OCR (max 2000px)
        const maxSize = 2000;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // 1. Augmenter le contraste
        if (contrast) {
          const imageData = ctx.getImageData(0, 0, width, height);
          applyContrast(imageData, 1.5);
          ctx.putImageData(imageData, 0, 0);
        }

        // 2. Appliquer un filtre de netteté (sharpen)
        if (sharpen) {
          const imageData = ctx.getImageData(0, 0, width, height);
          applySharpen(imageData);
          ctx.putImageData(imageData, 0, 0);
        }

        // 3. Convertir en niveaux de gris
        const imageData = ctx.getImageData(0, 0, width, height);
        applyGrayscale(imageData);
        ctx.putImageData(imageData, 0, 0);

        // 4. Binarisation (noir et blanc pur) - améliore beaucoup l'OCR
        if (binarize) {
          const imageData = ctx.getImageData(0, 0, width, height);
          applyOtsuBinarization(imageData);
          ctx.putImageData(imageData, 0, 0);
        }

        // 5. Débruitage (denoise)
        if (denoise) {
          const imageData = ctx.getImageData(0, 0, width, height);
          applyMedianFilter(imageData);
          ctx.putImageData(imageData, 0, 0);
        }

        // Convertir le canvas en Blob puis en File
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name, { type: 'image/png' });
            resolve(processedFile);
          } else {
            reject(new Error('Échec de conversion canvas → blob'));
          }
        }, 'image/png', 0.95);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Échec de chargement de l\'image'));
    reader.onerror = () => reject(new Error('Échec de lecture du fichier'));
    reader.readAsDataURL(file);
  });
}

/**
 * Augmente le contraste de l'image
 */
function applyContrast(imageData: ImageData, factor: number) {
  const data = imageData.data;
  const contrast = (factor - 1) * 128;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128 + contrast); // R
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128 + contrast); // G
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128 + contrast); // B
  }
}

/**
 * Applique un filtre de netteté (sharpen)
 */
function applySharpen(imageData: ImageData) {
  // Kernel de netteté 3x3
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  applyConvolution(imageData, kernel);
}

/**
 * Convertit en niveaux de gris
 */
function applyGrayscale(imageData: ImageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

/**
 * Binarisation adaptative avec méthode d'Otsu
 * Convertit en noir et blanc pur pour améliorer l'OCR
 */
function applyOtsuBinarization(imageData: ImageData) {
  const data = imageData.data;
  const histogram = new Array(256).fill(0);

  // Calculer l'histogramme
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i]; // Déjà en niveaux de gris
    histogram[gray]++;
  }

  // Calculer le seuil optimal avec Otsu
  const threshold = calculateOtsuThreshold(histogram, data.length / 4);

  // Appliquer la binarisation
  for (let i = 0; i < data.length; i += 4) {
    const value = data[i] > threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
}

/**
 * Calcule le seuil optimal avec l'algorithme d'Otsu
 */
function calculateOtsuThreshold(histogram: number[], totalPixels: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 0;

  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;

    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += i * histogram[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const variance = wB * wF * (mB - mF) * (mB - mF);

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }

  return threshold;
}

/**
 * Applique un filtre médian pour réduire le bruit (denoise)
 */
function applyMedianFilter(imageData: ImageData, radius = 1) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const values: number[] = [];
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          values.push(copy[idx]);
        }
      }

      values.sort((a, b) => a - b);
      const median = values[Math.floor(values.length / 2)];
      
      const idx = (y * width + x) * 4;
      data[idx] = median;
      data[idx + 1] = median;
      data[idx + 2] = median;
    }
  }
}

/**
 * Applique une convolution avec un kernel donné
 */
function applyConvolution(imageData: ImageData, kernel: number[]) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);
  const kernelSize = Math.sqrt(kernel.length);
  const half = Math.floor(kernelSize / 2);

  for (let y = half; y < height - half; y++) {
    for (let x = half; x < width - half; x++) {
      let sum = 0;
      
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const py = y + ky - half;
          const px = x + kx - half;
          const idx = (py * width + px) * 4;
          sum += copy[idx] * kernel[ky * kernelSize + kx];
        }
      }

      const idx = (y * width + x) * 4;
      data[idx] = clamp(sum);
      data[idx + 1] = clamp(sum);
      data[idx + 2] = clamp(sum);
    }
  }
}

/**
 * Limite une valeur entre 0 et 255
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

/**
 * Détecte et corrige l'orientation de l'image (rotation)
 * Utilise Tesseract OSD (Orientation and Script Detection)
 */
export async function detectAndFixOrientation(file: File): Promise<File> {
  // Cette fonctionnalité nécessiterait Tesseract en mode OSD
  // Pour l'instant, retourne le fichier tel quel
  // TODO: Implémenter la détection d'orientation
  return file;
}
