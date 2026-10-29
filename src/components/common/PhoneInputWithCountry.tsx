import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, AlertCircle, Phone } from 'lucide-react';
import type { CountryCode } from 'libphonenumber-js';
import {
  getAllCountries,
  getCountryByCode,
  validateAndFormatPhoneNumber,
  CountryInfo,
} from '../../data/countriesData';

export interface PhoneInputWithCountryProps {
  value: string;
  defaultCountry?: CountryCode;
  onChange: (e164Value: string, isValid: boolean, countryCode: CountryCode, rawInput: string) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  error?: string | null;
  helperText?: string;
  className?: string;
  id?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  value,
  defaultCountry = 'SO',
  onChange,
  required = false,
  disabled = false,
  label = 'Phone Number',
  placeholder,
  error: externalError,
  helperText,
  className = '',
  id = 'phone-input',
}) => {
  const allCountries = useMemo(() => getAllCountries(), []);

  // Determine initial country and local number from value
  const initialValidation = useMemo(() => {
    return validateAndFormatPhoneNumber(value || '', defaultCountry);
  }, [value, defaultCountry]);

  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(
    initialValidation.countryCode || defaultCountry
  );
  const [localNumber, setLocalNumber] = useState<string>(() => {
    if (!value) return '';
    // If value already starts with +, format it nationally or clean it
    if (value.startsWith('+') && initialValidation.isValid) {
      return initialValidation.nationalFormatted || value.replace(initialValidation.callingCode, '').trim();
    }
    return value;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = useMemo(() => {
    return getCountryByCode(selectedCountryCode) || allCountries[0];
  }, [selectedCountryCode, allCountries]);

  // Sync state if external value changes significantly
  useEffect(() => {
    if (value && value.startsWith('+')) {
      const parsed = validateAndFormatPhoneNumber(value, selectedCountryCode);
      if (parsed.countryCode !== selectedCountryCode) {
        setSelectedCountryCode(parsed.countryCode);
      }
    }
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Filter countries by name or calling code
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.callingCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [allCountries, searchQuery]);

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountryCode(country.code);
    setIsDropdownOpen(false);
    setSearchQuery('');

    // Re-validate existing local number with new country
    const res = validateAndFormatPhoneNumber(localNumber, country.code);
    onChange(res.e164, res.isValid, country.code, localNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalNumber(raw);
    setIsTouched(true);

    // If user typed or pasted an international number starting with +
    if (raw.trim().startsWith('+')) {
      const res = validateAndFormatPhoneNumber(raw, selectedCountryCode);
      if (res.countryCode && res.countryCode !== selectedCountryCode) {
        setSelectedCountryCode(res.countryCode);
      }
      onChange(res.e164, res.isValid, res.countryCode, raw);
    } else {
      const res = validateAndFormatPhoneNumber(raw, selectedCountryCode);
      onChange(res.e164, res.isValid, selectedCountryCode, raw);
    }
  };

  const currentValidation = useMemo(() => {
    return validateAndFormatPhoneNumber(localNumber, selectedCountryCode);
  }, [localNumber, selectedCountryCode]);

  const displayError = externalError || (isTouched && localNumber && !currentValidation.isValid ? currentValidation.errorMessage : null);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-foreground flex items-center justify-between">
          <span>
            {label} {required && <span className="text-destructive">*</span>}
          </span>
          {currentValidation.isValid && (
            <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Valid format ({currentValidation.e164})</span>
            </span>
          )}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <div
          className={`flex items-center rounded-xl bg-slate-50 border transition-all ${
            displayError
              ? 'border-rose-300 focus-within:ring-1 focus-within:ring-rose-400'
              : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'
          }`}
        >
          {/* Country Selector Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-l-xl hover:bg-muted/70 text-xs font-semibold text-foreground border-r border-border/70 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            title={`${selectedCountry.name} (${selectedCountry.callingCode})`}
          >
            <span className="text-base leading-none select-none">{selectedCountry.flag}</span>
            <span className="text-xs font-bold text-foreground">{selectedCountry.callingCode}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Local Phone Number Input */}
          <div className="relative flex-1">
            <input
              id={id}
              type="tel"
              disabled={disabled}
              required={required}
              value={localNumber}
              onChange={handleNumberChange}
              onBlur={() => setIsTouched(true)}
              placeholder={placeholder || selectedCountry.examplePlaceholder || '61 123 4567'}
              className="w-full px-3.5 py-2.5 text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 font-medium"
            />
          </div>
        </div>

        {/* Searchable Country Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-full sm:w-80 max-h-72 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95">
            {/* Search Input */}
            <div className="p-2 border-b border-border/80 bg-muted/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or dial code..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Countries List */}
            <div className="overflow-y-auto flex-1 divide-y divide-border/30">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No matching countries found.
                </div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountryCode;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs cursor-pointer ${
                        isSelected ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg leading-none select-none">{c.flag}</span>
                        <span className="truncate font-medium">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[11px] font-mono text-muted-foreground">{c.callingCode}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {displayError ? (
        <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </p>
      ) : helperText ? (
        <p className="text-[10px] text-muted-foreground mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
