import { fbStorage } from "@/firebase/configs";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(" ");
}

export const doUploadImage = async (file: File, folder: string) => {
  const storageRef = ref(fbStorage, `${folder}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
};
