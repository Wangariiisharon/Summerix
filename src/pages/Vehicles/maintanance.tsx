import {Header, HeaderBar} from "@/components/Headers";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons"; 
import {PlusIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {headers} from "next/headers";
import {DummyTable} from "@/components/Table/Table";
import {FormEvent, Fragment, ReactNode, useEffect, useState} from "react";
import {FormModal} from "@/components/Modals/FormModal"; 
import { Field, Formik,Form } from "formik";
import {Input, Submit} from "@/components/Forms/input";
import SiteLayout from "@/Layout/SiteLayout";
import { Tab } from "@headlessui/react";
import Planned from "../Administration/Users/jobcard";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { getDocs, collection, DocumentData, addDoc, Timestamp, updateDoc, doc, query, where, getFirestore, onSnapshot } from "firebase/firestore";
import { parseISO, format } from 'date-fns';
import Jobcard from "../Administration/Users/jobcard"; 
import { serverTimestamp } from 'firebase/firestore'
import { AnyCnameRecord } from "dns";
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import ImageInput from "@/components/ImageInputs"; 
import { toast } from 'react-hot-toast';
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";


function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
export default function Maintenance() {
    const [open, setOpen] = useState(false)
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedMaintanance, setFetchedMaintanance]=useState<DocumentData[]>([]);  
    const [vehicleNames, setVehicleNames] = useState<string[]>([]); 
    const [jobcards, setjobcards] = useState<string[]>([]); 
    const [drivers, setdrivers] = useState<string[]>([]);
    const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    
    const {organisationId}= useAuthContext() 
    console.log("Maintanance Page OrganisationId: ", organisationId);
    
    const MaintainanceTabs = [
      { name: 'PLANNED', href: '#', current: selectedTabIndex === 0 },
      { name: 'HISTORY', href: '#', current: selectedTabIndex === 1 },

    ];
   
    const handleMaintenanceReset = () => {
        setShowScheduleMaintenanceModal(false) 
        setOpen(false)
    }   
    const handleDropdownClick = (event: { stopPropagation: () => void; }) => {
        event.stopPropagation();
    };


    useEffect(() => {
        const fetchVehicleNames = async () => {
          try {
            if (organisationId) {
              const q = query(collection(fbDb, 'vehicles'), where('organisationId', '==', organisationId));
              const querySnapshot = await getDocs(q);
              const names = querySnapshot.docs.map(doc => doc.data().lisence_plate);
              setVehicleNames(names);
            } else {
              // Handle the case when organisationId is not available
              console.error('Organisation ID is not available for fetching Vehicle names.');
            }
          } catch (error) {
            console.error('Error fetching Vehicle names:', error);
          }
        };
      
        const fetchJobCard = async () => {
          try {
            if (organisationId) {
              const q = query(collection(fbDb, 'jobcard'), where('organisationId', '==', organisationId));
              const querySnapshot = await getDocs(q);
              const names = querySnapshot.docs.map(doc => doc.data().name);
              setjobcards(names);
            } else {
              console.error('Organisation ID is not available for fetching JobCard names.');
            }
          } catch (error) {
            console.error('Error fetching JobCard names:', error);
          }
        };
      
        const fetchDriver = async () => {
          try {
            if (organisationId) {
              const q = query(collection(fbDb, 'drivers'), where('organisationId', '==', organisationId));
              const querySnapshot = await getDocs(q);
              const names = querySnapshot.docs.map(doc => doc.data().name);
              setdrivers(names);
            } else {
              // Handle the case when organisationId is not available
              console.error('Organisation ID is not available for fetching Driver names.');
            }
          } catch (error) {
            console.error('Error fetching Driver names:', error);
          }
        };
      
        const fetchedMaintenance = async () => { 
          const db = getFirestore();
 
        try {
       if (organisationId) {
       const q = query(collection(db, 'maintenance'), where('organisationId', '==', organisationId));
 
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
       const maintenanceData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      }));
       setFetchedMaintanance(maintenanceData);
      });
 
       return () => unsubscribe(); 
 
       } else {
         console.error('Organisation ID is not available.');
       }  
     } catch (error) {
       console.error('Error fetching Maintanance:', error);
    }
  };
      
        fetchVehicleNames();
        fetchDriver();
        fetchJobCard();
        fetchedMaintenance();
      }, [organisationId]);  



    const handleScheduleMaintanace = async (values: { requested_by: any; cost:any; remarks:any;vehicle:any; job_cards:any; date:any; serial_number:any; part:any ; broken_partImage:any}) => {  
        setShowScheduleMaintenanceModal(true);
        setShowAddJobcardModal(false);  
        setOpen(true);


        console.log("Submitted Values:", values); 
    
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.requested_by||!values.vehicle||!values.cost||!values.job_cards||!values.remarks||!values.date) {
                console.error('Required form fields are missing');
                return;
            } 

            const dateObj = new Date(values.date +"T00:00:00");  
            const timestamp=Timestamp.fromDate(dateObj)
            let brokenPartImageUrl = ''; 
            if (values.broken_partImage) {
                const storage = getStorage(firebaseApp);
                const storageRef = ref(storage, `broken_partImage/${values.broken_partImage.name}`);
                
                await uploadBytes(storageRef, values.broken_partImage);
                brokenPartImageUrl = await getDownloadURL(storageRef);
                console.log('Broken Part Image URL:', brokenPartImageUrl);

            } 

            const maintenanceData = {
                requested_by: values.requested_by, 
                vehicle: values.vehicle, 
                date: timestamp, 
                cost: values.cost,  
                job_cards: values.job_cards,
                remarks: values.remarks, 
                serial_number: values.serial_number,
                part: values.part,
                broken_partImage: brokenPartImageUrl, 
                organisationId:organisationId
            };
            const docRef = await addDoc(collection(fbDb, 'maintenance'), maintenanceData);
            console.log('Jobcard added with ID: ', docRef.id);
            setOpen(false);
        } catch (error) {
            console.error('Error adding jobcard:', error);
        }  
        setShowScheduleMaintenanceModal(false);
    }

    return (  
        <>
            <div className=''>
                <div className="flex flex-row fixed top-12 right-10">  
                <div className="ml-2"> 
                <Button
                className='rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4  mr-2 mt-2'
                handleClick={handleScheduleMaintanace}>
               <PlusIcon className='h-6 w-6 mr-2' />
                 Schedule Maintenance
              </Button>
                </div>
                </div>
                <div className='mt-4'> 
                <Tab.Group>
                <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3">
                        {MaintainanceTabs.map((tab, index) => (
                      <Fragment key={index}>
                  <Tab
                    className={classNames(
                      'border-d-green outline-none text-sm font-nunito font-bold uppercase flex flex-row ml-10',
                      tab.current ? 'ui-selected border-b-4 ui-selected:text-d-green' : ''
                    )}
                    onClick={() => setSelectedTabIndex(index)}
                  >
                    {tab.name}
                  </Tab>
                   </Fragment>
                            ))}
                       </Tab.List>
                    <Tab.Panels>
                    <Tab.Panel className={classNames(selectedTabIndex === 0 ? 'ui-selected border-b-4' : '', 'h-full')}>
                        <MaintananceTable selectedTab={selectedTabIndex} maintananceList={fetchedMaintanance}  />
                        </Tab.Panel>
                        <Tab.Panel className={classNames(selectedTabIndex === 0 ? 'ui-selected border-b-4' : '', 'h-full')}>
                        <MaintananceTable selectedTab={selectedTabIndex} maintananceList={fetchedMaintanance}  />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group> 
                </div> 
                <div>
                </div>
            
            </div>

            <FormModal open={showScheduleMaintenanceModal} setOpen={setShowScheduleMaintenanceModal}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Schedule Maintanance
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleMaintenanceReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Formik
                    initialValues={{
                        requested_by: "",  
                        vehicle: "",
                        cost:"", 
                        job_cards: "", 
                        remarks: "", 
                        date: "",  
                        part: "", 
                        serial_number: "", 
                        broken_partImage: null,


            
                                      }}
                        onSubmit={(values) => handleScheduleMaintanace(values)}  
  


                        >
                       {({ values }) => (
                    <Form>
                        <div className=''>
                            <div className='flex w-full justify-between'>
                            <label className="block">
                             <label className="form-label">MAINTANANCE TYPE</label>
                             <Field
                             as="select"
                            name="job_cards"  
                           value={values.job_cards}
                         className="form-input bg-grey w-96" 
                         onClick={handleDropdownClick}

                         >
                        {jobcards.map((job_cards, index) => (
                        <option key={index} value={job_cards}>
                         {job_cards}
                       </option>
            ))}
        </Field>
                             </label>                          
                             </div> 
                             <label className="block  mt-8">
                             <label className="form-label">VEHICLE</label>
                             <Field
                             as="select"
                            name="vehicle"  
                           value={values.vehicle}
                         className="form-input bg-grey w-96" 
                         onClick={handleDropdownClick}

                         >
                        {vehicleNames.map((vehicle, index) => (
                        <option key={index} value={vehicle}>
                         {vehicle}
                       </option>
            ))}
        </Field>
                             </label>   
                             <div className='flex w-full justify-between  mt-8'> 
                             <label className="block">
                             <label className="form-label">REQUESTED BY</label>
                             <Field
                             as="select"
                            name="requested_by"  
                           value={values.requested_by}
                         className="form-input bg-grey w-48" 
                         onClick={handleDropdownClick}

                         >
                        {drivers.map((requested_by, index) => (
                        <option key={index} value={requested_by}>
                         {requested_by}
                       </option>
                       ))}
                      </Field>
                             </label>  
                             <label className="block">
                             <label className="form-label">DATE</label>
                             <Field
                             type="date"
                             name="date"
                             value={values.date}
                             className="form-input bg-grey w-48"
                            />
                            </label> 
                                </div>    
                                <div className='flex w-full justify-between  mt-8'> 
                             <label className="block mt-8">
                             <label className="form-label">COST</label>
                             <Field
                             type="number"
                             name="cost" 
                             placeholder="Ksh"
                             value={values.cost}
                             className="form-input bg-grey w-48"
                            /> 
                            </label> 
                            <label className="block mt-8">
                             <label className="form-label">PART</label>
                             <Field
                             type="text"
                             name="part"
                             value={values.part}
                             className="form-input bg-grey w-48"
                            /> 
                            </label>  
                            </div> 
                            <div className='flex w-full justify-between  mt-8'>  
                            <label className="block mt-8">
                             <label className="form-label">SERIAL NUMBER</label>
                             <Field
                             type="text"
                             name="serial_number"
                             value={values.serial_number}
                             className="form-input bg-grey w-48"
                            /> 
                            </label>   
                            <label className="block ml-24 mt-8">
                             <label className="form-label">BROKEN PART</label>
                             <Field name="broken_partImage">
                            {({ field, form }:any) => (
                            <ImageInput
                            selectedImage={field.value}
                            onSelectImage={(file) => form.setFieldValue('broken_partImage', file)} 
                               />
                            )}
                           </Field>
                          </label>   
                            </div> 
                            <label className="block mt-8">
                            <label className="form-label">REMARKS</label>
                            <Field
                             type="text"
                             name="remarks"
                             value={values.remarks}
                             className="form-input bg-grey w-96 h-20"
                            />
                            </label>                      
                            <div className='flex w-full justify-end mt-24 '>
                                <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' onClick={handleMaintenanceReset}>Reset</button>
                                <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4' type='submit' >Save</button>
                            </div>
                        </div>
                    </Form>
                     )}
                    </Formik>
                </div>
            </FormModal>
            </>
        
    )
}  



