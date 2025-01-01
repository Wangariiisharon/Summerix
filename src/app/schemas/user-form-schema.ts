import * as Yup from 'yup';
import Constants from '@/Constants';
import { getAdminByEmail, getAdminByPhoneNumber } from '@/services/admin';

export const UserFormSchema = (docId: string) => {
  // console.log('docId:', docId);
  return Yup.object().shape({
    firstName: Yup.string().required('First name is required.'),
    lastName: Yup.string().required('Last name is required.'),
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

          const snapshot = await getAdminByEmail(value);
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
      .matches(Constants.phoneRegExp, 'Phone number is not valid.')
      .test({
        exclusive: true,
        name: 'admin-phone',
        message: 'Phone number is already in use as admin.',
        test: async function (value: any) {
          if (!value) return true;

          const snapshot = await getAdminByPhoneNumber(value);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return doc.id?.trim() === docId;
          }

          return snapshot.empty;
        },
      }),
  });
};
