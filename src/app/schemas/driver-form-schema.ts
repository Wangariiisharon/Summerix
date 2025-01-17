import * as Yup from 'yup';
import { getDriverByEmail, getDriverByPhoneNumber } from '@/services/driver';

export const DriverFormSchema = (companyId: string, docId: string) => {
  return Yup.object().shape({
    firstName: Yup.string().required('First name is required.'),
    lastName: Yup.string().required('Last name is required.'),
    email: Yup.string()
      .trim()
      .required('Email is required.')
      .email('Enter a valid email address.')
      .test({
        exclusive: true,
        name: 'driver-email',
        message: 'Email is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getDriverByEmail(companyId, value);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return doc.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
    phoneNumber: Yup.string()
      .trim()
      .required('Phone number is required.')
      .matches(
        /^\+\d{1,4}\s?\d{6,14}$/,
        'Phone number must be in international format, e.g., +254 XXXXXXXXX.',
      )
      .test({
        exclusive: true,
        name: 'admin-phone',
        message: 'Phone number is already in use as driver.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getDriverByPhoneNumber(companyId, value);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return doc.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
  });
};
