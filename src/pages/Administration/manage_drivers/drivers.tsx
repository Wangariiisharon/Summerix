import {Tab} from "@headlessui/react";
import {Fragment, useState} from "react";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { HeaderCell, BodyCell } from "../../../components/Table/Cells";
import { TableBody } from "../../../components/Table/Row";
import { SearchBar } from "@/components/Forms/input";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Form, Field } from "formik";
import { File } from "buffer";
import ImageInput from '../../../components/ImageInputs';



const Headers = ["DRIVER ID", "DRIVER", "MOBILE", "VEHICLE TYPE","COMPLETED TRIPS"]
const drivers = [
    {
        driver_id: "789797",
        driver: "Leonard Omsula",
        mobile: "+25478637853",
        vehicle_type: "Ferari",
        completed_trips: "4",


    },
    {
        driver_id: "789797",
        driver: "Leonard Omsula",
        mobile: "+25478637853",
        vehicle_type: "Ferari",
        completed_trips: "4",


    },
    {
        driver_id: "789797",
        driver: "Leonard Omsula",
        mobile: "+25478637853",
        vehicle_type: "Ferari",
        completed_trips: "4",


    },
    {
        driver_id: "789797",
        driver: "Leonard Omsula",
        mobile: "+25478637853",
        vehicle_type: "Ferari",
        completed_trips: "4",


    },
    {
        driver_id: "789797",
        driver: "Leonard Omsula",
        mobile: "+25478637853",
        vehicle_type: "Ferari",
        completed_trips: "4",


    },
]

export default function Drivers(){
    const [open,setOpen]=useState(false) 

    const handleAddDriver = () => { 
        setOpen(true)
    } 
    const handleReset = () => {
        setOpen(false)
    }
    const handleSubmit = async (values: { name: any; phonenumber: any; email_adress: any; gender: any;country: any; city: any;vehicle_type: any;model: any;year: any;number: any;profile: any; }) => {

    }

    return (
        <>
            <div className='mt-8 max-h-[700px]'>
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
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DriversTable/>
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
                        profile: File

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
                              name="name"
                              value={values.name}
                              className="form-input bg-grey w-48"
                            />
                             </label>
                             <label className="block">
                             <label className="form-label"> PHONE NUMBER</label>
                              <Field
                              type="email"
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
                             type="text"
                             name="email"
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
                             name="vehicle_type"
                             value={values.year}
                             className="form-input bg-grey w-48"
                            />
                             </label>                                
                             <label className="block">
                             <label className="form-label">NUMBER</label>
                             <Field
                             type="text"
                             name="model"
                             value={values.number}
                             className="form-input bg-grey w-48"
                            />
                            </label>                            
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                            <label className="block">
                            <label className="form-label">PROFILE</label>
                            <ImageInput />
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


function DriversTable() {
    return (
        <>
            <p className="text-lg font-bold">Drivers</p> 
                <div className='flex  text-base mt-2 searchBarContainer'>
                <SearchBar name='admins_searchbar' placeholder='Search name, id, phone' /> 
               </div>
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
                        {drivers.map((drivers, index) => {
                            return (
                                <Fragment key={index}>
                                    <tr className='text-base'>
                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                                            {drivers.driver_id}
                                        </td>
                                        <BodyCell>
                                        {drivers.driver}
                                        </BodyCell>
                                        <BodyCell>{drivers.mobile}</BodyCell>
                                        <BodyCell>{drivers.vehicle_type}</BodyCell>
                                        <BodyCell>{drivers.completed_trips}</BodyCell>
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


