/** Validate EAN-13 / EAN-8 / UPC-A (12) check digits — filters misreads before hitting the network. */
export function isValidBarcode(code: string): boolean {
  if (!/^\d{8}$|^\d{12,13}$/.test(code)) return false;
  const digits = code.split('').map(Number);
  const check = digits.pop()!;
  let sum = 0;
  // Weights alternate 3,1 starting from the digit next to the check digit.
  for (let i = digits.length - 1, w = 3; i >= 0; i--, w = w === 3 ? 1 : 3) sum += digits[i] * w;
  return (10 - (sum % 10)) % 10 === check;
}

/** UPC-E is expanded by OFF itself; normalise UPC-A to EAN-13 like OFF does. */
export function normalizeBarcode(code: string): string {
  return code.length === 12 ? `0${code}` : code;
}
