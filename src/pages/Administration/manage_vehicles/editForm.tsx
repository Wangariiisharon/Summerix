// import { collection, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import firebaseApp, { fbDb } from '@/firebase/configs';
// import { Field, Form, Formik } from "formik";
// import { useRouter } from 'next/router'; 
// import { FormModal } from '@/components/Modals/FormModal';
// import { Button } from '@/components/Buttons';
// import { XMarkIcon } from '@heroicons/react/24/outline';

// export default function EditVehicle() { 

//   const router = useRouter();
//   const { id } = router.query; 
//   const [editModalOpen, setEditModalOpen] = useState(true); 


//   const [vehicleData, setvehicleData] = useState({
//     name: "",
//     make_and_model: "",
//     cargo_capacity: "",
//     lisence_plate: "",
//     vehicle_type: "",
//     color: "",

//   }); 
//   const handleEditModalClose = () => {
//     setEditModalOpen(false); 
// }; 
// const handleReset = () => {
//   setEditModalOpen(false)
// }

  
// useEffect(() => {
//   if (typeof id === 'string') {
//     const fetchVehicleData = async () => {
//       try {
//         const vehicleDocRef = doc(fbDb, 'vehicles', id);
//         const vehicleDocSnapshot = await getDoc(vehicleDocRef);
//         if (vehicleDocSnapshot.exists()) {
//           const vehicleDetails = vehicleDocSnapshot.data() as {
//             name: string;
//             make_and_model: string;
//             cargo_capacity: string;
//             lisence_plate: string;
//             vehicle_type: string;
//             color: string;

//           };
//           setvehicleData(vehicleDetails);
//         }
//       } catch (error) {
//         console.error('Error fetching vehicle details:', error);
//       }
//     };
//     fetchVehicleData();
//   }
// }, [id]); 


// type VehicleData = {
//     name: string;
//     make_and_model: string;
//     cargo_capacity: string;
//     lisence_plate: string;
//     vehicle_type: string;
//     color: string;
//   };
  
//   const handleEdit = async (submittedValues: VehicleData) => {
//     try {
//       if (!id) {
//         console.error('Driver ID is missing');
//         return;
//       }
      
//       console.log('Submitting form...');
      
//       const vehicleDocRef = doc(fbDb, 'vehicles', id as string);
      
    
//        const modifiedFields: Partial<VehicleData> = {};
//        for (const key in submittedValues) {
//          if (
//            Object.prototype.hasOwnProperty.call(submittedValues, key) &&
//            submittedValues[key as keyof typeof submittedValues] !==
//            vehicleData[key as keyof typeof vehicleData]
//          ) {
//            modifiedFields[key as keyof typeof submittedValues] =
//              submittedValues[key as keyof typeof submittedValues];
//          }
//        }
 
//        console.log('Updating vehicle data...', modifiedFields);
 
//        if (Object.keys(modifiedFields).length > 0) {
//          await updateDoc(vehicleDocRef, modifiedFields);
//          console.log('Driver data updated successfully.');
//        } else {
//          console.log('No fields were modified. No update needed.');
//        }
 
//          router.push('/Administration/manage_vehicles/Vehicles');
//      } catch (error) {
//        console.error('Error updating Vehicle details:', error);
//      }
//    };
  
  
//   return (
//     <div> 
//      <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
//      <div className='p-5'>
//      <div className='flex w-full h-full justify-between items-center mb-12'>
//         <div className='text-xl font-semibold '>
//             Edit Vehicle
//          </div>
//          <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
//              <XMarkIcon className='h-6 w-6 text-red-400'/>
//          </Button>
//      </div> 
//            <Formik
//           initialValues={vehicleData} 
//           onSubmit={(values) => handleEdit(values)}
//         >
//           {({ errors, values }) => (
//             <Form className="mt-10">
//               <div className="m-4 px-4 grid gap-5 shadow-sm"> 
//               <div className='flex w-full justify-between'>                  
//                 <label className="block">
//                   <label className="form-label">Name</label>
//                   <Field
//                     type="text"
//                     name="name"
//                     placeholder={vehicleData.name}
//                     value={values.name}
//                     className="form-input"
//                   />
//                 </label>
//                 <label className="block">
//                   <label className="form-label">Make And Model</label>
//                   <Field
//                     type="text"
//                     name="make_and_model" 
//                     placeholder={vehicleData.make_and_model}
//                     value={values.make_and_model}
//                     className="form-input"
//                   />
//                 </label> 
//                 </div>
//                 <div className='flex w-full justify-between'>                  
//                 <label className="block">
//                   <label className="form-label">Cargo Capacity</label>
//                   <Field
//                     type="text"
//                     name="cargo_capacity" 
//                     placeholder={vehicleData.cargo_capacity}
//                     value={values.cargo_capacity}
//                     className="form-input"
//                   />
//                 </label>
//                 <label className="block">
//                   <label className="form-label">Lisence Plate </label>
//                   <Field
//                     type="text"
//                     name="lisence_plate" 
//                     placeholder={vehicleData.lisence_plate}
//                     value={values.lisence_plate}
//                     className="form-input"
//                   />
//                 </label> 
//                 </div>
//                 <div className='flex w-full justify-between'>                  
//                 <label className="block">
//                   <label className="form-label">Vehicle Type</label>
//                   <Field
//                     type="text"
//                     name="vehicle_type" 
//                     placeholder={vehicleData.vehicle_type}
//                     value={values.vehicle_type}
//                     className="form-input"
//                   />
//                 </label>  

                         
                               
//                 <label className="block">
//                   <label className="form-label">Color</label>
//                   <Field
//                     type="text"
//                     name="color" 
//                     placeholder={vehicleData.color}
//                     value={values.color}
//                     className="form-input"
//                   />
//                 </label> 
//                 </div>                
             
          
   
//               </div>
//               <div className="my-5 flex justify-center">
//                 <button type="submit" className="btn btn-primary w-72 px-5"  >
//                   <i className="fas fa-sign-in-alt mr-2"></i> Edit details 
//                 </button>
//               </div>

//             </Form>
//           )}
//         </Formik> 
//         </div>
//         </FormModal>

//     </div>
//   );
// }  


