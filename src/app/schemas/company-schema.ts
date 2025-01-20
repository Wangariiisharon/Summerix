import * as Yup from 'yup';
import { getCompanyByEmail, getCompanyByName, getCompanyByPhoneNumber } from '@/services/company';
import { validatePhoneNumberForCountry } from '@/services/utils';

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
      .when('country', (country, schema) => {
        return country
          ? schema
              .required('Phone number is required.')
              .test({
                name: 'phone',
                message: 'Invalid phone number for selected country',
                test: function (value) {
                  const { parent } = this;
                  return validatePhoneNumberForCountry(value, parent.country);
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
              })
          : schema.notRequired();
      }),
    // phoneNumber: Yup.string()
    //   .trim()
    //   .required('Phone number is required.')
    //   .test({
    //     name: 'phone',
    //     message: 'Invalid phone number for selected country',
    //     test: function (value) {
    //       const { parent } = this;
    //       return validatePhoneNumberForCountry(value, parent.country);
    //     },
    //   })
    //   .test({
    //     exclusive: true,
    //     name: 'company-phone-number',
    //     message: 'Phone number is already in use.',
    //     test: async function (value: any) {
    //       if (!value) return true;

    //       const snapshot = await getCompanyByPhoneNumber(value);
    //       if (snapshot && !snapshot.empty) {
    //         return snapshot.docs[0]?.id?.trim() === docId;
    //       }

    //       return snapshot.empty;
    //     },
    //   }),
    country: Yup.string().trim().required('Country is required.'),
    timezone: Yup.string().trim().required('Timezone is required.'),
    currency: Yup.string().trim().required('Currency is required.'),
  });
};
