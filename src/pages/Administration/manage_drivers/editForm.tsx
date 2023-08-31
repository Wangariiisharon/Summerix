import { collection, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import firebaseApp, { fbDb } from '@/firebase/configs';
import { Field, Form, Formik } from "formik";



import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function EditDriver() { 

  const router = useRouter();
  const { id } = router.query; 

  const [driverData, setDriverData] = useState({
    name: '',
    phonenumber: '',
    email_adress: '',
    gender: '',
    country: '',
    city: '',
    vehicle_type: '',
    model: '',
    year: '',
    number: '', 

  }); 

  
useEffect(() => {
  if (typeof id === 'string') {
    const fetchDriverData = async () => {
      try {
        const driverDocRef = doc(fbDb, 'drivers', id);
        const driverDocSnapshot = await getDoc(driverDocRef);
        if (driverDocSnapshot.exists()) {
          const driverDetails = driverDocSnapshot.data() as {
            name: string;
            phonenumber: string;
            email_adress: string;
            gender: string;
            country: string;
            city: string;
            vehicle_type: string;
            model: string;
            year: string;
            number: string;
          };
          setDriverData(driverDetails);
        }
      } catch (error) {
        console.error('Error fetching driver details:', error);
      }
    };
    fetchDriverData();
  }
}, [id]); 


type DriverData = {
    name: string;
    phonenumber: string;
    email_adress: string;
    gender: string;
    country: string;
    city: string;
    vehicle_type: string;
    model: string;
    year: string;
    number: string;
  };
  
  const handleSubmit = async (submittedValues: DriverData) => {
    try {
      if (!id) {
        console.error('Driver ID is missing');
        return;
      }
      
      console.log('Submitting form...');
      
      const driverDocRef = doc(fbDb, 'drivers', id as string);
      
      // Compare submittedValues with the driverData state to get the modified fields
       // Compare submittedValues with the driverData state to get the modified fields
       const modifiedFields: Partial<DriverData> = {};
       for (const key in submittedValues) {
         if (
           Object.prototype.hasOwnProperty.call(submittedValues, key) &&
           submittedValues[key as keyof typeof submittedValues] !==
             driverData[key as keyof typeof driverData]
         ) {
           modifiedFields[key as keyof typeof submittedValues] =
             submittedValues[key as keyof typeof submittedValues];
         }
       }
 
       console.log('Updating driver data...', modifiedFields);
 
       if (Object.keys(modifiedFields).length > 0) {
         await updateDoc(driverDocRef, modifiedFields);
         console.log('Driver data updated successfully.');
       } else {
         console.log('No fields were modified. No update needed.');
       }
 
       //   router.push('Administration/manage_drivers/Drivers');
     } catch (error) {
       console.error('Error updating driver details:', error);
     }
   };
  
  
  return (
    <div> 
           <Formik
          initialValues={driverData} // Use the fetched driverData as initialValues
          onSubmit={(values) => handleSubmit(values)}
        >
          {({ errors, values }) => (
            <Form className="mt-10">
              <div className="m-4 px-4 grid gap-5 shadow-sm">
                <label className="block">
                  <label className="form-label">Name</label>
                  <Field
                    type="text"
                    name="name"
                    placeholder={driverData.name}
                    value={values.name}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label">Phone Number</label>
                  <Field
                    type="text"
                    name="phonenumber" 
                    placeholder={driverData.phonenumber}
                    value={values.phonenumber}
                    className="form-input"
                  />
                </label>

                <label className="block">
                  <label className="form-label">Email</label>
                  <Field
                    type="email"
                    name="email_adress" 
                    placeholder={driverData.email_adress}
                    value={values.email_adress}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label">Gender </label>
                  <Field
                    type="text"
                    name="gender" 
                    placeholder={driverData.gender}
                    value={values.gender}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label">Country</label>
                  <Field
                    type="text"
                    name="country" 
                    placeholder={driverData.country}
                    value={values.country}
                    className="form-input"
                  />
                </label>
                <label className="block">
                  <label className="form-label">City</label>
                  <Field
                    type="text"
                    name="city" 
                    placeholder={driverData.city}
                    value={values.city}
                    className="form-input"
                  />
                </label> 
                <label className="block">
                  <label className="form-label">Vehicle Type</label>
                  <Field
                    type="text"
                    name="vehicle_type" 
                    placeholder={driverData.vehicle_type}
                    value={values.vehicle_type}
                    className="form-input"
                  />
                </label>                
                <label className="block">
                  <label className="form-label">Model</label>
                  <Field
                    type="text"
                    name="model" 
                    placeholder={driverData.model}
                    value={values.model}
                    className="form-input"
                  />
                </label>                
                <label className="block">
                  <label className="form-label">Year</label>
                  <Field
                    type="text"
                    name="year"
                    placeholder={driverData.year}
                    value={values.year}
                    className="form-input"
                  />
                </label>                
                <label className="block">
                  <label className="form-label">Number</label>
                  <Field
                    type="text"
                    name="number"
                    placeholder={driverData.number}
                    value={values.number}
                    className="form-input"
                  />
                </label>               
                 {/* <label className="block">
                  <label className="form-label">Profile</label>
                  <Field
                    type="text"
                    name="city"
                    value={values.profile}
                    className="form-input"
                  />
                </label> */}
              </div>
              <div className="my-5 flex justify-center">
                <button type="submit" className="btn btn-primary w-72 px-5"  >
                  <i className="fas fa-sign-in-alt mr-2"></i> Edit details 
                </button>
              </div>

            </Form>
          )}
        </Formik>

    </div>
  );
} 



