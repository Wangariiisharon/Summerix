import { useEffect, useState } from 'react';
import country from 'country-list-js';

function useCountries() {
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    const fetchCountries = () => {
      try {
        const country_names = country.names();
        const sortedCountryNames = country_names.sort((a, b) => a.localeCompare(b));
        setCountries(sortedCountryNames);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  return {
    countries,
    loading,
  };
}

export default useCountries;
