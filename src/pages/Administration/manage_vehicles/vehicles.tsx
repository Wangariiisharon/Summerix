import {Tab} from "@headlessui/react";
import {Fragment, SetStateAction, useEffect, useState} from "react";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "@/components/Table/Cells";
import { TableBody } from "@/components/Table/Row";
import { Field, Form, Formik } from "formik";
import { FormModal } from "@/components/Modals/FormModal";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getFirestore, collection, doc, setDoc, addDoc,getDocs, DocumentData, deleteDoc } from 'firebase/firestore';
import firebaseApp, { fbDb } from "@/firebase/configs";
import { useRouter } from "next/router"; 

import SiteLayout from "@/Layout/SiteLayout"; 










export const tabs = [
    {name: "All"},
    {name: "Active"},
    {name: "InActive"},

]
const Headers = ["VEHICLE ID", "NAME", "LISENCE PLATE","STATUS"]



export default function Vehicles(){
    const [open,setOpen]=useState(false)  
    const [editModalOpen, setEditModalOpen] = useState(false); 
    const [selectedVehicle, setSelectedVehicle] = useState<DocumentData | null>(null); 
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedVehicles, setFetchedVehicles] = useState<DocumentData[]>([]);  
    const [editFormInitialValues, setEditFormInitialValues] = useState({
        name: '',
        make_and_model: '',
        cargo_capacity: '',
        lisence_plate: '',
        vehicle_type: '',
        color: '',
      });
      
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



    const handleAddVehicles = () => { 
        setOpen(true)
    } 
    const handleReset = () => {
        setOpen(false)
    }
    const handleSubmit = async (values: { name: any; make_and_model: any; cargo_capacity: any; lisence_plate: any;vehicle_type: any; color: any; }) => {
        console.log("Submitted Values:", values);
    
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.name || !values.make_and_model || !values.cargo_capacity || !values.lisence_plate||!values.vehicle_type||!values.color) {
                console.error('Required form fields are missing');
                return;
            }
    
            const VehicleData = {
                name: values.name,
                make_and_model: values.make_and_model,
                cargo_capacity: values.cargo_capacity,
                lisence_plate: values.lisence_plate,
                vehicle_type:values.vehicle_type,
                color:values.color,
                status:true  

            };
    
            const docRef = await addDoc(collection(fbDb, 'vehicles'), VehicleData);
            console.log('Vehicle added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding Vehicle:', error);
        } 
    } 
    useEffect(() => {
        const fetchedVehicles = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'vehicles'));
                const vehiclesData: DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    const vehicle = {
                        id: doc.id,
                        ...doc.data()
                    };
                    vehiclesData.push(vehicle);
                });
                setFetchedVehicles(vehiclesData);
            } catch (error) {
                console.error('Error fetching Vehicles:', error);
            }
        };
    
        fetchedVehicles();
    }, []);
    
    const updateFetchedVehicles = (updatedDrivers: SetStateAction<DocumentData[]>) => {
        setFetchedVehicles(updatedDrivers);
    };  
    const handleEditSubmit = async (values: {
        name: any;
        make_and_model: any;
        cargo_capacity: any;
        lisence_plate: any;
        vehicle_type: any;
        color: any;
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
            !values.name ||
            !values.make_and_model ||
            !values.cargo_capacity ||
            !values.lisence_plate ||
            !values.vehicle_type ||
            !values.color
          ) {
            console.error("Required form fields are missing");
            return;
          }
      
          // Update the vehicle data in the database using the selectedVehicle.id
          const vehicleRef = doc(fbDb, "vehicles", selectedVehicle.id);
          await setDoc(vehicleRef, {
            name: values.name,
            make_and_model: values.make_and_model,
            cargo_capacity: values.cargo_capacity,
            lisence_plate: values.lisence_plate,
            vehicle_type: values.vehicle_type,
            color: values.color,
          });
      
          // Update the local fetchedVehicles state
          const updatedVehicles = fetchedVehicles.map((vehicle) =>
            vehicle.id === selectedVehicle.id
              ? {
                  ...vehicle,
                  name: values.name,
                  make_and_model: values.make_and_model,
                  cargo_capacity: values.cargo_capacity,
                  lisence_plate: values.lisence_plate,
                  vehicle_type: values.vehicle_type,
                  color: values.color,
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
            <div className='mt-8 bg-[#FAFAFB] '>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-[#FAFAFB] '>
                            <Tab.List>
                                {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                    <Tab
                                        className='ui-selected:bg-d-green h-8 w-32  ui-not-selected:bg-[#FFFFFF] text-sm uppercase'
                                        onClick={() => {
                                            console.log("Tab Clicked", index);
                                            setSelectedTab(index);
                                          }}
                                        >
                                        {tab.name}
                                    </Tab>
                                        </Fragment>
                                    )
                                })
                                }
                            </Tab.List>
                        </div>
           
                        <div className='flex justify-end text-base mr-2'>
                          <div className='ml-2'>
                            <AddButton name='Add Vehicles' handleAddClick={handleAddVehicles}/>
                            </div>
                        </div>

                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="max-h-[500px] bg-[#FAFAFB] overflow-y-auto"> 
                        {/* <DriversTable drivers={fetchedDrivers} updateFetchedVehicles={updateFetchedVehicles} /> */}


                        <VehiclesTable
                selectedTab={selectedTab}
                vehicles={fetchedVehicles}
                updateFetchedVehicles={updateFetchedVehicles}
                handleEditClick={handleEditClick} // Pass the function as a prop
            />
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] bg-[#FAFAFB] overflow-y-auto">
                        <VehiclesTable
                selectedTab={selectedTab}
                vehicles={fetchedVehicles}
                updateFetchedVehicles={updateFetchedVehicles}
                handleEditClick={handleEditClick} // Pass the function as a prop
            />
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="bg-[#FAFAFB] overflow-y-auto">
                        <VehiclesTable
                selectedTab={selectedTab}
                vehicles={fetchedVehicles}
                updateFetchedVehicles={updateFetchedVehicles}
                handleEditClick={handleEditClick} // Pass the function as a prop
            />
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
                        make_and_model: "",
                        cargo_capacity: "",
                        lisence_plate: "",
                        vehicle_type: "",
                        color: "",


                                      }}
                        onSubmit={(values) => handleSubmit(values)}  
  
                        // onSubmit={(values) => handleEditSubmit(values)}


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
                             <label className="form-label">MAKE AND MODEL</label>
                              <Field
                              type="text"
                              name="make_and_model"
                              value={values.make_and_model}
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
                             <label className="block">
                             <label className="form-label">LISENCE PLATE</label>
                             <Field
                             type="text"
                             name="lisence_plate"
                             value={values.lisence_plate}
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
                             <label className="form-label">COLOR</label>
                             <Field
                             type="text"
                             name="color"
                             value={values.color}
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

                 {editModalOpen && selectedVehicle && (
                <FormModal open={editModalOpen} setOpen={handleEditModalClose}> 
                <div>
                <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Edit Truck Details
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
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
                         <label className="form-label">MAKE AND MODEL</label>
                          <Field
                          type="text"
                          name="make_and_model"
                          value={values.make_and_model}
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
                         <label className="block">
                         <label className="form-label">LISENCE PLATE</label>
                         <Field
                         type="text"
                         name="lisence_plate"
                         value={values.lisence_plate}
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
                         <label className="form-label">COLOR</label>
                         <Field
                         type="text"
                         name="color"
                         value={values.color}
                         className="form-input bg-grey w-48"
                        />
                        </label>                            
                        </div>
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
    selectedTab: number; 
     vehicles: DocumentData[]; 
     updateFetchedVehicles: (updatedDrivers: DocumentData[]) => void;  
     handleEditClick: any


}

export function VehiclesTable({
    selectedTab,
    vehicles,
    updateFetchedVehicles,
    handleEditClick 
}: VehiclesTableProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 3;
    
     console.log("VehiclesTable Rendering with selectedTab:", selectedTab);
        const activeVehicles = vehicles.filter((vehicle) => vehicle.status);


    const filteredVehicles = vehicles.filter(vehicles =>
        selectedTab === 0 ||
        (selectedTab === 1 && vehicles.status) ||
        (selectedTab === 2 && !vehicles.status)
    ); 

    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const visibleVehicles = filteredVehicles.slice(startIndex, endIndex);

    console.log("Filtered Vehicles:", filteredVehicles);
    const handleReasign = () => {
    }   
    const router=useRouter()
    

const updateVehicleStatusInDatabase = async (vehicleId: string, newStatus: boolean) => {
    try {
        const vehicleRef = doc(fbDb, 'vehicles', vehicleId);
        await setDoc(vehicleRef, { status: newStatus }, { merge: true });
        console.log('Vehicle status updated in the database:', vehicleId);

        const updatedVehicles = vehicles.map(vehicle =>
            vehicle.id === vehicleId ? { ...vehicle, status: newStatus } : vehicle
        );
        updateFetchedVehicles(updatedVehicles);
    } catch (error) {
        console.error('Error updating Vehicle status in database:', error);
    }
};

    
    
    
    
    return (
        <> 
        <div className="bg-[#FAFAFB] h-400 w-100%"> 

            <Table>
                <>
                    <thead>
                    <tr className="whitespace-nowrap py-3.5 pl-4 pr-3 bg-[#FAFAFB] text-left text-base  sm:pl-0">
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

                    {visibleVehicles.map((vehicles, index) => {
                                return (
                                <Fragment key={index}>
                                    <div className='w-full mb-2 font-nunito font-regular'></div>
                                    <tr className='border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                                        {vehicles.id}
                                        </td>
                                        <BodyCell>
                                        {vehicles.name}
                                        </BodyCell>
                                        <BodyCell>{vehicles.lisence_plate}</BodyCell>
                                        <BodyCell>{vehicles.status ? 'Active' : 'Inactive'}</BodyCell>
                                        <BodyCell>
                                            <>
                             

                                            </>
                                        </BodyCell>

                                        <td className="relative whitespace-nowrap pt-6 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 flex justify-around">
                                        <div  onClick={()=>handleEditClick(vehicles)}>
                                            <EditBtn/>
                                        </div>                                        
                                        <div onClick={() => updateVehicleStatusInDatabase(vehicles.id, false)}>
                                         <DeleteBtn/> 
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

            <div className="flex flex-row justify-center my-4 ui-selected:border-b-4  outline-none
                             text-sm font-nunito font-bold uppercase">
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
        disabled={endIndex >= filteredVehicles.length}
    >
        Next
    </button>
</div> 
            </div>
        </>
    )
}


