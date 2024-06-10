import { Header } from "@/components/Headers";
import { Tab } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Admins from "./Admins/manage_admins/Admins";
import CompanyProfile from "./Users/companyProfile";
import Avatar_profile_photo from "../../../public/Avatar_profile_photo.png";
import Departments from "./Admins/manage_department/Departments";
import SiteLayout from "@/Layout/SiteLayout";
import Image from "next/image";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import toast from "react-hot-toast";

interface JobCardData {
  id: string;
  publicProfile: string;
  phoneNumber: string;
  country: string;
  timezone: string;
  currency: string;
  photoURL?: string;
}

const tabs = [
  { name: "Company Profile", href: "#", current: false },
  { name: "User Management", href: "#", current: false },
  { name: "Departments", href: "#", current: false },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function AdministrationComponent() {
  const [fetchedJobcards, setFetchedJobcards] = useState<JobCardData[]>([]);
  const { organisationId } = useAuthContext();
  const [companySettings, setCompanySettings] = useState<JobCardData>({
    id: "",
    publicProfile: "",
    phoneNumber: "",
    country: "",
    timezone: "",
    currency: "",
    photoURL: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Retrieve the saved tab index from local storage when the component mounts
    const savedIndex = localStorage.getItem("selectedTabIndex");
    if (savedIndex !== null) {
      setSelectedIndex(parseInt(savedIndex, 10));
    }
  }, []);

  useEffect(() => {
    const fetchJobcards = async () => {
      const db = getFirestore();

      try {
        if (organisationId) {
          const q = query(
            collection(db, "companyProfile"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const jobcardData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              publicProfile: doc.data().publicProfile,
              phoneNumber: doc.data().phoneNumber,
              country: doc.data().country,
              timezone: doc.data().timezone,
              currency: doc.data().currency,
              photoURL: doc.data().photoURL || "",
            })) as JobCardData[];
            setFetchedJobcards(jobcardData);
            if (jobcardData.length > 0) {
              setCompanySettings(jobcardData[0]);
            }
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching Company settings:", error);
      }
    };
    fetchJobcards();
  }, [organisationId]);

  const handleSaveChanges = async () => {
    const db = getFirestore();
    const settingsRef = doc(
      db,
      "companyProfile",
      companySettings.id || doc(collection(db, "companyProfile")).id
    );

    try {
      await setDoc(
        settingsRef,
        {
          organisationId,
          ...companySettings,
        },
        { merge: true }
      );

      toast.success("Settings successfully updated!");
    } catch (error) {
      console.error("Error updating settings: ", error);
      toast.error("Error updating settings");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      await handleUploadPhoto(e.target.files[0]);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    const storage = getStorage();
    const storageRef = ref(storage, `companyProfiles/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      setCompanySettings((prevSettings) => ({ ...prevSettings, photoURL }));

      const db = getFirestore();
      const settingsRef = doc(
        db,
        "companyProfile",
        companySettings.id || doc(collection(db, "companyProfile")).id
      );

      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        await updateDoc(settingsRef, { photoURL });
      } else {
        await setDoc(
          settingsRef,
          { organisationId, photoURL },
          { merge: true }
        );
      }

      console.log("Photo successfully uploaded and settings updated!");
      toast.success("Photo successfully uploaded and settings updated!");
    } catch (error) {
      console.error("Error uploading photo: ", error);
      toast.error("Error uploading photo");
    }
  };

  return (
    <SiteLayout>
      <div className="bg-[#FFFFFF] flex flex-col">
        <div className="flex flex-col justify-center items-start gap-2.5 mt-17.5 mb-13 py-2.5 pl-9 bg-white">
          <div className="flex-grow-0 flex justify-center items-center gap-2.5 py-2.5 px-4">
            <div className="flex-grow-0 font-custom text-custom-size flex justify-center font-semibold text-left text-custom-color">
              Administration
            </div>
          </div>
        </div>
        <div className="flex flex-row mt-[30px] pl-9">
          <div className="mt-custom1 mr-custom2 mb-custom3 rounded-custom shadow-custom border-custom border-white">
            <Image
              src={companySettings.photoURL || Avatar_profile_photo}
              alt="logo"
              width={100}
              height={100}
              priority={true}
            />
          </div>
          <div className="flex-grow-0 flex flex-col justify-start items-start gap-2.5 py-2.5 px-2.5 ml-[31px] ">
            <div className="flex-grow-0 flex flex-col justify-start items-start gap-1 p-0">
              <div className="flex-grow-0 font-outfit text-[21px]  text-base font-semibold text-left text-deep-blue">
                Truck Mate Limited
              </div>
              <div className="flex-grow-0 mt-1 font-nunito  text-[#6b6b73] text-[16px] font-semibold text-left text-cool-gray">
                Update your company photo and details here.
              </div>
            </div>
            <div className="flex flex row">
              <div className="flex-grow-0 mr-[10px] flex justify-center items-center gap-2.5 py-2 px-6 rounded bg-teal-400  rounded hover:bg-teal-600">
                <div className="self-center flex-grow-0 object-contain">
                  <i className="fa fa-camera text-white" aria-hidden="true"></i>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="flex-grow-0 text-base font-normal text-left text-white cursor-pointer"
                  style={{ lineHeight: "0.75" }}
                >
                  Upload a new photo
                </label>
              </div>
              <button className="border border-gray-300 text-gray-700 mr-[15px] font-medium py-2 px-6 rounded-md hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className="mr-2 ml-[60px] text-xl font-semibold text-left text-[#030229] ">
          Account Settings
        </div>

        <div>
          <div className="pl-9 mt-[16px]">
            <Tab.Group
              selectedIndex={selectedIndex}
              onChange={setSelectedIndex}
            >
              <Tab.List
                className="flex justify-start
               items-center gap-2.5 py-2.5 px-4 border-b border-gray-300 rounded-lg"
              >
                {tabs.map((tab, index) => (
                  <Fragment key={index}>
                    <Tab as={Fragment} key={tab.name}>
                      {({ selected }) => (
                        <button
                          className={`${
                            selected
                              ? "text-blue-600 font-semibold border-b-2  bg-grey-100"
                              : "text-gray-600 hover:text-gray-900"
                          } flex justify-center items-center py-2.5 px-4 rounded-t-lg transition-colors duration-300`}
                        >
                          {tab.name}
                        </button>
                      )}
                    </Tab>
                  </Fragment>
                ))}
              </Tab.List>
              <Tab.Panels className=" bg-[#FAFAFB] h-full">
                <Tab.Panel className="h-full">
                  <CompanyProfile />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Admins />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Departments />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
