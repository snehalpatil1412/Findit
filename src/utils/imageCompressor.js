/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Produces an optimized Base64 JPEG string (typically <80KB)
 * allowing free storage in Firebase Realtime Database without payment or cloud buckets.
 *
 * @param {File} file - Original file from input[type=file]
 * @param {number} maxDimension - Max width or height (default 800px)
 * @param {number} quality - JPEG compression quality 0.1 - 1.0 (default 0.7)
 * @returns {Promise<{base64: string, sizeKb: number, originalSizeKb: number, compressionRatio: string}>}
 */
export async function compressImage(file, maxDimension = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const originalSizeKb = Math.round(file.size / 1024 * 10) / 10;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image in memory'));

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio-preserved bounding box
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Clear background and fill with white for transparent PNG support
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw downscaled image
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with chosen quality
        const base64 = canvas.toDataURL('image/jpeg', quality);

        // Calculate final size in KB from base64 string
        const base64Length = base64.length - (base64.indexOf(',') + 1);
        const finalSizeInBytes = Math.round((base64Length * 3) / 4);
        const sizeKb = Math.round((finalSizeInBytes / 1024) * 10) / 10;

        const ratio = originalSizeKb > 0
          ? `${Math.round(((originalSizeKb - sizeKb) / originalSizeKb) * 100)}% reduction`
          : '0%';

        resolve({
          base64,
          sizeKb,
          originalSizeKb,
          compressionRatio: ratio
        });
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}