interface VehiclesTableProps {
    selectedTab: number;  
    maintananceList:DocumentData
}

export function MaintananceTable({ selectedTab,maintananceList }: VehiclesTableProps) {
        console.log("MaintananceTable Rendering with selectedTab:", selectedTab); 
        console.log("Mainanace list", maintananceList);
        
        const currentDate = new Date();

        const filteredMaintenance = maintananceList.filter((maintenance: any) => {
            const maintenanceDate = new Date(maintenance?.date?.seconds * 1000);
    
            if (selectedTab === 0) {
                // Show items with dates that are yet to reach (future dates)
                return maintenanceDate > currentDate;
            } else if (selectedTab === 1) {
                // Show items with dates that have already passed (past dates)
                return maintenanceDate < currentDate;
            }
    
            return true;
        });
        
    

    console.log("Filtered Vehicles:", filteredMaintenance); 
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr> 
                                    <th 
                                      scope="col"
                                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0" 
                                    > 
                                       TRUCK  

                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0"
                                    >
                                        VEHICLE
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                        DATE
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                        JOB CARDS
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                         REQUESTED BY
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                        COST
                                    </th>

                                    <th scope="col" className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only"></span>
                                    </th>
                                </tr>
                            </thead>
 
                            <tbody  className="divide-y divide-gray-200  bg-[#FAFAFB]">
                            {filteredMaintenance.map((maintenance:any, index:any) => {  
                                 const { seconds } = maintenance.date; 
                                 const updatedDate = new Date(seconds * 1000);

                                return( 
                                    <Fragment key={index}> 
                                    <div className="w-full mb-2 font-nunito font-regular"></div>
                                    <tr key={maintenance.id}   className='my-4 border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>
                                      <td>  
                                      <span className="fa-stack fa-lg">
                                      <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
                                      <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
                                      </span>

                                       </td>
                    
                                        <td className="whitespace-nowrap pl-4 pr-3 !pt-4 text-d-blue sm:pl-0">{maintenance.vehicle}</td>
                                        <td className="whitespace-nowrap px-2  pt-4 font-medium ">
                                        {format(updatedDate, 'MM/dd/yy')}
                                        </td>
                                        <td className="whitespace-nowrap px-2 pt-4">{maintenance.job_cards}</td>
                                        <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">{maintenance.requested_by}</td>
                                        <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">{maintenance.cost}</td>
                                        <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">
                                         </td>
                                    </tr> 
                                    </Fragment>

                            )
                        })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}





