import { fbStorage } from '@/firebase/configs';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import CountryList from 'country-list-js';
import { getIn } from 'formik';
import moment from 'moment-timezone';
import { CountryCode } from '@/types';
import { isValidPhoneNumber } from 'libphonenumber-js';

export interface CountryOption {
  name: string;
  value: string;
  dial_code: string;
}
interface CountryData {
  capital: string;
  continent: string;
  currency: string;
  currency_decimal: string;
  currency_symbol: string;
  dialing_code: string;
  iso2: CountryCode;
  iso3: string;
  name: string;
  provinces: string;
  region: string;
  value: string;
}

export function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ');
}

export const camelCaseToWords = (s: string) => {
  const result = s.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const getAvatarPhoto = (name: string, size: number = 300) => {
  return `https://ui-avatars.com/api/?name=${name}&size=${size}`;
};
export const getVehiclePhoto = (regNumber: string, size: number = 300) => {
  const initials = regNumber.slice(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&size=${size}`;
};

export const getInputStyle = (errors: any, fieldName: string | string[]) => {
  return getIn(errors, fieldName) ? 'form-input border-red-500 text-red-500' : 'form-input';
};

export const doUploadImage = async (data: File | Blob, folder: string, fileName: string) => {
  console.debug('doUploadImage > params:', { data, folder, fileName });
  const storageRef = ref(fbStorage, `${folder}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, data);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
};

export const getTimezones = () => {
  return moment.tz.names().map((tz) => {
    const offset = moment.tz(tz).utcOffset() / 60;
    const offsetString = offset >= 0 ? `GMT+${offset}` : `GMT${offset}`;
    return {
      name: `${tz} (${offsetString})`,
      offsetString: offsetString,
      value: tz.toLowerCase(),
    };
  });
};

export const getCountries = (): CountryData[] => {
  const countriesList: { [key: string]: CountryData } = CountryList.all;
  const countries = Object.values(countriesList).map((country) => {
    return {
      ...country,
      dial_code: country.dialing_code,
      value: country.name.toLowerCase(),
    };
  });

  countries.sort((a, b) => (a.name > b.name ? 1 : -1));
  return countries;
};

// Dedicated function for getting country dial code
export const getCountryDialCode = (countryName: string): string => {
  if (!countryName) return '+1';

  const country = CountryList.findByName(countryName);

  // Debug log
  if (!country?.phone?.length) {
    return '+1';
  }

  const code = country.phone[0];
  return code.startsWith('+') ? code : `+${code}`;
};

export const getCountryByName = (countryName: string) => {
  if (!countryName) return null;

  const normalizedName = countryName.toLowerCase().trim();
  const country = CountryList.findByName(normalizedName);

  if (!country) return null;

  // Get the first phone code, ensure it's a string and has a + prefix
  const phoneCode =
    Array.isArray(country.phone) && country.phone.length > 0 ? `+${country.phone[0]}` : '';

  return {
    name: country.name,
    value: country.name.toLowerCase(),
    dialCode: phoneCode || '+1', // Fallback to +1 only if no phone code found
    code: country.code?.iso2 || '',
    data: country,
  };
};

export const getCurrencies = () => {
  // Combination of most popular world currencies, top African currencies, and East African currencies
  const currencies = [
    // Most popular world currencies
    { name: 'US Dollar (USD)', value: 'USD' },
    { name: 'Euro (EUR)', value: 'EUR' },
    { name: 'British Pound (GBP)', value: 'GBP' },
    { name: 'Japanese Yen (JPY)', value: 'JPY' },
    { name: 'Swiss Franc (CHF)', value: 'CHF' },
    { name: 'Canadian Dollar (CAD)', value: 'CAD' },
    { name: 'Australian Dollar (AUD)', value: 'AUD' },
    { name: 'Chinese Yuan (CNY)', value: 'CNY' },
    { name: 'New Zealand Dollar (NZD)', value: 'NZD' },
    { name: 'Singapore Dollar (SGD)', value: 'SGD' },
    { name: 'Hong Kong Dollar (HKD)', value: 'HKD' },
    { name: 'Swedish Krona (SEK)', value: 'SEK' },

    // Top African Currencies
    { name: 'South African Rand (ZAR)', value: 'ZAR' },
    { name: 'Nigerian Naira (NGN)', value: 'NGN' },
    { name: 'Egyptian Pound (EGP)', value: 'EGP' },
    { name: 'Moroccan Dirham (MAD)', value: 'MAD' },
    { name: 'Ghanaian Cedi (GHS)', value: 'GHS' },
    { name: 'Kenyan Shilling (KES)', value: 'KES' },
    { name: 'Tanzanian Shilling (TZS)', value: 'TZS' },
    { name: 'Zambian Kwacha (ZMW)', value: 'ZMW' },
    { name: 'Botswana Pula (BWP)', value: 'BWP' },
    { name: 'Namibian Dollar (NAD)', value: 'NAD' },

    // East African Currencies
    { name: 'Ethiopian Birr (ETB)', value: 'ETB' },
    { name: 'Ugandan Shilling (UGX)', value: 'UGX' },
    { name: 'Rwandan Franc (RWF)', value: 'RWF' },
    { name: 'Burundian Franc (BIF)', value: 'BIF' },
    { name: 'South Sudanese Pound (SSP)', value: 'SSP' },
    { name: 'Sudanese Pound (SDG)', value: 'SDG' },
    { name: 'Djiboutian Franc (DJF)', value: 'DJF' },
    { name: 'Somali Shilling (SOS)', value: 'SOS' },
    { name: 'Eritrean Nakfa (ERN)', value: 'ERN' },
  ].sort((a, b) => a.name.localeCompare(b.name));

  return currencies;
};

export const validatePhoneNumberForCountry = (
  phoneNumber: string,
  countryValue: string,
): boolean => {
  if (!phoneNumber || !countryValue) return false;

  try {
    const countries = getCountries();
    const country = countries.find((c) => c.value === countryValue);
    if (!country?.iso2) return false;

    // Remove any existing "+" from the number
    const cleanNumber = phoneNumber.replace(/^\+/, '');
    // Remove country code if it's already there
    const numberWithoutCode = cleanNumber.replace(
      new RegExp(`^${country.dialing_code.replace('+', '')}`),
      '',
    );
    // Add the country code
    const fullNumber = `${country.dialing_code}${numberWithoutCode}`;

    return isValidPhoneNumber(fullNumber, country.iso2);
  } catch (error) {
    console.error('Phone validation error:', error);
    return false;
  }
};
