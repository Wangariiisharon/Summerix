import { FaHome } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";
import { fbDb } from "@/firebase/configs";
import {
  DocumentData,
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { Fragment, SetStateAction, useEffect, useState } from "react";
import { FormModal } from "@/components/Modals/FormModal";
import { Button } from "@/components/Buttons";
import { Formik, Field, Form } from "formik/dist/index";
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Modal from "./modal"; // Adjust the path if necessary

interface JobCardData {
  id: string;
  publicProfile: string;
  phoneNumber: string;
  country: string;
  timezone: string;
  currency: string[];
  photoURL: string;
}
export default function CompanyProfile() {
  const { organisationId } = useAuthContext();
  const [fetchedJobcards, setFetchedJobcards] = useState<JobCardData[]>([]);
  const [companySettings, setCompanySettings] = useState<JobCardData>({
    id: "",
    publicProfile: "",
    phoneNumber: "",
    country: "",
    timezone: "",
    currency: [],
    photoURL: "",
  });
  // photoURL
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  const handleAdd = () => {
    setOpen(true);
  };
  const handleReset = () => {
    setOpen(false);
  };

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
              currency: doc.data().currency || [], // Ensure default value
              photoURL: doc.data().photoURL || "", // Ensure default value
            })) as JobCardData[];
            setFetchedJobcards(jobcardData);
            if (jobcardData.length > 0) {
              setCompanySettings(jobcardData[0]);
            }
          });

          return () => unsubscribe();
        } else {
          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching Company settings:", error);
      }
    };
    const fetchRates = async () => {
      try {
        const response = await fetch("../../api/currencies");
        const text = await response.text(); // Read the response as text first
        try {
          const data = JSON.parse(text); // parse the text as JSON
          setRates(data.rates);
          console.log("Rates", data.rates);
          setLoading(false);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          console.error("Response text:", text); // Log the actual response text
        }
      } catch (error) {
        console.error("Error fetching currency rates:", error);
      }
    };
    fetchRates();
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

      console.log("Settings successfully updated!");
      toast.success("Settings successfully updated!");
    } catch (error) {
      console.error("Error updating settings: ", error);
    }
  };

  const handleSubmit = async (values: { currency: string }) => {
    if (values.currency) {
      const newCurrencyArray = [...companySettings.currency, values.currency];
      setCompanySettings((prevSettings) => ({
        ...prevSettings,
        currency: newCurrencyArray,
      }));

      // Save the updated currency array to Firestore
      try {
        const db = getFirestore();
        const settingsRef = doc(
          db,
          "companyProfile",
          companySettings.id || doc(collection(db, "companyProfile")).id
        );

        await updateDoc(settingsRef, { currency: newCurrencyArray });
        console.log("Currency successfully updated!");
        toast.success("Currency successfully updated!");
      } catch (error) {
        console.error("Error updating currency: ", error);
        toast.error("Error updating currency");
      }

      setOpen(false);
    }
  };

  return (
    <div className="pl-9">
      <div className="flex flex-row border-b border-gray-300">
        <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-[110px] mb-2">
          <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
            Public Profile
          </div>
          <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
            This will be displayed on your profile
          </div>
        </div>
        <div className="flex items-center border border-[#dee8f8] rounded-[8px] bg-white mt-4 mb-4">
          <div className="flex items-center pl-[27px] text-gray-400">
            <FaHome size={18} />
          </div>
          <input
            type="text"
            placeholder="Truck Mate"
            value={companySettings.publicProfile}
            onChange={(e) =>
              setCompanySettings({
                ...companySettings,
                publicProfile: e.target.value,
              })
            }
            className="flex-grow pl-[10px] pr-[150px] pt-[14px] pb-[14px] rounded-[8px] border-none focus:ring-0 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex flex-col border-b border-gray-300">
        <div className="flex flex-row">
          <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-[180px] mb-2">
            <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
              Phone Number
            </div>
            <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
              Add your company Email
            </div>
          </div>
          <div className="flex items-center border border-[#dee8f8] rounded-[8px] bg-white mt-4 mb-4">
            <div className="flex items-center pl-[27px] text-gray-400">
              <FaHome size={18} />
            </div>
            <input
              type="text"
              placeholder="Truck Mate"
              value={companySettings.phoneNumber}
              onChange={(e) =>
                setCompanySettings({
                  ...companySettings,
                  phoneNumber: e.target.value,
                })
              }
              className="flex-grow pl-[10px] pr-[150px] pt-[14px] pb-[14px] rounded-[8px] border-none focus:ring-0 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex flex-row">
          <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-[210px] mb-2">
            <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
              Country
            </div>
            <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
              Select your country
            </div>
          </div>
          <div className="flex items-center border border-[#dee8f8] rounded-[8px] bg-white mt-4 mb-4">
            <div className="flex items-center pl-[27px] text-gray-400">
              <FaHome size={18} />
            </div>
            <input
              type="text"
              placeholder="Truck Mate"
              value={companySettings.country}
              onChange={(e) =>
                setCompanySettings({
                  ...companySettings,
                  country: e.target.value,
                })
              }
              className="flex-grow pl-[10px] pr-[150px] pt-[14px] pb-[14px] rounded-[8px] border-none focus:ring-0 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex flex-row">
          <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-[200px] mb-2">
            <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
              Timezone
            </div>
            <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
              Select your timezone
            </div>
          </div>
          <div className="flex items-center border border-[#dee8f8] rounded-[8px] bg-white mt-4 mb-4">
            <div className="flex items-center pl-[27px] text-gray-400">
              <FaHome size={18} />
            </div>
            <input
              type="text"
              placeholder="Truck Mate"
              value={companySettings.timezone}
              onChange={(e) =>
                setCompanySettings({
                  ...companySettings,
                  timezone: e.target.value,
                })
              }
              className="flex-grow pl-[10px] pr-[150px] pt-[14px] pb-[14px] rounded-[8px] border-none focus:ring-0 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-[200px] mb-2">
          <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
            Currency
          </div>
          <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
            Select your Currency
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mt-4 mb-4 pl-[20px] pt-[14px] pb-[14px] rounded-[8px] border border-[#dee8f8] bg-white">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-black">currency1</span>
              </div>
              <div className="flex flex-row">
                <div className="flex items-center space-x-2">
                  <FaHome size={18} className="text-gray-400" />
                  <span className="border rounded-full text-xs font-medium text-blue-600">
                    KES
                  </span>
                  <span className="bg-green-100 text-green-700 ml-[8px] rounded-full text-xs font-medium">
                    Primary
                  </span>
                </div>
                <div className="flex items-center space-x-2 ml-[170px] mr-[10px]">
                  <button className="text-gray-500">Remove</button>
                  <button className="text-blue-500 ml-[8px]">Edit</button>
                </div>
              </div>
            </div>
          </div>
          <button
            className="flex items-center justify-center space-x-2 border rounded-lg bg-[#f8f8f8] p-4 cursor-pointer hover:bg-gray-100"
            onClick={() => setOpen(true)}
          >
            <FaPlusCircle size={18} className="text-[#065ad8]" />
            <span className="text-[#065ad8] font-medium">
              Add another currency
            </span>
          </button>
        </div>
      </div>
      <div className="flex space-x-4 ml-[480px] mt-[60px]">
        <button
          onClick={handleSaveChanges}
          className="flex-grow-0 flex justify-center items-center gap-2.5 px-2 rounded bg-teal-400  rounded hover:bg-teal-600"
        >
          <span className="px-[30px] py-[8px] text-white">Save Changes</span>
        </button>
        <button className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-100">
          Cancel
        </button>
      </div>
      <div className="p-6">
        <Modal open={open} setOpen={setOpen}>
          <Formik
            initialValues={{
              currency: "",
            }}
            onSubmit={handleSubmit}
          >
            {({ values }) => (
              <Form>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Currency
                  </label>
                  <Field
                    as="select"
                    name="currency"
                    className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-blue-300"
                  >
                    <option
                      value=""
                      label="Choose currency"
                      className="text-gray-700 text-sm"
                    />
                    {Object.entries(rates).map(([currency]) => (
                      <option key={currency} value={currency}>
                        {currency.toUpperCase()}
                      </option>
                    ))}
                  </Field>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-400 text-white px-4 py-2 rounded hover:bg-teal-600"
                  >
                    Submit
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal>
      </div>
    </div>
  );
}
