import * as Yup from 'yup';
import { getClientByEmail, getClientByPhoneNumber } from '@/services/client';

export const ClientFormSchema = (docId: string) => {
  return Yup.object().shape({
    companyName: Yup.string().required('Company Name is required.'),
    contactInfo: Yup.string().required('Contact Information is required.'),

    email: Yup.string()
      .trim()
      .required('Email is required.')
      .email('Enter a valid email address.')
      .test({
        exclusive: true,
        name: 'admin-email',
        message: 'Email is already in use.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getClientByEmail(value);
          console.log('snapshot:', snapshot);
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
        message: 'Phone number is already in use as client.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getClientByPhoneNumber(value);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return doc.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
  });
};
