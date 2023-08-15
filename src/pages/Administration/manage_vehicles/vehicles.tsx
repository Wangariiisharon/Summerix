import {Tab} from "@headlessui/react";
import {Fragment, useState} from "react";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "@/components/Table/Cells";
import { TableBody } from "@/components/Table/Row";
import { Field, Form, Formik } from "formik";
import { FormModal } from "@/components/Modals/FormModal";
import { XMarkIcon } from "@heroicons/react/24/outline";






export const tabs = [
    {name: "All"},
    {name: "Active"},
    {name: "InActive"},

]
const Headers = ["VEHICLE ID", "NAME", "LISENCE PLATE","STATUS"]
const vehicles = [
    {
        vehicle_id: "789797",
        name: "Joseph Kiriamit",
        lisence_plate: "Nairobi",
        status: true,
    },
    {
        vehicle_id: "789797",
        name: "Joseph Kiriamit",
        lisence_plate: "Nairobi",
        status: true,
    },
    {
        vehicle_id: "789797",
        name: "Joseph Kiriamit",
        lisence_plate: "Nairobi",
        status: false,
    },
    {
        vehicle_id: "789797",
        name: "Joseph Kiriamit",
        lisence_plate: "Nairobi",
        status: true,
    },
    {
        vehicle_id: "789797",
        name: "Joseph Kiriamit",
        lisence_plate: "Nairobi",
        status: true,
    },
    {
        vehicle_id: "789797",
        name: "Joseph Kiriamit",
        lisence_plate: "Nairobi",
        status: true,
    },
    {
        vehicle_id: "789797",
        name: "Joseph Kiriamit",
        lisence_plate: "Nairobi",
        status: false,
    },
    {
        vehicle_id: "789797",
        name: "Joseph Kiriamit",
        lisence_plate: "Nairobi",
        status: false,
    },
]

export default function Vehicles(){
    const [open,setOpen]=useState(false) 
    const [selectedTab, setSelectedTab] = useState<number>(0); 


    const handleAddVehicles = () => { 
        setOpen(true)
    } 
    const handleReset = () => {
        setOpen(false)
    }
    const handleSubmit = async (values: { name: any; make_and_model: any; cargo_capacity: any; lisence_plate: any;vehicle_type: any; color: any; }) => {

    }


    return (
        <>
            <div className='mt-8 max-h-[700px]'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'>
                            <Tab.List>
                                {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                    <Tab
                                        className='ui-selected:bg-d-green h-8 w-32 ui-not-selected:bg-white text-sm uppercase'
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
                        <div  className="max-h-[500px] overflow-y-auto">
                        <VehiclesTable selectedTab={selectedTab} />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <VehiclesTable selectedTab={selectedTab} />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <VehiclesTable selectedTab={selectedTab} />

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
                        // onSubmit={(values) => handleSubmit(values)}   
                        onSubmit={(values) => {
                            handleSubmit(values);
                          }}
                        >
                       {({ values }) => (
                    <Form>
                        <div className=''>
                            <div className='flex w-full justify-between'>
                            <label className="block">
                             <label className="form-label">NAME</label>
                             <Field
                              type="text"
                              name="firstname"
                              value={values.name}
                              className="form-input bg-grey w-48"
                            />
                             </label>
                             <label className="block">
                             <label className="form-label">MAKE AND MODEL</label>
                              <Field
                              type="text"
                              name="lastname"
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
                             name="email"
                             value={values.cargo_capacity}
                             className="form-input bg-grey w-48"
                            />
                             </label>                                
                             <label className="block">
                             <label className="form-label">LISENCE PLATE</label>
                             <Field
                             type="text"
                             name="phonenumber"
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
                             name="email"
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

                

            </div>
        </>
    )
} 


interface VehiclesTableProps {
    selectedTab: number; 
}

export function VehiclesTable({ selectedTab }: VehiclesTableProps) {
        console.log("VehiclesTable Rendering with selectedTab:", selectedTab);

    const filteredVehicles = vehicles.filter(vehicles =>
        selectedTab === 0 ||
        (selectedTab === 1 && vehicles.status) ||
        (selectedTab === 2 && !vehicles.status)
    );

    console.log("Filtered Vehicles:", filteredVehicles);
    const handleReasign = () => {
    }
    return (
        <>
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
                    {filteredVehicles.map((vehicles, index) => {
                                                    return (
                                <Fragment key={index}>
                                    <tr className='text-base'>
                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                                            {vehicles.vehicle_id}
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
                                        <EditBtn/>
                                        <DeleteBtn/>
                                        <div className='h-12'></div>
                                    </td>

                                    </tr>
                                </Fragment>
                            )
                    })}
                </TableBody>
    
                </>
            </Table>
        </>
    )
}


