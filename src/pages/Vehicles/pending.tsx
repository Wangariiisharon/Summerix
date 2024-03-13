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
import { getDocs, collection, DocumentData, addDoc, Timestamp, updateDoc, doc, query, where, getFirestore, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { parseISO, format } from 'date-fns';
import Jobcard from "../Administration/Users/jobcard"; 
import { serverTimestamp } from 'firebase/firestore'
import { AnyCnameRecord } from "dns";
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import ImageInput from "@/components/ImageInputs"; 
import { toast } from 'react-hot-toast';
// import  Notifications from "./notifications"
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";
import Checkbox from '@mui/material/Checkbox';



function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
} 
interface UserData {
  email: string; 
  super_admin: boolean;
} 
interface AuthContextData {
  organisationId: string;
  userData: UserData;
}
 
interface MaintenanceData {
    id: string;
    approvalCount: number;
    status: string; 
    requested_by: any,  
    vehicle: any,
    cost:any, 
    job_cards: any, 
    remarks: any, 
    date: any,  
    part: any, 
    serial_number: any, 
    broken_partImage: null,
  }
export default function Pending() {
    const [open, setOpen] = useState(false)
    const [selectedMaintenance, setSelectedMaintenance] = useState<DocumentData | null>(null); 
    const [fetchedMaintanance, setFetchedMaintanance]=useState<DocumentData[]>([]);  
    const [vehicleNames, setVehicleNames] = useState<string[]>([]); 
    const [jobcards, setjobcards] = useState<string[]>([]); 
    const [drivers, setdrivers] = useState<string[]>([]);
    const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
    const [selectedTabIndex, setSelectedTabIndex] = useState(0); 
    const [checkboxState, setCheckboxState] = useState<boolean[]>([]);
    const [checkedIndexes, setCheckedIndexes] = useState<number[]>([]);
    const [editModalOpen, setEditModalOpen] = useState(false); 
    const [editFormInitialValues, setEditFormInitialValues] = useState({
        requested_by: "",  
        vehicle: "",
        cost:"", 
        job_cards: "", 
        remarks: "", 
        date: "",  
        part: "", 
        status: "",	
        serial_number: "",
        approvalCount: 0, 
        broken_partImage: null,
        approvedBy:[]
      });  
      const [approvalCount, setApprovalCount] = useState(0); 
     const [approvedEmails, setApprovedEmails] = useState<string[]>([]);


      const [checked, setChecked] = useState(false);  
        

    const { organisationId, userData } = useAuthContext() as AuthContextData; 
    console.log("Maintanance Page OrganisationId: ", organisationId);
    console.log("Maintanance Page UserData: ", userData);

    const isSuperAdmin = userData?.super_admin;

    console.log("Maintanance Super Admin: ", isSuperAdmin);
    
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
        const q = query(
          collection(fbDb, 'maintenance'),
          where('organisationId', '==', organisationId),
          where('status', '==', 'Pending'),
          where('approvalCount', '<', 3)
        );
  
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
      console.error('Error fetching Maintenance:', error);
    }
  };
  
      
        fetchVehicleNames();
        fetchDriver();
        fetchJobCard();
        fetchedMaintenance();
      }, [organisationId]);  

const handleEditModalClose = () => {
    setSelectedMaintenance(null); 
    setEditModalOpen(false); 
};  

