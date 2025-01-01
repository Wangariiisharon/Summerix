import React, { useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { getCountries } from '@/services/utils';

interface CountrySelectProps {
  value: string;
  onChange: any;
  onDialCodeChange?: any;
  error?: string;
  className?: string;
  as?: React.ElementType;
}

const countries = getCountries();

export const CountrySelect = ({
  value,
  onChange,
  onDialCodeChange,
  error,
  className = 'form-select',
  as: Component = 'div',
  ...props
}: CountrySelectProps) => {
  const [query, setQuery] = useState('');

  const filteredCountries = useMemo(() => {
    return query === ''
      ? countries
      : countries.filter((country) => country.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const handleChange = (newValue: string) => {
    const country = countries.find((c) => c.value === newValue);
    onChange(newValue);
    if (onDialCodeChange && country) {
      onDialCodeChange(country.dialing_code);
    }
  };

  return (
    <div className="relative">
      <Combobox as={Component} value={value} onChange={handleChange} {...props}>
        <div className="relative">
          <Combobox.Input
            className={className}
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(value: any) =>
              countries.find((country) => country.value === value)?.name || ''
            }
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredCountries.map((country) => (
            <Combobox.Option
              key={country.value}
              value={country.value}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                }`
              }
            >
              {country.name}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};
