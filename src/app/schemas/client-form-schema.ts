import * as Yup from 'yup';
import { getClientByEmail, getClientByPhoneNumber } from '@/services/client';

export const ClientFormSchema = (docId: string) => {
  return Yup.object().shape({
    firstName: Yup.string().required('First name is required.'),
    lastName: Yup.string().required('Last name is required.'),
    currency: Yup.string().required('Currency is required.'),

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
