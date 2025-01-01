import Constants from '@/Constants';
import { fbDb } from '@/firebase/configs';
import { Company, CompanyWithMetadata } from '@/types/company';
import { AppError, createError } from '@/types/errors';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { getCountries } from './utils';

export const getCompanyByName = (name: string) => {
  const colRef = collection(fbDb, Constants.fbCompanies);
  const queryRef = query(colRef, where('name', '==', name));
  return getDocs(queryRef);
};

export const getCompanyByEmail = (email: string) => {
  const colRef = collection(fbDb, Constants.fbCompanies);
  const queryRef = query(colRef, where('email', '==', email));
  return getDocs(queryRef);
};

export const getCompanyByPhoneNumber = (phoneNumber: string) => {
  const colRef = collection(fbDb, Constants.fbCompanies);
  const queryRef = query(colRef, where('phoneNumber', '==', phoneNumber));
  return getDocs(queryRef);
};

interface CreateCompanyParams {
  data: Company;
  userId: string;
  userEmail: string;
}

const formatPhoneNumber = (phoneNumber: string, countryCode: string): string => {
  const cleanNumber = phoneNumber.replace(/^\+/, '');
  const numberWithoutCode = cleanNumber.replace(new RegExp(`^${countryCode.replace('+', '')}`), '');
  return `${countryCode}${numberWithoutCode}`;
};

const validateCompanyData = ({ userId, userEmail }: CreateCompanyParams): AppError | null => {
  if (!userId || !userEmail) {
    return createError('User information is required', 'INVALID_USER');
  }
  return null;
};

export const createOrUpdateCompany = async (params: CreateCompanyParams): Promise<void> => {
  const validationError = validateCompanyData(params);
  if (validationError) {
    throw validationError;
  }

  const { data, userId, userEmail } = params;

  try {
    const countries = getCountries();
    const country = countries.find((c) => c.value === data.country);

    if (!country) {
      throw createError('Invalid country selected', 'INVALID_COUNTRY');
    }

    const fullPhoneNumber = formatPhoneNumber(data.phoneNumber, country.dialing_code);

    const companyData: CompanyWithMetadata = {
      ...data,
      phoneNumber: fullPhoneNumber,
      createdBy: {
        authId: userId,
        email: userEmail,
      },
      updatedBy: {
        authId: userId,
        email: userEmail,
      },
      dateCreated: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    };

    const docRef = doc(fbDb, Constants.fbCompanies, userId);
    await setDoc(docRef, companyData, { merge: true });
  } catch (error) {
    console.error('Create/Update company error:', error);
    if ((error as AppError).code) {
      throw error;
    }
    throw createError('Failed to create/update company', 'SAVE_FAILED');
  }
};
