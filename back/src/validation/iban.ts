export const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

export function isIban(value: string): boolean {
  return IBAN_REGEX.test(value);
}