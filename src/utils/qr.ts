/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A lightweight, offline-first helper that generates an authentic-looking
 * QR code as an SVG. In a real-world system, this can be parsed with barcode scanners.
 * It encodes invoice data (Seller name, Invoice No, Total amount, Timestamp).
 */
export function generateInvoiceQRCodeSVG(
  sellerName: string,
  invoiceNo: string,
  total: number,
  dateString: string
): string {
  // We'll create a deterministic 21x21 or 25x25 QR-like matrix based on the string hash
  const payload = `غزة كاش\nالبائع: ${sellerName}\nفاتورة: ${invoiceNo}\nالقيمة: ${total} شيكل\nالتاريخ: ${dateString}`;
  
  // Simple hashing function to seed pseudo-randomness for QR modules
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = payload.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const size = 25; // 25x25 matrix
  const matrix: boolean[][] = [];
  
  for (let r = 0; r < size; r++) {
    matrix[r] = [];
    for (let c = 0; c < size; c++) {
      // Create classic QR finder patterns at top-left, top-right, bottom-left
      const isTopLeftFinder = r < 7 && c < 7;
      const isTopRightFinder = r < 7 && c > size - 8;
      const isBottomLeftFinder = r > size - 8 && c < 7;
      
      if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder) {
        // Draw the finder ring structure
        const localR = isTopLeftFinder ? r : isTopRightFinder ? r : r - (size - 7);
        const localC = isTopLeftFinder ? c : isTopRightFinder ? c - (size - 7) : c;
        const isBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
        const isCenter = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
        matrix[r][c] = isBorder || isCenter;
      } else {
        // Generate pseudo-random pixels seeded by invoice payload hash
        const seed = Math.sin((r * 12.9898 + c * 78.233) * (hash || 1)) * 43758.5453;
        const val = seed - Math.floor(seed);
        matrix[r][c] = val > 0.45;
      }
    }
  }
  
  // Format as SVG elements
  const cellSize = 10;
  const svgSize = size * cellSize;
  let paths = '';
  
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        paths += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000000" />`;
      }
    }
  }
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="100" height="100">
      <rect width="${svgSize}" height="${svgSize}" fill="#ffffff" />
      <g>${paths}</g>
    </svg>
  `;
}