const uploadImage = async (file: File, folder: string) => {
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `${folder}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
 }; 

 const handleEditSubmit = async (values: {
    requested_by: any,  
    vehicle: any,
    cost:any, 
    job_cards: any, 
    remarks: any, 
    date: any,  
    part: any, 
    status: any, 
    serial_number: any, 
    approvalCount:number,
    broken_partImage: null,
    approvedBy: any[];
}) => { 
    if (!selectedMaintenance) {
        console.error("No selected vehicle to update");
        return;
      }

      console.log("Edited Values:", values); 

  
    try {
        const approvedBy = userData?.email;

      if (!values) {
        console.error("Form values are undefined");
        return;
      } 
      if (
        !values.requested_by)  {
        console.error("Required form fields are missing"); 
        toast.error(`Please fill the field Requested by`);
        return;
      }  
      if (
        !values.vehicle)  {
        console.error("Required form fields are missing"); 
        toast.error(`Please fill the field Vehicle`);
        return;
      }      
       if (
        !values.cost)  {
        console.error("Required form fields are missing"); 
        toast.error(`Please fill the field Cost`);
        return;
      }       
      if (
        !values.job_cards)  {
        console.error("Required form fields are missing"); 
        toast.error(`Please fill the field JobCard`);
        return;
      }       
      if (
        !values.remarks)  {
        console.error("Required form fields are missing"); 
        toast.error(`Please fill the field Remarks`);
        return;
      }       
      if (
        !values.date)  {
        console.error("Required form fields are missing"); 
        toast.error(`Please fill the field Date`);
        return;
      } 
      if (
        !values.broken_partImage)  {
        console.error("Required form fields are missing"); 
        toast.error(`Please fill the field Broken part image`);
        return;
      }  
      if (
        !values.serial_number)  {
        console.error("Required form fields are missing"); 
        toast.error(`Please fill the field Serial number`);
        return;
      }
      if (
        !values.part)  {
        console.error("Required form fields are missing"); 
        toast.error(`Please fill the field  Part`);
        return;
      }

      // Update the vehicle data in the database using the selectedVehicle.id
      const vehicleRef = doc(fbDb, "maintenance", selectedMaintenance.id);
      
      const updatedData = {
        approvalCount: values.approvalCount + 1,
        requested_by: values.requested_by, 
        vehicle: values.vehicle, 
        date: new Date(values.date.seconds * 1000),  // Convert seconds to milliseconds
        cost: values.cost,  
        job_cards: values.job_cards,
        remarks: values.remarks, 
        serial_number: values.serial_number,
        part: values.part,
        status: values.status,
        approvedBy: Array.isArray(values.approvedBy)
        ? [...values.approvedBy, approvedBy]
        : [approvedBy],        organisationId: organisationId,
        notificationNeedsDisplay: true,
        broken_partImage: values.broken_partImage ? await uploadImage(values.broken_partImage, 'broken_partImage') : selectedMaintenance.broken_partImage,
      };

    if (updatedData.approvalCount >= 3) {
      updatedData.status = 'Approved';
    } else {
      updatedData.status = 'Pending';
    }

    await setDoc(vehicleRef, updatedData, { merge: true }); 
    toast.success("Maintenance Edited Successfully")

    setSelectedMaintenance(null);
    setEditModalOpen(false);
    setChecked(true);
        

    } catch (error) {
      console.error("Error updating Maintenance:", error);
    }
  };

  const handleEditClick = (maintenance: DocumentData) => { 
    setEditModalOpen(true); 
    setChecked(false)
    setSelectedMaintenance(maintenance);
    setEditFormInitialValues({
        requested_by:maintenance.requested_by, 
        vehicle:maintenance.vehicle ,
        cost:maintenance.cost, 
        job_cards:maintenance.job_cards, 
        remarks:maintenance.remarks,
        date:maintenance.date, 
        part:maintenance.part ,
        status:maintenance.status ,
        serial_number:maintenance.serial_number, 
        approvalCount:maintenance.approvalCount, 
        broken_partImage:maintenance.broken_partImage,
        approvedBy:maintenance.approvedBy

    });
  };
  
    return (  
        <>
              <div className=''>
                <div className="flex flex-row fixed top-12 right-10">  
                </div>
                <div className='mt-4'> 
                <Tab.Group>
                    <Tab.Panels>
                    <Tab.Panel className={classNames(selectedTabIndex === 0 ? 'ui-selected border-b-4' : '', )}> 
                        <MaintananceTable selectedTab={selectedTabIndex} maintananceList={fetchedMaintanance} isSuperAdmin={isSuperAdmin}  handleEditClick={handleEditClick} />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group> 
                </div> 
                <div>
                </div>
            </div>  
            {editModalOpen && selectedMaintenance && (

            <FormModal open={editModalOpen} setOpen={handleEditModalClose}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Edit Maintanance
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleEditModalClose}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>
                    <Formik
                        initialValues={editFormInitialValues}

                        onSubmit={(values) => handleEditSubmit(values)}  

                        >
                       {({ values, setFieldValue}) => (
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
                        <option value="">Select Maintenance Type</option>
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
                        <option value="">Select Vehicle</option>
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
                         <option value="">Select Driver</option>
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
                             <label className="block">
                             <label className="form-label">COST</label>
                             <Field
                             type="number"
                             name="cost" 
                             placeholder="Ksh"
                             value={values.cost}
                             className="form-input bg-grey w-48"
                            /> 
                            </label> 
                            <label className="block">
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
                            <label className="block">
                             <label className="form-label">SERIAL NUMBER</label>
                             <Field
                             type="text"
                             name="serial_number"
                             value={values.serial_number}
                             className="form-input bg-grey w-48"
                            /> 
                            </label>   

                          <label className="block ml-24">
                          <label className="form-label">BROKEN PART</label>
                          <Field name="broken_partImage">
                             {({ field, form }: any) => (
                             <input
                            type="file"
                           onChange={(event) => {
                           const file = event.currentTarget?.files?.[0];
                            if (file) {
                          form.setFieldValue('broken_partImage', file);
                          }
                         }}
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

                            <label className="block mt-8">
                                <label className="form-label">APPROVE</label>
                                <Field
                                type="checkbox"
                                name="approvalCheckbox" 
                                checked={checkboxState[selectedMaintenance.id]}
                                onChange={(event:any) => {
                                const checked = event.currentTarget.checked;
                               setApprovalCount(checked ? approvalCount + 1 : approvalCount - 1);
                                     }}
                                 className="form-checkbox bg-gray-200" 
                                />
                              </label>
                    
                            <div className='flex w-full justify-end mt-24 '>
                                <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' onClick={handleEditModalClose}>Reset</button>
                                <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4' type='submit' >Submit</button>
                            </div>
                        </div>
                    </Form>
                     )}
                    </Formik>
                </div>
            </FormModal> 
                        )}

            </>
    )
}  



interface VehiclesTableProps {
    selectedTab: number;  
    maintananceList:DocumentData 
    isSuperAdmin:boolean  
    handleEditClick:any
}
export function MaintananceTable({ selectedTab,maintananceList,isSuperAdmin,handleEditClick}: VehiclesTableProps) { 
        const [userApproves, setUserApproves] = useState(false); 
        const [currentPage, setCurrentPage] = useState(0);
        const rowsPerPage = 4;
        const startIndex = currentPage * rowsPerPage;
        const endIndex = startIndex + rowsPerPage; 

        const [fetchedMaintanance, setFetchedMaintanance]=useState<DocumentData[]>([]);  
        console.log("MaintananceTable Rendering with selectedTab:", selectedTab); 
        console.log("Mainanace list", maintananceList); 
        
        const currentDate = new Date();
  
        const filteredMaintenance = maintananceList.filter((maintenance: any) => {
            if (!maintenance.date || !maintenance.date.seconds) {
                console.error('Invalid date structure:', maintenance.date);
                return false; 
            }
        
            return maintenance.status === "Pending";
        });
    console.log("Filtered Vehicles:", filteredMaintenance); 
    const visibleClasses = filteredMaintenance.slice(startIndex, endIndex); 

    return ( 

      <div className=" ml-6 px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
       <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
         <table className="min-w-full divide-y divide-gray-300">
          <thead>
                                <tr> 
                                    <th 
                                      scope="col"
                                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">                                     
                                      
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900" 
                                    >
                                        VEHICLE
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"   
                                    >
                                        DATE
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"                                     
                                    >
                                        JOB CARDS
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >                                     
                                        
                                         REQUESTED BY
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">                                   
                                        
                                        COST
                                    </th>

                                    <th scope="col" 
                                      className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                                      <span className="sr-only"></span>
                                    </th>
                                </tr>
                            </thead>
 
                            <tbody className="bg-[#FAFAFB]">
                            {visibleClasses.map((maintenance:any, index:any) => {  
                                 const { seconds } = maintenance.date; 
                                 const updatedDate = new Date(seconds * 1000);

                                return( 
                                    <Fragment key={index}> 
                                    <div className="w-full mb-2 font-nunito font-regular"></div>
                                    <tr key={maintenance.id}   
                                     className="hover:bg-gray-100">
                                     <td 
                                    className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"  
                                     >  
                                      <span className="fa-stack fa-lg">
                                      <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
                                      <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
                                      </span>
                                       </td>
                                        <td 
                                        className="whitespace-nowrap px-2 py-2 relative">
                                        {maintenance.vehicle}
                                        </td>
                                        <td 
                                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" 
                                            >
                                        {format(updatedDate, 'MM/dd/yy')}
                                        </td>
                                        <td
                                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" 
                                            >
                                          {maintenance.job_cards}
                                          </td>
                                        <td 
                                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" 
                                            >
                                          {maintenance.requested_by}
                                          </td>
                                        <td 
                                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                             >
                                          {maintenance.cost}
                                          </td>
                                        <td 
                                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" 
                                            > 
                                        {maintenance.status}
                                         </td>
                                    <td 
                                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" 
                                            >
                                    <div>   
                                         <button
                                        className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2"
                                        onClick={() => handleEditClick(maintenance)}
                                        >
                                            Approve
                                        </button>
                                         </div> 
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
            <div className="flex flex-row justify-center my-4 ui-selected:border-b-4  outline-none
          text-sm font-nunito font-bold uppercase bg-[#FAFAFB]">
         <button 
        className="ml-5"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 0}
        >
        Prev
        </button>
     <span className="ml-5">{currentPage + 1}</span>
      <button 
      className="ml-5"
      onClick={() => setCurrentPage(currentPage + 1)}
      disabled={endIndex >= filteredMaintenance.length}
       >
      Next
    </button>
    </div>
        </div>
    )
}

