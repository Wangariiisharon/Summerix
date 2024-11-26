import { fbStorage } from '@/firebase/configs';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getIn } from 'formik';

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
