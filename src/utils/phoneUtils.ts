/**
 * Phone utilities for Pata Amiga Purificación
 * International country code support and Colombian 10-digit validation
 */

export interface CountryCode {
  iso: string;
  name: string;
  code: string; // e.g. "+57"
  flag: string;
  digitLength: number;
}

export const COUNTRY_CODES: CountryCode[] = [
  { iso: 'CO', name: 'Colombia', code: '+57', flag: '🇨🇴', digitLength: 10 },
  { iso: 'MX', name: 'México', code: '+52', flag: '🇲🇽', digitLength: 10 },
  { iso: 'US', name: 'Estados Unidos / Canadá', code: '+1', flag: '🇺🇸', digitLength: 10 },
  { iso: 'ES', name: 'España', code: '+34', flag: '🇪🇸', digitLength: 9 },
  { iso: 'AR', name: 'Argentina', code: '+54', flag: '🇦🇷', digitLength: 10 },
  { iso: 'CL', name: 'Chile', code: '+56', flag: '🇨🇱', digitLength: 9 },
  { iso: 'PE', name: 'Perú', code: '+51', flag: '🇵🇪', digitLength: 9 },
  { iso: 'EC', name: 'Ecuador', code: '+593', flag: '🇪🇨', digitLength: 9 },
  { iso: 'VE', name: 'Venezuela', code: '+58', flag: '🇻🇪', digitLength: 10 },
  { iso: 'PA', name: 'Panamá', code: '+507', flag: '🇵🇦', digitLength: 8 },
  { iso: 'CR', name: 'Costa Rica', code: '+506', flag: '🇨🇷', digitLength: 8 },
  { iso: 'BR', name: 'Brasil', code: '+55', flag: '🇧🇷', digitLength: 11 },
  { iso: 'BO', name: 'Bolivia', code: '+591', flag: '🇧🇴', digitLength: 8 },
  { iso: 'UY', name: 'Uruguay', code: '+598', flag: '🇺🇾', digitLength: 8 }
];

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]; // Colombia (+57)

/**
 * Strips all non-digit characters and caps length to max
 */
export function sanitizePhoneDigits(value: string, maxLength = 10): string {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, maxLength);
}

/**
 * Legacy compatibility: Strips all non-digit characters and caps length to 10
 */
export function sanitizePhone10(value: string): string {
  return sanitizePhoneDigits(value, 10);
}

/**
 * Checks whether a phone number is valid for a given country or standard 10-digit format
 */
export function isValidPhoneForCountry(phone: string, countryCode = '+57'): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  const country = COUNTRY_CODES.find(c => c.code === countryCode) || DEFAULT_COUNTRY;
  return digits.length >= country.digitLength - 1 && digits.length <= country.digitLength + 2;
}

/**
 * Checks whether a phone number is valid and contains at least 7 and max 12 digits
 */
export function isValidPhone10(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  // Accepts standard Colombian 10-digit number or international with country code
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Formats a 10-digit phone number as standard Colombian mobile format: 312 890 4521
 */
export function formatPhone10(phone: string): string {
  const digits = sanitizePhoneDigits(phone, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
}

export interface ParsedPhone {
  countryCode: string;
  number: string;
  isValid: boolean;
  message: string;
  formatted: string;
}

/**
 * Parses a phone string into country code and local number and validates it
 */
export function parsePhoneWithCountry(fullPhone: string): ParsedPhone {
  if (!fullPhone || !fullPhone.trim()) {
    return {
      countryCode: '+57',
      number: '',
      isValid: false,
      message: 'Por favor ingresa un número de teléfono o celular.',
      formatted: ''
    };
  }
  
  const trimmed = fullPhone.trim();
  let country = DEFAULT_COUNTRY;
  let rawNumber = '';

  for (const c of COUNTRY_CODES) {
    if (trimmed.startsWith(c.code)) {
      country = c;
      const remainder = trimmed.slice(c.code.length).trim();
      rawNumber = remainder.replace(/\D/g, '');
      break;
    }
  }

  if (!rawNumber && !trimmed.startsWith('+')) {
    rawNumber = trimmed.replace(/\D/g, '');
  } else if (!rawNumber && trimmed.startsWith('+')) {
    // Other country code not in list
    const parts = trimmed.split(' ');
    const code = parts[0];
    rawNumber = parts.slice(1).join('').replace(/\D/g, '');
    country = { iso: 'OTHER', name: 'Internacional', code, flag: '🌐', digitLength: 10 };
  }

  // Validation
  let isValid = true;
  let message = '';

  if (!rawNumber) {
    isValid = false;
    message = 'Por favor ingresa los dígitos de tu número telefónico.';
  } else if (country.code === '+57') {
    // User requested strictly 10 digits for Colombian phone numbers
    if (rawNumber.length !== 10) {
      isValid = false;
      message = `El número telefónico para Colombia debe tener exactamente 10 dígitos (actualmente tiene ${rawNumber.length}).`;
    }
  } else {
    // Other international countries
    if (rawNumber.length < country.digitLength - 1 || rawNumber.length > country.digitLength + 3) {
      isValid = false;
      message = `El número para ${country.name} (${country.code}) debe tener aproximadamente ${country.digitLength} dígitos (ingresaste ${rawNumber.length}).`;
    }
  }

  const formatted = rawNumber ? `${country.code} ${rawNumber}` : country.code;

  return {
    countryCode: country.code,
    number: rawNumber,
    isValid,
    message,
    formatted
  };
}

