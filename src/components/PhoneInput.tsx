import React, { useState, useEffect } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { COUNTRY_CODES, CountryCode, DEFAULT_COUNTRY, sanitizePhoneDigits, formatPhone10, parsePhoneWithCountry } from '../utils/phoneUtils';

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string, rawNumber: string, countryCode: string) => void;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  defaultCountryCode?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  id = 'phone-input',
  required = false,
  placeholder,
  className = '',
  disabled = false,
  defaultCountryCode = '+57'
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    const parsed = parsePhoneWithCountry(value);
    return COUNTRY_CODES.find(c => c.code === parsed.countryCode) || 
      COUNTRY_CODES.find(c => c.code === defaultCountryCode) || 
      DEFAULT_COUNTRY;
  });

  const [number, setNumber] = useState<string>(() => {
    const parsed = parsePhoneWithCountry(value);
    return parsed.number;
  });

  // Synchronize when external value changes
  useEffect(() => {
    if (value) {
      const parsed = parsePhoneWithCountry(value);
      const match = COUNTRY_CODES.find(c => c.code === parsed.countryCode);
      if (match && match.code !== selectedCountry.code) {
        setSelectedCountry(match);
      }
      if (parsed.number !== number) {
        setNumber(parsed.number);
      }
    }
  }, [value]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountryCode = e.target.value;
    const country = COUNTRY_CODES.find(c => c.code === newCountryCode) || DEFAULT_COUNTRY;
    setSelectedCountry(country);
    
    const formatted = country.code === '+57' ? formatPhone10(number) : number;
    const combined = number ? `${country.code} ${formatted}`.trim() : '';
    onChange(combined, number, country.code);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digits = sanitizePhoneDigits(rawVal, selectedCountry.digitLength + 2);
    setNumber(digits);

    const formatted = selectedCountry.code === '+57' ? formatPhone10(digits) : digits;
    const combined = digits ? `${selectedCountry.code} ${formatted}`.trim() : '';
    onChange(combined, digits, selectedCountry.code);
  };

  const dynamicPlaceholder = placeholder || (selectedCountry.code === '+57' ? '312 890 4521' : 'Número telefónico');

  return (
    <div className={`relative flex items-center rounded-xl bg-white border border-[#E8DFD3] focus-within:ring-2 focus-within:ring-[#9E6B38] focus-within:border-transparent transition overflow-hidden ${className}`}>
      {/* Country Selector with Flag */}
      <div className="relative flex items-center bg-[#FAF6F0] border-r border-[#E8DFD3] px-2.5 py-2 shrink-0">
        <span className="text-base mr-1 select-none" role="img" aria-label={selectedCountry.name}>
          {selectedCountry.flag}
        </span>
        <span className="text-xs font-bold text-[#2C1E14] select-none">
          {selectedCountry.code}
        </span>
        <ChevronDown className="w-3 h-3 text-[#8A7568] ml-1 shrink-0 pointer-events-none" />
        <select
          id={`${id}-country-select`}
          value={selectedCountry.code}
          onChange={handleCountryChange}
          disabled={disabled}
          title="Seleccionar indicativo internacional"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code + c.iso} value={c.code}>
              {c.flag} {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      {/* Local Phone Number Input */}
      <div className="relative flex-1 flex items-center">
        <Phone className="w-3.5 h-3.5 text-[#9E6B38] absolute left-3 pointer-events-none shrink-0" />
        <input
          id={id}
          type="tel"
          required={required}
          disabled={disabled}
          value={selectedCountry.code === '+57' ? formatPhone10(number) : number}
          onChange={handleNumberChange}
          placeholder={dynamicPlaceholder}
          maxLength={selectedCountry.code === '+57' ? 12 : 16}
          className="w-full pl-9 pr-3 py-2 bg-transparent text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none disabled:opacity-50"
        />
      </div>
    </div>
  );
};
