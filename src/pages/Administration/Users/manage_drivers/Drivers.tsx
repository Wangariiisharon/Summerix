import {Tab} from "@headlessui/react";
import {Fragment, SetStateAction, useEffect, useState} from "react";
import {AddButton, Button, EditBtn} from "@/components/Buttons";
import Table from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "@/components/Table/Cells";
import { TableBody } from "@/components/Table/Row";
import SearchBar from "@/components/Forms/input"
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from 'formik/dist/index';
import { getFirestore, collection, setDoc, addDoc,getDocs, DocumentData, query, where, onSnapshot } from 'firebase/firestore';
import firebaseApp, { fbDb } from "@/firebase/configs";
import 'firebase/firestore';
import 'firebase/storage';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useRouter } from 'next/router'; 
import {  doc } from 'firebase/firestore'; 
import ExportDriverDataToCSV  from "../../../../components/Exports/driversExport";   
import { toast } from 'react-hot-toast'; 
import { useAuthContext } from "@/components/Authentication/AuthProvider";

const Headers = ["DRIVER ID", "NAME", "MOBILE", "ADDRESS"]

export default function Drivers(){
    const [open,setOpen]=useState(false) 
    const [searchQuery, setSearchQuery] = useState(""); 
    const [selectedDriver, setSelectedDriver] = useState<DocumentData | null>(null); 
    const [editModalOpen, setEditModalOpen] = useState(false); 
    const [fetchedDrivers, setfetchedDrivers] = useState<DocumentData[]>([]);  
    const [editFormInitialValues, setEditFormInitialValues] = useState({
        name: "",
        phonenumber: "",
        email_adress: "",
        city: "",
        number: "",
        profile:  null,
        identity_card:null,
        good_conduct: null,
      }); 
    const [isExporting, setIsExporting] = useState(false);

    const {organisationId} = useAuthContext(); 
    console.log("Drivers Organisation ID:", organisationId);
    

    const handleAddDriver = () => { 
        setOpen(true)
    } 
    const handleReset = () => {
        setOpen(false)
    } 
    const handleSearchChange = (e:any) => {
        const query = e.target.value;
        console.log("Search Query:", query);
        setSearchQuery(query);
      }; 


useEffect(() => {
  const fetchedDrivers = async () => { 
          const db = getFirestore();
    try {
      // Ensure organisationId is available before making the query
      if (organisationId) {
     const q = query(collection(db, 'drivers'), where('organisationId', '==', organisationId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const driversData = querySnapshot.docs.map((doc) => ({
     id: doc.id,
     ...doc.data(),
     }));
     setfetchedDrivers(driversData);
    });

     return () => unsubscribe(); 

      } else {
        console.error('Organisation ID is not available.');
      }  
    } catch (error) {
      console.error('Error fetching Drivers:', error);
    }
      };
      fetchedDrivers();
       }, [organisationId]); 
       async function generateDriverId(organisationId: string) {
        try {
          const querySnapshot = await getDocs(query(collection(fbDb, 'drivers'), where('organisationId', '==', organisationId)));
          const adminCount = querySnapshot.size;
      
          // Customize this logic based on your requirements
          return `D${(adminCount + 1).toString().padStart(3, '0')}`;
        } catch (error) {
          console.error('Error fetching Drivers count:', error);
          // Handle error or return a default value
          return 'D001';
        }
      }


    const handleSubmit = async (values: { name: any; phonenumber: any; email_adress: any; city: any;vehicle_type: any;model: any;year: any;number: any;profile: any;identity_card: any; good_conduct: any,        
    }) => { 
            console.log("Submitted Values:", values);
        
            try {
                
                if (!values) {
                    console.error('Form values are undefined');
                    return;
                }
        
                if (!values.name || !values.phonenumber || !values.email_adress||!values.city) {
                    console.error('Required form fields are missing');
                    console.log("Submitted Values:", values);   
                    return
                }  

                const existingDepartmentQuery = query(collection(fbDb, 'drivers'), 
                where('email_adress', '==', values.email_adress),
                where('organisationId', '==', organisationId)
              );
          
              const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);
          
              if (!existingDepartmentSnapshot.empty) {
                console.error('A driver with this email already exists in the same organisation'); 
                toast.error(`A Driver with the Email '${values.email_adress}' already exists`);
                return;
              } 
              



                let idImageUrl = '';  
                if (values.identity_card) {
                    const storage = getStorage(firebaseApp);
                    const storageRef = ref(storage, `id_images/${values.identity_card.name}`);
                    
                    await uploadBytes(storageRef, values.identity_card);
                    idImageUrl = await getDownloadURL(storageRef);
                    console.log('ID Image URL:', idImageUrl);

                }  

                let profileImageUrl = ''; 
                if (values.profile) {
                    const storage = getStorage(firebaseApp);
                    const storageRef = ref(storage, `profile_images/${values.profile.name}`);
                    await uploadBytes(storageRef, values.profile);
                    profileImageUrl = await getDownloadURL(storageRef);
                    console.log('Profile Image URL:', profileImageUrl);

                } 
                let pdfFileUrl = '';
                if (values.good_conduct) { 
                    const storage = getStorage(firebaseApp);
                    const pdfStorageRef = ref(storage, `good_conduct/${values.good_conduct.name}`);
                    await uploadBytes(pdfStorageRef, values.good_conduct);
                    pdfFileUrl = await getDownloadURL(pdfStorageRef);
                    console.log('Good Conduct File URL:', pdfFileUrl);
                }
            
                if (organisationId === null) {
                  console.error('organisationId is null');
                  // Handle the null case, maybe show an error or return
                  return;
                }
                const registration_date = new Date();
                const generatedVehicleId = await generateDriverId(organisationId);


                const DriversData = {
                    name: values.name,
                    phonenumber: values.phonenumber,
                    email_adress: values.email_adress,
                    city:values.city,
                    profile:profileImageUrl,  
                    identity_card:idImageUrl,  
                    archive:false, 
                    good_conduct:pdfFileUrl,
                    registration_date: registration_date,
                    driversId: generatedVehicleId,  
                    organisationId: organisationId,

                };
        
                const docRef = await addDoc(collection(fbDb, 'drivers'), DriversData);
                console.log('Driver added with ID: ', docRef.id);
        
                setOpen(false);
            } catch (error) {
                console.error('Error adding Driver:', error);
            } 
    } 
 
    const updateFetchedDrivers = (updatedDrivers: SetStateAction<DocumentData[]>) => {
        setfetchedDrivers(updatedDrivers);
    };
    const handleEditClick = (driver: DocumentData) => {
        setSelectedDriver(driver);
        setEditFormInitialValues({
            name: driver.name,
            phonenumber: driver.phonenumber,
            email_adress: driver.email_adress,
            city:driver.city,
            number:driver.number, 
            profile:driver.profile,
            identity_card: driver.identity_card,
            good_conduct: driver.good_conduct, 

        });
        setEditModalOpen(true);
      };
      

    const handleEditModalClose = () => {
        setSelectedDriver(null); 
        setEditModalOpen(false); 
    };
 
    const uploadImage = async (file: File, folder: string) => {
        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, `${folder}/${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
     };
    const handleEditSubmit = async (values: {
        name: any,
        phonenumber: any,
        email_adress: any,
        city:any,
        profile: File | null,
        identity_card: File | null,
        good_conduct: File | null,
      }) => { 
        if (!selectedDriver) {
            console.error("No selected vehicle to update");
            return;
          }
        
          console.log("Edited Values:", values);
      
        try {
          if (!values) {
            console.error("Form values are undefined");
            return;
          }
      
          if (
            !values.name ||
            !values.phonenumber ||
            !values.email_adress ||
            !values.city||
            !values.profile|| 
            !values.identity_card ||
            !values.good_conduct
          )  {
            console.error("Required form fields are missing");
            return;
          } 

          // Update the vehicle data in the database using the selectedVehicle.id
          const vehicleRef = doc(fbDb, "drivers", selectedDriver.id);
          await setDoc(vehicleRef, {
            name: values.name,
            phonenumber: values.phonenumber,
            email_adress: values.email_adress,
            city:values.city,
            profile: values.profile ? await uploadImage(values.profile, 'profile_images') : selectedDriver.profile,
            identity_card: values.identity_card ? await uploadImage(values.identity_card, 'id_images') : selectedDriver.identity_card,
            good_conduct: values.good_conduct ? await uploadImage(values.good_conduct, 'good_conduct') : selectedDriver.good_conduct,

          }); 
        
          // Update the local fetchedVehicles state
          const updatedVehicles = fetchedDrivers.map((driver) =>
            driver.id === selectedDriver.id
              ? {
                  ...driver,
                  name: values.name,
                  phonenumber: values.phonenumber,
                  email_adress: values.email_adress,
                  city:values.city,
                }
              : driver
          );
          setfetchedDrivers(updatedVehicles);
      
          setSelectedDriver(null);
          setEditModalOpen(false);
        } catch (error) {
          console.error("Error updating Vehicle:", error);
        }
      }; 
      const handleExportButtonClick = async () => {
        setIsExporting(true);
    
        try {
          const csvData = await ExportDriverDataToCSV();
    
          // Create a blob and initiate the download
          const blob = new Blob([csvData], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "exported-data.csv";
          a.click();
        } catch (error) {
          console.error("Error exporting data:", error);
        }
    
        setIsExporting(false);
      };
      
    

    return (
        <>
            <div className='mt-8'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>

                    <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center py-4 px-4'
                                onClick={handleExportButtonClick}
                                disabled={isExporting}

                                >
                            <>
                                <ArrowDownTrayIcon className='h-4 w-4 mr-2'/>
                                Export
                            </>
                        </button>
                        <div className='ml-8'>
                            <AddButton name='Add Driver' handleAddClick={handleAddDriver}/>
                        </div>

                    </div>

                    <Tab.Panels className=' bg-[#FAFAFB] h-full'>
                        <Tab.Panel> 
                        <div  className="">
                        <DriversTable drivers={fetchedDrivers} updateFetchedDrivers={updateFetchedDrivers} handleEditClick={handleEditClick}/>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group> 
                <div>
            <FormModal open={open} setOpen={setOpen}>
                <div className='p-5'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            New Driver
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>
                    <Formik
                    initialValues={{
                        name: "",
                        phonenumber: "",
                        email_adress: "",
                        gender: "",
                        city: "",
                        vehicle_type: "",
                        model: "",
                        year: "",
                        number: "", 
                        profile: null, 
                        identity_card: null ,
                        good_conduct: null, 
                                      }}
                        onSubmit={(values) => {
                        console.log('Form Values:', values);

                            handleSubmit(values);
                          }}
                        >
                       {({ values,setFieldValue }) => (
                    <Form>
                        <div className=''>
                            <div className='flex w-full justify-between'>
                            <label className="block">
                             <label className="form-label">NAME</label>
                             <Field
                              type="text"
                              name="name"
                              value={values.name}
                              className="form-input bg-grey w-48"
                            />
                             </label>
                             <label className="block">
                             <label className="form-label"> PHONE NUMBER</label>
                              <Field
                              type="text"
                              name="phonenumber"
                              value={values.phonenumber}
                              className="form-input bg-grey w-48"
                              />
                            </label>                           
                             </div>
                            <div className='flex w-full justify-between mt-8'>
                            <label className="block">
                            <label className="form-label"> EMAIL ADDRESS</label>
                            <Field
                             type="email"
                             name="email_adress"
                             value={values.email_adress}
                             className="form-input bg-grey w-48"
                            />
                             </label>  
                          
                            <label className="block">
                             <label className="form-label">ADDRESS</label>
                             <Field
                             type="text"
                             name="city"
                             value={values.city}
                             className="form-input bg-grey w-48"
                            />
                            </label> 

                            </div> 

                            <div className='flex w-full justify-between mt-8'> 
                             
                         
                            <label className="block">
                             <label className="form-label">DRIVING LICENSE</label>
                             <Field name="profile" >
                            {({ field, form }:any) => (
                            <input 
                            type="file"
                           onChange={(event) => {
                           const file = event.currentTarget?.files?.[0];
                            if (file) {
                          form.setFieldValue('profile', file);
                          }
                         }} 
                               />
                            )}
                           </Field>
                          </label> 

                          <label className="block ml-6">
                          <label className="form-label">GOOD CONDUCT</label>
                          <Field name="good_conduct">
                             {({ field, form }: any) => (
                             <input
                            type="file"
                            accept=".pdf"
                           onChange={(event) => {
                           const file = event.currentTarget?.files?.[0];
                            if (file) {
                          form.setFieldValue('good_conduct', file);
                          }
                         }}
                        />
                        )}
                    </Field>
                    </label>   
                            </div> 
                            <div className='flex w-full justify-between mt-8'>  
                        

                    <label className="block">
                          <label className="form-label">ID</label>
                          <Field name="identity_card">
                             {({ field, form }: any) => (
                             <input
                            type="file"  
                            accept=".pdf"
                           onChange={(event) => {
                           const file = event.currentTarget?.files?.[0];
                            if (file) {
                          form.setFieldValue('identity_card', file);
                          }   
                         }}  
                        />
                        )} 
                    </Field>
                    </label>
                            </div>
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' handleClick={handleReset}>Reset</Button>
                                <button  className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4' type='submit' >Save</button> 
                            </div>

                        </div>
                    </Form>
                     )}
                    </Formik>
                </div>
            </FormModal>

            </div> 
            <div>
                 {/*Edit Form modal goes Here  */} 

                 {editModalOpen && selectedDriver && (
                <FormModal open={editModalOpen} setOpen={handleEditModalClose}> 
                <div>
                <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Edit Drivers Details
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleEditModalClose}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>
                
                    <Formik
            

                initialValues={editFormInitialValues}
                onSubmit={handleEditSubmit}
        >
            {({ values }) => (
                                      <Form>
                                      <div className=''>
                                          <div className='flex w-full justify-between'>
                                          <label className="block">
                                           <label className="form-label">NAME</label>
                                           <Field
                                            type="text"
                                            name="name"
                                            value={values.name}
                                            className="form-input bg-grey w-48"
                                          />
                                           </label>
                                           <label className="block">
                                           <label className="form-label"> PHONE NUMBER</label>
                                            <Field
                                            type="text"
                                            name="phonenumber"
                                            value={values.phonenumber}
                                            className="form-input bg-grey w-48"
                                            />
                                          </label>                           
                                           </div>
                                          <div className='flex w-full justify-between mt-8'>
                                          <label className="block">
                                          <label className="form-label"> EMAIL ADRESS</label>
                                          <Field
                                           type="email"
                                           name="email_adress"
                                           value={values.email_adress}
                                           className="form-input bg-grey w-48"
                                          />
                                           </label>  
                                           <label className="block">
                                           <label className="form-label">CITY</label>
                                           <Field
                                           type="text"
                                           name="city"
                                           value={values.city}
                                           className="form-input bg-grey w-48"
                                          />
                                          </label>  
                                          </div> 
                                          <div className='flex w-full justify-between mt-8'> 
                             
                         
                               <label className="block">
                              <label className="form-label">DRIVING LICENSE</label>
                              <Field name="profile" >
                             {({ field, form }:any) => (
                             <input 
                             type="file"
                            onChange={(event) => {
                            const file = event.currentTarget?.files?.[0];
                             if (file) {
                           form.setFieldValue('profile', file);
                           }
                          }} 
                                />
                             )}
                            </Field>
                           </label>  

                            <label className="block ml-6">
                           <label className="form-label">GOOD CONDUCT</label>
                           <Field name="good_conduct">
                              {({ field, form }: any) => (
                              <input
                             type="file"
                             accept=".pdf"
                            onChange={(event) => {
                            const file = event.currentTarget?.files?.[0];
                             if (file) {
                           form.setFieldValue('good_conduct', file);
                           }
                          }}
                         />
                         )}
                     </Field>
                     </label>  

                             </div> 
                             <div className='flex w-full justify-between mt-8'>  
                         
 
                     <label className="block">
                           <label className="form-label">ID</label>
                           <Field name="identity_card">
                              {({ field, form }: any) => (
                              <input
                             type="file"  
                             accept=".pdf"
                            onChange={(event) => {
                            const file = event.currentTarget?.files?.[0];
                             if (file) {
                           form.setFieldValue('identity_card', file);
                           }   
                          }}  
                         />
                         )} 
                     </Field>
                     </label> 
                             </div>                      
                                          <div className='flex w-full justify-end mt-24 '>
                                              <Button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' handleClick={handleEditModalClose}>Reset</Button>
                                              {/* <Submit name="save" handleSubmit={handleSubmit}/> */}
                                              <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4' type='submit' >Save</button>
                                          </div>
              
                                      </div>
                                  </Form>
            )} 
        </Formik> 
        </div>

                </FormModal>
            )}
                 </div>



            </div>
        </>
    )
} 



interface VehiclesTableProps {
    drivers: DocumentData[];
    updateFetchedDrivers: (updatedDrivers: DocumentData[]) => void; 
    handleEditClick: any


} 




export function DriversTable({ drivers,updateFetchedDrivers, handleEditClick }: VehiclesTableProps) { 

    const [selectedDriver, setSelectedDriver] = useState(null);  
    const [searchQuery, setSearchQuery] = useState("");

    const router=useRouter();   

    const handleSearchChange = (e:any) => {
        const query = e.target.value;
        console.log("Search Query:", query);
        setSearchQuery(query);
      };  
      const filteredDrivers = drivers.filter((drivers) => { 

        const fullName = `${drivers.name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });  


    const sortedDrivers = [...filteredDrivers].sort((a, b) => {
        if (a.archive && !b.archive) {
          return 1; // a should come after b (archived vehicles come after non-archived)
        } else if (!a.archive && b.archive) {
          return -1; // a should come before b
        } else {
          return 0; // no change in order
        }
      });  
      console.log("These are the sortedVehicles",sortedDrivers)
      
 
