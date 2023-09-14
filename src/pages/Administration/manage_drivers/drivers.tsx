import {Tab} from "@headlessui/react";
import {ChangeEvent, ChangeEventHandler, FormEvent, Fragment, SetStateAction, useEffect, useState} from "react";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "../../../components/Table/Cells";
import { TableBody } from "../../../components/Table/Row";
import SearchBar from "../../../components/Forms/input"
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Form, Field } from "formik";
import ImageInput from '../../../components/ImageInputs';
import { getFirestore, collection, setDoc, addDoc,getDocs, DocumentData } from 'firebase/firestore';
import firebaseApp, { fbDb } from "@/firebase/configs";
import 'firebase/firestore';
import 'firebase/storage';
import Link from "next/link";
import DriverDetails from './driversDetails';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useRouter } from 'next/router'; 
import { deleteDoc, doc } from 'firebase/firestore';







const Headers = ["DRIVER ID", "DRIVER", "MOBILE", "VEHICLE TYPE","TRIPS "]

export default function Drivers(){
    const [open,setOpen]=useState(false) 
    const [selectedDriver, setSelectedDriver] = useState<DocumentData | null>(null); 
    const [editModalOpen, setEditModalOpen] = useState(false); 
    const [searchQuery, setSearchQuery] = useState("");
    const [field, setFieldValue] = useState(null);
    const [fetchedDrivers, setfetchedDrivers] = useState<DocumentData[]>([]);  
    const [editFormInitialValues, setEditFormInitialValues] = useState({
        name: "",
        phonenumber: "",
        email_adress: "",
        gender: "",
        country: "",
        city: "",
        vehicle_type: "",
        model: "",
        year: "",
        number: "", 
        completedTrips:0 
      });
    const router=useRouter()

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
   

    const handleSubmit = async (values: { name: any; phonenumber: any; email_adress: any; gender: any;country: any; city: any;vehicle_type: any;model: any;year: any;number: any;completedTrips: any;profile: any; }) => { 
            console.log("Submitted Values:", values);
        
            try {
                
                if (!values) {
                    console.error('Form values are undefined');
                    return;
                }
        
                if (!values.name || !values.phonenumber || !values.email_adress || !values.gender||!values.country||!values.city||!values.vehicle_type||!values.model||!values.year||!values.number||!values.completedTrips) {
                    console.error('Required form fields are missing');
                    console.log("Submitted Values:", values);

                    
                    return;
                } 
                
                let profileImageUrl = '';
                if (values.profile) {
                    const storage = getStorage(firebaseApp);
                    const storageRef = ref(storage, `profile_images/${values.profile.name}`);
                    
                    await uploadBytes(storageRef, values.profile);
                    profileImageUrl = await getDownloadURL(storageRef);
                    console.log('Profile Image URL:', profileImageUrl);

                }
         

                const DriversData = {
                    name: values.name,
                    phonenumber: values.phonenumber,
                    email_adress: values.email_adress,
                    gender: values.gender,
                    country:values.country,
                    city:values.city,
                    vehicle_type:values.vehicle_type,
                    model:values.model,
                    year:values.year,
                    number:values.number,
                    profile:profileImageUrl, 
                    completedTrips:values.completedTrips, 
                    archive:false,


                };
        
                const docRef = await addDoc(collection(fbDb, 'drivers'), DriversData);
                console.log('Driver added with ID: ', docRef.id);
        
                setOpen(false);
            } catch (error) {
                console.error('Error adding Driver:', error);
            } 
    } 
    useEffect(() => {
        const fetchedDrivers = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'drivers'));
                const driversData: DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    const driver = {
                        id: doc.id,
                        ...doc.data()
                    };
                    driversData.push(driver);
                });
                setfetchedDrivers(driversData);
            } catch (error) {
                console.error('Error fetching Drivers:', error);
            }
        };
    
        fetchedDrivers();
    }, []); 
    const updateFetchedDrivers = (updatedDrivers: SetStateAction<DocumentData[]>) => {
        setfetchedDrivers(updatedDrivers);
    };
    const handleEditClick = (driver: DocumentData) => {
        setSelectedDriver(driver);
        setEditFormInitialValues({
            name: driver.name,
            phonenumber: driver.phonenumber,
            email_adress: driver.email_adress,
            gender: driver.gender,
            country:driver.country,
            city:driver.city,
            vehicle_type:driver.vehicle_type,
            model:driver.model,
            year:driver.year,
            number:driver.number,  
            completedTrips: driver.completedTrips 

        });
        setEditModalOpen(true);
      };
      

    const handleEditModalClose = () => {
        setSelectedDriver(null); 
        setEditModalOpen(false); 
    };
 

    const handleEditSubmit = async (values: {
        name: any,
        phonenumber: any,
        email_adress: any,
        gender: any,
        country:any,
        city:any,
        vehicle_type:any,
        model:any,
        year:any,
        number:any, 
        completedTrips:any
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
            !values.gender ||
            !values.vehicle_type ||
            !values.country||
            !values.city||
            !values.model||
            !values.year||
            !values.number|| 
            !values.completedTrips



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
            gender: values.gender,
            country:values.country,
            city:values.city,
            vehicle_type:values.vehicle_type,
            model:values.model,
            year:values.year,
            number:values.number,
            completedTrips:values.completedTrips,

          });
      
          // Update the local fetchedVehicles state
          const updatedVehicles = fetchedDrivers.map((driver) =>
            driver.id === selectedDriver.id
              ? {
                  ...driver,
                  name: values.name,
                  phonenumber: values.phonenumber,
                  email_adress: values.email_adress,
                  gender: values.gender,
                  country:values.country,
                  city:values.city,
                  vehicle_type:values.vehicle_type,
                  model:values.model,
                  year:values.year,
                  number:values.number, 
                  completedTrips:values.completedTrips,

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
      
    

    return (
        <>
            <div className='mt-8'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>

                    <Button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center py-4 px-4'
                                handleClick={handleAddDriver}>
                            <>
                                <ArrowDownTrayIcon className='h-4 w-4 mr-2'/>
                                Export
                            </>
                        </Button>
                        <div className='ml-8'>
                            <AddButton name='Add Driver' handleAddClick={handleAddDriver}/>
                        </div>

                    </div>

                    <Tab.Panels>
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
                            New Truck
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
                        country: "",
                        city: "",
                        vehicle_type: "",
                        model: "",
                        year: "",
                        number: "", 
                        completedTrips:0,
                        profile: null 


                                      }}
                        // onSubmit={(values) => handleSubmit(values)}   
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
                            <label className="form-label"> EMAIL ADRESS</label>
                            <Field
                             type="email"
                             name="email_adress"
                             value={values.email_adress}
                             className="form-input bg-grey w-48"
                            />
                             </label>                                
                             <label className="block">
                             <label className="form-label">GENDER</label>
                             <Field
                             type="text"
                             name="gender"
                             value={values.gender}
                             className="form-input bg-grey w-48"
                            />
                            </label>                            
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                            <label className="block">
                            <label className="form-label">COUNTRY</label>
                            <Field
                             type="text"
                             name="country"
                             value={values.country}
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
                            <label className="form-label">VEHICLE TYPE</label>
                            <Field
                             type="text"
                             name="vehicle_type"
                             value={values.vehicle_type}
                             className="form-input bg-grey w-48"
                            />
                             </label>                                
                             <label className="block">
                             <label className="form-label">MODEL</label>
                             <Field
                             type="text"
                             name="model"
                             value={values.model}
                             className="form-input bg-grey w-48"
                            />
                            </label>                            
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                            <label className="block">
                            <label className="form-label">YEAR</label>
                            <Field
                             type="text"
                             name="year"
                             value={values.year}
                             className="form-input bg-grey w-48"
                            />
                             </label>                                
                             <label className="block">
                             <label className="form-label">NUMBER</label>
                             <Field
                             type="text"
                             name="number"
                             value={values.number}
                             className="form-input bg-grey w-48"
                            />
                            </label>                            
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                            <label className="block">
                             <label className="form-label">PROFILE</label>
                             <Field name="profile">
                            {({ field, form }:any) => (
                            <ImageInput
                            selectedImage={field.value}
                            onSelectImage={(file) => form.setFieldValue('profile', file)}
                               />
                            )}
                           </Field>

                          </label> 
                          <label className="block">
                             <label className="form-label">COMPLETED TRIPS</label>
                             <Field
                             type="number"
                             name="completedTrips"
                             value={values.completedTrips}
                             className="form-input bg-grey w-48"
                            />
                            </label>  
                            </div>
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='text-blue text-xl mr-32' handleClick={handleReset}>Reset</Button>
                                {/* <Submit name="save" handleSubmit={handleSubmit}/> */}
                                <button type='submit' >Save</button>
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
                            Edit Truck Details
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
                                           <label className="form-label">GENDER</label>
                                           <Field
                                           type="text"
                                           name="gender"
                                           value={values.gender}
                                           className="form-input bg-grey w-48"
                                          />
                                          </label>                            
                                          </div>
                                          <div className='flex w-full justify-between mt-8'>
                                          <label className="block">
                                          <label className="form-label">COUNTRY</label>
                                          <Field
                                           type="text"
                                           name="country"
                                           value={values.country}
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
                                          <label className="form-label">VEHICLE TYPE</label>
                                          <Field
                                           type="text"
                                           name="vehicle_type"
                                           value={values.vehicle_type}
                                           className="form-input bg-grey w-48"
                                          />
                                           </label>                                
                                           <label className="block">
                                           <label className="form-label">MODEL</label>
                                           <Field
                                           type="text"
                                           name="model"
                                           value={values.model}
                                           className="form-input bg-grey w-48"
                                          />
                                          </label>                            
                                          </div>
                                          <div className='flex w-full justify-between mt-8'>
                                          <label className="block">
                                          <label className="form-label">YEAR</label>
                                          <Field
                                           type="text"
                                           name="year"
                                           value={values.year}
                                           className="form-input bg-grey w-48"
                                          />
                                           </label>                                
                                           <label className="block">
                                           <label className="form-label">NUMBER</label>
                                           <Field
                                           type="text"
                                           name="number"
                                           value={values.number}
                                           className="form-input bg-grey w-48"
                                          />
                                          </label>                            
                                          </div>
                                          {/* <div className='flex w-full justify-between mt-8'>
                                          <label className="block">
                                           <label className="form-label">PROFILE</label>
                                           <Field name="profile">
                                          {({ field, form }:any) => (
                                          <ImageInput
                                          selectedImage={field.value}
                                          onSelectImage={(file) => form.setFieldValue('profile', file)}
                                             />
                                          )}
                                         </Field>
              
                                        </label>
                                          </div> */}
                                          <div className='flex w-full justify-end mt-24 '>
                                              <Button className='text-blue text-xl mr-32' handleClick={handleEditModalClose}>Reset</Button>
                                              {/* <Submit name="save" handleSubmit={handleSubmit}/> */}
                                              <button type='submit' >Save</button>
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
    //   const filteredDrivers = drivers.filter(driver => {
    //     const isArchived = driver.archive === false;
      
    //     const fullName = driver.name.toLowerCase();
    //     const includesSearchQuery = fullName.includes(searchQuery.toLowerCase());
      
    //     return isArchived && includesSearchQuery;
    //   }); 

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
        router.push(`/Administration/manage_drivers/driversDetails?id=${driver.id}`);
      };  


    return (
        <>
            <p className="text-lg font-bold ml-7">Drivers</p> 
                <div className='flex  text-base mt-2 w-80 ml-7'>
                <SearchBar
                  placeholder='Search name, id, phone'
                  value={searchQuery}
                  onChange={handleSearchChange}
                /> 
               </div>  
               <div className="max-h-[500px] overflow-y-auto">
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
                            return (
                                <Fragment key={index}>
                                    <div className='w-full mb-2'></div>
                                    <tr key={index}  className='border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular '>
                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0 font-nunito font-regular" onClick={() => handleDriverClick(drivers)}>
                                        {drivers.id}  
                                        </td>
                                        <BodyCell>
                                        {drivers.name}
                                        </BodyCell>
                                        <BodyCell>{drivers.phonenumber}</BodyCell>
                                        <BodyCell>{drivers.vehicle_type}</BodyCell>
                                        <BodyCell>{drivers.completedTrips}</BodyCell>
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


