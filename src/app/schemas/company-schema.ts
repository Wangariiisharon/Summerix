import * as Yup from 'yup';
import { getCompanyByEmail, getCompanyByName, getCompanyByPhoneNumber } from '@/services/company';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { getCountries } from '@/services/utils';

const countries = getCountries();

export const CompanySchema = (docId?: string) => {
  return Yup.object().shape({
    name: Yup.string()
      .trim()
      .required('Company name is required.')
      .test({
        exclusive: true,
        name: 'company-name',
        message: 'Name is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getCompanyByName(value);
          if (snapshot && !snapshot.empty) {
            return snapshot.docs[0]?.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    description: Yup.string().trim().required('Description is required.'),
    email: Yup.string()
      .trim()
      .required('Email is required.')
      .email('Enter a valid email address.')
      .test({
        exclusive: true,
        name: 'company-email',
        message: 'Email is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getCompanyByEmail(value);
          if (snapshot && !snapshot.empty) {
            return snapshot.docs[0]?.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    phoneNumber: Yup.string()
      .trim()
      .required('Phone number is required.')
      .test({
        name: 'phone',
        message: 'Invalid phone number for selected country',
        test: function (value) {
          if (!value) return false;
          const { parent } = this;

          try {
            const country = countries.find((c) => c.value === parent.country);
            if (!country?.iso2) return false;

            // Remove any existing "+" from the number
            const cleanNumber = value.replace(/^\+/, '');
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
        },
      })
      .test({
        exclusive: true,
        name: 'company-phone-number',
        message: 'Phone number is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getCompanyByPhoneNumber(value);
          if (snapshot && !snapshot.empty) {
            return snapshot.docs[0]?.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    country: Yup.string().trim().required('Country is required.'),
    timezone: Yup.string().trim().required('Timezone is required.'),
    currency: Yup.string().trim().required('Currency is required.'),
  });
};
