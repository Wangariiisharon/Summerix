import { fbStorage } from '@/firebase/configs';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import CountryList from 'country-list-js';
import CurrencyCodes from 'currency-codes';
import { getIn } from 'formik';
import moment from 'moment-timezone';

export function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ');
}

export const getAvatarPhoto = (name: string, size: number = 300) => {
  return `https://ui-avatars.com/api/?name=${name}&size=${size}`;
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

export const getCountries = () => {
  return CountryList.names()
    .sort((a, b) => a.localeCompare(b))
    .map((country) => {
      return {
        name: country,
        value: country.toLowerCase(),
      };
    });
};

export const getCurrencies = () => {
  return CurrencyCodes.data
    .map((data) => {
      return {
        name: `${data.currency} (${data.code})`,
        value: data.code,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};
