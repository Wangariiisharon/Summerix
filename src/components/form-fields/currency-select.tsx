import React, { useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { getCurrencies } from '@/services/utils';

interface CurrencySelectProps {
  value: string;
  onChange: any;
  error?: string;
  className?: string;
  as?: React.ElementType;
}

const currencies = getCurrencies();

export const CurrencySelect = ({
  value,
  onChange,
  error,
  className = 'form-select',
  as: Component = 'div',
  ...props
}: CurrencySelectProps) => {
  const [query, setQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    return query === ''
      ? currencies
      : currencies.filter((currency) => currency.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div className="relative">
      <Combobox as={Component} value={value} onChange={onChange} {...props}>
        <div className="relative">
          <Combobox.Input
            className={className}
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(value: any) =>
              currencies.find((currency) => currency.value === value)?.name || ''
            }
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredCurrencies.map((currency) => (
            <Combobox.Option
              key={currency.value}
              value={currency.value}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                }`
              }
            >
              {currency.name}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};
