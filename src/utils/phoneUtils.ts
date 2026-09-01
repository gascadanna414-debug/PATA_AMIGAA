/**
 * Phone utilities for Pata Amiga Purificación
 * Strict requirement: Colombian phone numbers must be exactly 10 digits (e.g. 3128904521)
 */

/**
 * Strips all non-digit characters and caps length to 10
 */
export function sanitizePhone10(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 10);
}

/**
 * Checks whether a phone number is valid and contains exactly 10 numeric digits
 */
export function isValidPhone10(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

/**
 * Formats a 10-digit phone number as standard Colombian mobile format: 312 890 4521
 */
export function formatPhone10(phone: string): string {
  const digits = sanitizePhone10(phone);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
}