const updateDriverStatusInDatabase = async (driverId: string, newStatus: boolean) => {
    try {
        const driverRef = doc(fbDb, 'drivers', driverId);
        await setDoc(driverRef, { archive: newStatus }, { merge: true });
        console.log('Driver status updated in the database:', driverId);
 
        const updatedDrivers = drivers.map(driver =>
            driver.id === driverId ? { ...driver, status: newStatus } : driver
        );
        updateFetchedDrivers(updatedDrivers);
    } catch (error) {
        console.error('Error updating Driver status in database:', error);
    }
}; 

    const handleDriverClick = (driver: any) => {
        router.push(`/Administration/Users/manage_drivers/driversDetails?id=${driver.id}`);
      };  


    return (
        <>
            <p className="text-lg font-bold ml-7">Drivers</p> 
                <div className='flex  text-base mt-2 w-80 ml-7'>
                <SearchBar
                  placeholder='Search Driver'
                  value={searchQuery}
                  onChange={handleSearchChange}
                /> 
               </div>  
               <div className="h-full overflow-y-auto">
            <Table>
                <>
                    <thead>
                    <tr className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-base  sm:pl-0">
                        {Headers.map((header, index) => {
                            return (
                                <Fragment key={index}>
                                    <HeaderCell>
                                        {header}
                                    </HeaderCell>
                                </Fragment>
                            )
                        })}
                    </tr>
                    </thead>
                    <TableBody>
                        {sortedDrivers.map((drivers, index) => { 
                            const driverId = `D${(index + 1).toString().padStart(3, '0')}`;
                             console.log("Driver ID",driverId); 
                            return (
                                <Fragment key={index}>
                                    <div className='w-full mb-2'></div>
                                    <tr key={index}  className='border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular '>
                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0 font-nunito font-regular" onClick={() => handleDriverClick(drivers)}>
                                        {drivers.driversId}  
                                        </td>
                                        <BodyCell>
                                        {drivers.name}
                                        </BodyCell>
                                        <BodyCell>{drivers.phonenumber}</BodyCell>
                                        <BodyCell>{drivers.city}</BodyCell>
                                        <td className="relative whitespace-nowrap pt-6 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 flex justify-around"> 
                                        <div  onClick={()=>handleEditClick(drivers)}>
                                            <EditBtn/>
                                        </div>
                                         <div>   
                                         <button
                                        className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2"
                                        onClick={() => updateDriverStatusInDatabase(drivers.id, !drivers.archive)}
                                        >
                                        {drivers.archive ? 'Unarchive' : 'Archive'}
                                        </button>
                                         </div>  

                                        <div className='h-10'></div>
                                    </td>

                                    </tr>
                                    
                                </Fragment>
                            )
                        })}
                    </TableBody>
                </>
            </Table> 
            </div>

        </>
    )  
} 


