import {Tab} from "@headlessui/react";
import {Fragment, SetStateAction, useEffect, useState} from "react";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "@/components/Table/Cells";
import { TableBody } from "@/components/Table/Row";
import { Formik, Field, Form } from 'formik/dist/index';
import { FormModal } from "@/components/Modals/FormModal";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getFirestore, collection, doc, setDoc, addDoc,getDocs, DocumentData, getDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import firebaseApp, { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SiteLayout from "@/Layout/SiteLayout";  
import { toast } from 'react-hot-toast';
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";



const Headers = ["VEHICLE ID", "VEHICLE TYPE", "LICENSE PLATE"]
export default function Vehicles(){
    const [open,setOpen]=useState(false)  
    const [editModalOpen, setEditModalOpen] = useState(false); 
    const [selectedVehicle, setSelectedVehicle] = useState<DocumentData | null>(null); 
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);   
    const [fetchedCompanies, setFetchedCompanies] = useState<DocumentData[]>([]);   
    const [showAllocateModal, setShowAllocateModal] = useState(false); 
    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [companies, setCompanies] = useState<string[]>([]); 
    const [editFormInitialValues, setEditFormInitialValues] = useState({
        name: '',
        make_and_model: '',
        cargo_capacity: '',
        lisence_plate: '',
        vehicle_type: '',
        color: '',
      });
    
      const {organisationId} = useAuthContext(); 
      console.log(" Vehicles Organisation ID:", organisationId);
      const handleAllocateReset = () => {
        setShowAllocateModal(false)  
        setOpen(false) 
    } 
      const handleEditClick = (vehicle: DocumentData) => {
        setSelectedVehicle(vehicle);
        setEditFormInitialValues({
          name: vehicle.name,
          make_and_model: vehicle.make_and_model,
          cargo_capacity: vehicle.cargo_capacity,
          lisence_plate: vehicle.lisence_plate,
          vehicle_type: vehicle.vehicle_type,
          color: vehicle.color,
        });
        setEditModalOpen(true);
      };
      

    const handleEditModalClose = () => {
        setSelectedVehicle(null); 
        setEditModalOpen(false); 
    };

    const handleAllocateVehicles = () => {  
      setOpen(true) 
      setShowAllocateModal(true);
      setShowAddVehicleModal(false); 
  } 
    const handleAddVehicles = () => { 
        setOpen(true) 
        setShowAddVehicleModal(true);
        setShowAllocateModal(false); 
    } 
    const handleReset = () => {
        setOpen(false) 
        setShowAddVehicleModal(false);
    } 
    async function generateVehicleId(organisationId: string) {
      try {
        const querySnapshot = await getDocs(query(collection(fbDb, 'vehicles'), where('organisationId', '==', organisationId)));
        const adminCount = querySnapshot.size;
    
        // Customize this logic based on your requirements
        return `V${(adminCount + 1).toString().padStart(3, '0')}`;
      } catch (error) {
        console.error('Error fetching Vehicles count:', error);
        // Handle error or return a default value
        return 'V001';
      }
    }
  
    const handleSubmit = async (values: { cargo_capacity: any; lisence_plate: any; vehicle_type: any; }) => {
      // Check if values are undefined
      if (!values) {
        console.error('Form values are undefined');
        return;
      }
      if (!values.cargo_capacity || !values.lisence_plate || !values.vehicle_type) {
        console.error('Required form fields are missing');
        toast.error('Required form fields are missing');
        return;
      }
      const registration_date = new Date();
      const licensePlate = values.lisence_plate;
      const vehiclesCollection = collection(fbDb, 'vehicles');
      // const querySnapshot = await getDocs(query(vehiclesCollection, where('lisence_plate', '==', licensePlate)));
  
      // if (!querySnapshot.empty) {
      //   console.error('A vehicle with this license plate already exists');
      //   // toast.error('A vehicle with this license plate already exists'); 
      //   toast.error(`A vehicle with the license plate '${values.lisence_plate}' already exists`);
      // }  

      const existingDepartmentQuery = query(collection(fbDb, 'vehicles'), 
      where('lisence_plate', '==', values.lisence_plate),
      where('organisationId', '==', organisationId)
    );

    const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);

    if (!existingDepartmentSnapshot.empty) {
      console.error('Vehicle with this license plate already exists in the same organisation'); 
      toast.error(`A Vehicle with the license plate  '${values.lisence_plate}' already exists`);
      return;
    } 
    

      if (organisationId === null) {
        console.error('organisationId is null');
        // Handle the null case, maybe show an error or return
        return;
      }
      const generatedVehicleId = await generateVehicleId(organisationId);
        
        const VehicleData = {
          cargo_capacity: values.cargo_capacity,
          lisence_plate: values.lisence_plate,
          vehicle_type: values.vehicle_type,
          status: true,
          archive: false,
          registration_date: registration_date,
          availability_status: "Available",
          vehiclesId: generatedVehicleId, // Assign the result of the function
          organisationId: organisationId,

        };
  
        const docRef = await addDoc(vehiclesCollection, VehicleData);
        console.log('Vehicle added with ID: ', docRef.id);
      
      setOpen(false); 
      setShowAddVehicleModal(false);

    } 
    interface CompanyData {
      name: string;
      vehicle?: string[]; // Assuming 'vehicle' is an array of strings
    }
    const handleAllocateSubmit = async (values: { vehicle: string; company: string }) => {
      console.log("Submitted Values:", values);
      try {
        if (!values) {
          console.error('Form values are undefined');
          return;
        }
    
        if (!values.vehicle || !values.company) {
          console.error('Required form fields are missing');
          return;
        }
    
        const registration_date = new Date();
    
        // Check if the vehicle is already allocated to a company
        const vehicleAllocationsCollectionRef = collection(fbDb, 'vehicleAllocations');
        const vehicleQuerySnapshot = await getDocs(vehicleAllocationsCollectionRef);
    
        const isVehicleAlreadyAllocated = vehicleQuerySnapshot.docs.some((doc) => {
          const allocationData = doc.data();
          return allocationData.vehicle === values.vehicle;
        });
    
        if (isVehicleAlreadyAllocated) {
          const allocatedCompany = vehicleQuerySnapshot.docs.find((doc) => {
            const allocationData = doc.data() as { vehicle: string; name: string };
            return allocationData.vehicle === values.vehicle;
          });
        
          if (allocatedCompany) {
            console.error('Vehicle is already allocated to ' + allocatedCompany.data().name);
            toast.error('Vehicle is already allocated to ' + allocatedCompany.data().name);
          } else {
            console.error('Vehicle is already allocated to an unknown company');
            toast.error('Vehicle is already allocated to an unknown company');
          }
          return;
        }
        
        
        
    
        const companiesCollectionRef = collection(fbDb, 'classes');
        const querySnapshot = await getDocs(companiesCollectionRef);
    
        let companyDocRef;
        let allocated = false;
    
        querySnapshot.forEach((doc) => {
          const companyData = doc.data() as CompanyData;
          console.log('Company Data:', companyData);
          if (companyData.name === values.company) {
            companyDocRef = doc.ref;
            if (companyData.vehicle && companyData.vehicle.includes(values.vehicle)) {
              console.error('Vehicle already allocated to this company');
              toast.error('Vehicle already allocated to this company.');
              allocated = true;
            }
          }
        });
    
        if (allocated) {
          return;
        }
    
        if (companyDocRef) {
          const companySnapshot = await getDoc(companyDocRef);
          const existingCompanyData = companySnapshot.data() as CompanyData;
    
          const existingVehicles = existingCompanyData.vehicle || [];
          existingVehicles.push(values.vehicle);
    
          // Update the company document with the added vehicle
          await updateDoc(companyDocRef, {
            vehicle: existingVehicles,
          });
    
          console.log('Vehicle added to company:', values.company);
        } else {
          console.error('Company not found:', values.company);
          toast.error('Company not found: ' + values.company);
          return;
        }
    
        const AllocationData = {
          vehicle: values.vehicle,
          name: values.company,
        };
    
        const docRef = await addDoc(collection(fbDb, 'vehicleAllocations'), AllocationData);
        console.log('Allocation added with ID: ', docRef.id);
    
      } catch (error) {
        console.error('Error allocating Vehicle:', error);
        toast.error('Error allocating Vehicle: ' + error);
      }  
      setOpen(false);
      setShowAllocateModal(false);
    }
    
    
    
    
     
    useEffect(() => {       

      const fetchedVehicles = async () => { 
              const db = getFirestore();
    
        try {
          if (organisationId) {
         const q = query(collection(db, 'vehicles'), where('organisationId', '==', organisationId));
    
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const vehiclesData = querySnapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
         }));
         setFetchedVehicles(vehiclesData);
        });
    
         return () => unsubscribe(); 
    
          } else {
            console.error('Organisation ID is not available.');
          }  
        } catch (error) {
          console.error('Error fetching Vehicles:', error);
        }
          };

      const fetchedCompanies = async () => {
        try {
          if (organisationId){ 
            const q = query(collection(fbDb, 'classes'), where('organisationId', '==', organisationId));
            const querySnapshot = await getDocs(q);
  
            const classData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));
            setFetchedCompanies(classData);

          }else{
            console.error('Organisation ID is not available.');
          }

        } catch (error) {
          console.error('Error fetching Classes:', error);
        }
    };
  
        fetchedVehicles();          
        fetchedCompanies(); 
        console.log(fetchedCompanies);

    }, [organisationId]);
    
    const updateFetchedVehicles = (updatedDrivers: SetStateAction<DocumentData[]>) => {
        setFetchedVehicles(updatedDrivers);
    };  
    const handleEditSubmit = async (values: {
        cargo_capacity: any;
        lisence_plate: any;
        vehicle_type: any;
      }) => { 
        if (!selectedVehicle) {
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
            !values.cargo_capacity ||
            !values.lisence_plate ||
            !values.vehicle_type 
          ) {
            console.error("Required form fields are missing");
            return;
          }
      
          // Update the vehicle data in the database using the selectedVehicle.id
          const vehicleRef = doc(fbDb, "vehicles", selectedVehicle.id);
          await setDoc(vehicleRef, {
            cargo_capacity: values.cargo_capacity,
            lisence_plate: values.lisence_plate,
            vehicle_type: values.vehicle_type,
          });
      
          // Update the local fetchedVehicles state
          const updatedVehicles = fetchedVehicles.map((vehicle) =>
            vehicle.id === selectedVehicle.id
              ? {
                  ...vehicle,
                  cargo_capacity: values.cargo_capacity,
                  lisence_plate: values.lisence_plate,
                  vehicle_type: values.vehicle_type,
                }
              : vehicle
          );
          setFetchedVehicles(updatedVehicles);
      
          setSelectedVehicle(null);
          setEditModalOpen(false);
        } catch (error) {
          console.error("Error updating Vehicle:", error);
        }
      };

      
    
    return (
        <>
            <div className='mt-8  h-full bg-[#FAFAFB] '>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
  
                        <div className='flex justify-end text-base mr-2'>
                          <div className='ml-2 flex flex-row'>
                            <AddButton name="Add Vehicle" handleAddClick={handleAddVehicles}/> 
                            <div className="ml-2">
                              <Button
                               className='rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2 '
                               handleClick={handleAllocateVehicles}>
                              <PlusIcon className='h-6 w-6 mr-2' />
                              Allocate Vehicle
                              </Button>
                               </div>  


                            </div>
                        </div>

                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="h-full bg-[#FAFAFB] overflow-y-auto"> 
                        <VehiclesTable
                selectedTab={selectedTab}
                vehicles={fetchedVehicles}
                updateFetchedVehicles={updateFetchedVehicles}
                handleEditClick={handleEditClick}      
            />
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="h-full bg-[#FAFAFB] overflow-y-auto">
                        <VehiclesTable
                selectedTab={selectedTab}
                vehicles={fetchedVehicles}
                updateFetchedVehicles={updateFetchedVehicles}
                handleEditClick={handleEditClick} 
            />
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className=" h-full bg-[#FAFAFB] overflow-y-auto">
                        <VehiclesTable
                selectedTab={selectedTab}
                vehicles={fetchedVehicles}
                updateFetchedVehicles={updateFetchedVehicles}
                handleEditClick={handleEditClick} 
            />
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>  
                <div>
            <FormModal open={showAddVehicleModal} setOpen={setShowAddVehicleModal}>
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
                        // name: "",
                        cargo_capacity: "",
                        lisence_plate: "",
                        vehicle_type: "",
                                      }}
                        onSubmit={(values) => handleSubmit(values)}  

                        >
                       {({ values }) => (
                    <Form>
                        <div className=''>
                            <div className='flex w-full justify-between'>

                             </div>
                            <div className='flex w-full justify-between mt-8'> 
                            <label className="block">
                             <label className="form-label">LICENSE PLATE</label>
                             <Field
                             type="text"
                             name="lisence_plate"
                             value={values.lisence_plate}
                             className="form-input bg-grey w-48"
                            />
                            </label>  

                            <label className="block">
                            <label className="form-label">VEHICLE TYPE</label>
                            <Field
                             type="text"
                             name="vehicle_type"
                             value={values.vehicle_type}
                             className="form-input bg-grey w-48"
                            />
                             </label>                                                            
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                            <label className="block">
                            <label className="form-label"> CARGO CAPACITY</label>
                            <Field
                             type="text"
                             name="cargo_capacity"
                             value={values.cargo_capacity}
                             className="form-input bg-grey w-48"
                            />
                             </label>                                
                                           
                            </div> 
                           
                                                         
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' handleClick={handleReset}>Reset</Button>
                                {/* <Submit name="save" handleSubmit={handleSubmit}/> */}
                                <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4' type='submit' >Save</button>
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

                 {editModalOpen && selectedVehicle && (
                <FormModal open={editModalOpen} setOpen={handleEditModalClose}> 
                <div>
                <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Edit Truck Details
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full'  handleClick={handleEditModalClose}>
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
                        <div className='flex w-full justify-between mt-8'> 
                        <label className="block">
                         <label className="form-label">LICENSE PLATE</label>
                         <Field
                         type="text"
                         name="lisence_plate"
                         value={values.lisence_plate}
                         className="form-input bg-grey w-48"
                        />
                        </label> 

                        <label className="block">
                        <label className="form-label"> CARGO CAPACITY</label>
                        <Field
                         type="text"
                         name="cargo_capacity"
                         value={values.cargo_capacity}
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

                 <FormModal open={showAllocateModal} setOpen={setShowAllocateModal}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '> 
                         ALLOCATE VEHICLE
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleAllocateReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Formik
                    initialValues={{
                      vehicle: "", 
                      company: "",
            
                                      }}
                        onSubmit={(values) => handleAllocateSubmit(values)}  
                        >
                       {({ values }) => (
                    <Form>
                        <div className=''>
                            <div className='flex w-full justify-between'>
                            <label className="block">
                             <label className="form-label">VEHICLE</label>.
                             <Field
                             as="select"
                            name="vehicle"  
                           value={values.vehicle}
                           className="form-input bg-grey w-48" 

                         > 
                        <option value="">Select  Vehicle</option>
                         {fetchedVehicles.map((vehicle, index) => (
                        <option key={index} value={vehicle.lisence_plate}>
                         {vehicle.lisence_plate}
                       </option>
                        ))}
                        </Field> 
                        </label>   

                        <label className="block">
                        <label className="form-label">CLASS</label>.
                         <Field
                           as="select"
                           name="company"  
                           value={values.company}
                           className="form-input bg-grey w-48" 
                         > 
                        <option value="">Select Class</option>

                         {fetchedCompanies.map((company, index) => (
                        <option key={index} value={company.name}>
                         {company.name}
                       </option>
                        ))}
                        </Field> 
                        </label>    

                             </div>
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' handleClick={handleAllocateReset}>Reset</Button>
                                {/* <Submit name="save" handleSubmit={handleSubmit}/> */}
                                <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4' type='submit' >Save</button>
                            </div>

                        </div>
                    </Form>
                     )}
                    </Formik>
                </div>
            </FormModal>  

            </div>
        </>
    )
     } 

     interface VehiclesTableProps {
        selectedTab: number;
        vehicles: DocumentData[];
        updateFetchedVehicles: (updatedDrivers: DocumentData[]) => void;
        handleEditClick: any;
      }
      
      export function VehiclesTable({
        selectedTab,
        vehicles,
        updateFetchedVehicles,
        handleEditClick,
      }: VehiclesTableProps) {
        const [currentPage, setCurrentPage] = useState(0);
        const rowsPerPage = 3;
      
        const activeVehicles = vehicles.filter((vehicle) => vehicle.status);
            
        // Sort vehicles to put archived vehicles at the bottom
        const sortedVehicles = [...vehicles].sort((a, b) => {
          if (a.archive && !b.archive) {
            return 1; // a should come after b (archived vehicles come after non-archived)
          } else if (!a.archive && b.archive) {
            return -1; // a should come before b
          } else {
            return 0; // no change in order
          }
        });  
        console.log("These are the sortedVehicles",sortedVehicles)


      
        const startIndex = currentPage * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const visibleVehicles = sortedVehicles.slice(startIndex, endIndex);
      
        const handleReassign = () => {
          // Implement your reassign logic here
        };
        const router = useRouter();
      
        const updateVehicleStatusInDatabase = async (vehicleId: string, newStatus: boolean) => {
          try {
            const vehicleRef = doc(fbDb, 'vehicles', vehicleId);
            await setDoc(vehicleRef, { archive: newStatus }, { merge: true });
            console.log('Vehicle status updated in the database:', vehicleId);
      
            const updatedVehicles = vehicles.map((vehicle) =>
              vehicle.id === vehicleId ? { ...vehicle, archive: newStatus } : vehicle
            );
            updateFetchedVehicles(updatedVehicles);
          } catch (error) {
            console.error('Error updating Vehicle status in database:', error);
          }
        };
      
        return (
          <>
            <div className="bg-[#FAFAFB] h-full w-100%">
              <Table>
                <>
                  <thead>
                    <tr className="whitespace-nowrap py-3.5 pl-4 pr-3 bg-[#FAFAFB] text-left text-base sm:pl-0">
                      {Headers.map((header, index) => {
                        return (
                          <Fragment key={index}>
                            <HeaderCell>{header}</HeaderCell>
                          </Fragment>
                        );
                      })}
                    </tr>
                  </thead>
                  <TableBody>
                    {sortedVehicles.map((vehicle, index) => { 
                      return (
                        <Fragment key={index}>
                          <div className="w-full mb-2 font-nunito font-regular"></div>
                          <tr className="border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular">
                            <td className="whitespace-nowrap pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                              {vehicle.vehiclesId}
                            </td>
                            <BodyCell>{vehicle.vehicle_type}</BodyCell>
                            <BodyCell>{vehicle.lisence_plate}</BodyCell> 
                            <td className="relative whitespace-nowrap pt-6 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 flex justify-around">
                              <div onClick={() => handleEditClick(vehicle)}>
                                <EditBtn />
                              </div>
                              <div>
                                <button
                                        className="bg-[#E7EDF4] text-[#777E96] h-8 w-18 py-1 px-2"
                                        onClick={() => updateVehicleStatusInDatabase(vehicle.id, !vehicle.archive)}
                                >
                                  {vehicle.archive ? 'Unarchive' : 'Archive'}
                                </button>
                              </div>
                              <div className="h-10"></div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </>
              </Table>
      
              <div className="flex flex-row justify-center my-4 ui-selected:border-b-4 outline-none text-sm font-nunito font-bold uppercase">
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
                  disabled={endIndex >= sortedVehicles.length}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        );
      }
      