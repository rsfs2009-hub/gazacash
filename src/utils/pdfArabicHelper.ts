// @ts-ignore
import reshaper from 'arabic-persian-reshaper';

/**
 * Reshapes and reverses Arabic text so it displays properly in PDF documents (RTL).
 * It preserves non-Arabic words (English, numbers, symbols) in their correct LTR order
 * while keeping Arabic words in RTL order.
 */
export function reshapeArabic(text: any): string {
  if (text === undefined || text === null) return '';
  const str = String(text).trim();
  if (!str) return '';

  // Check if it contains Arabic characters
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(str);
  if (!hasArabic) return str;

  // First, convert/reshape Arabic letters so they are joined correctly
  // @ts-ignore
  const convertArabic = reshaper?.ArabicShaper?.convertArabic || reshaper?.default?.ArabicShaper?.convertArabic || ((s: string) => s);
  const reshaped = convertArabic(str);

  // Split into lines to maintain layout structure
  const lines = reshaped.split('\n');
  const processedLines = lines.map(line => {
    const tokens: { type: 'arabic' | 'latin'; text: string }[] = [];
    let currentToken = '';
    let lastType: 'arabic' | 'latin' | null = null;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      // Arabic/Persian ranges
      const isArabicChar = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(char);
      const type = isArabicChar ? 'arabic' : 'latin';

      if (lastType === null) {
        currentToken = char;
        lastType = type;
      } else if (lastType === type) {
        currentToken += char;
      } else {
        tokens.push({ type: lastType, text: currentToken });
        currentToken = char;
        lastType = type;
      }
    }
    if (currentToken) {
      tokens.push({ type: lastType!, text: currentToken });
    }

    // Reverse characters of Arabic tokens only (since react-pdf draws left-to-right)
    const processedTokens = tokens.map(token => {
      if (token.type === 'arabic') {
        return token.text.split('').reverse().join('');
      } else {
        return token.text;
      }
    });

    // Reverse the sequence of tokens so the entire line reads right-to-left
    return processedTokens.reverse().join('');
  });

  return processedLines.join('\n');
}
