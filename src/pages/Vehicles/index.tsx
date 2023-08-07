import {Header, HeaderBar} from "@/components/Headers";
import {AddButton, Button} from "@/components/Buttons";
import {headers} from "next/headers";
import {DummyTable} from "@/components/Table/Table";
import {FormEvent, useState} from "react";
import {FormModal} from "@/components/Modals/FormModal";
import {Form} from "@/components/Forms/Form";
import {Input, Submit} from "@/components/Forms/input";
import SiteLayout from "@/Layout/SiteLayout";
import {XMarkIcon} from "@heroicons/react/24/outline";


const Headers = [
    {
        name: "All Status",
        active: true
    },
    {
        name: "On Route ",
        active: false
    },
    {
        name: "Available",
        active: false
    },
    {
        name: "Out of Service",
        active: false
    },
    {
        name: "Maintenance",
        active: false
    },
    {
        name: "Vehicle Allocation",
        active: false
    },
]


export default function VehiclesComponent() {
    const [open, setOpen] = useState(false)
    const handleAddClick = () => {
        setOpen(true)
    }
    const handleSubmit = () => {
        //validate form
        setOpen(false)
        //submit form
    }
    const handleReset = () => {
        setOpen(false)
    }



    return (
        
            <SiteLayout>
            <div className=''>
                <div className='flex justify-between items-center'>
                    <Header heading="Vehicles"/>
                    <AddButton name="Add Vehicle" handleAddClick={handleAddClick}/>
                </div>
                <div className='mt-4'>
                    <HeaderBar headers={Headers}/>
                </div>
                <div>
                    <DummyTable/>
                </div>

            </div>
            <FormModal open={open} setOpen={setOpen}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Manage Vehicle
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Form handleSubmit={handleSubmit}>
                        <div className=''>
                            <div className='flex w-full justify-between'>
                                <Input type='text' name='v_name' placeholder='' id='v_name' label='Vehicle Name*'/>
                                <Input type='text' name='v_type' placeholder='' id='v_type' label='Vehicle Type*'/>
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                                <Input type='text' name='r_date' placeholder='' id='r-date' label='Registration Date*'/>
                                <Input type='text' name='supplier' placeholder='' id='supplier' label='Supplier'/>
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                                <Input type='text' name='plate' placeholder='' id='plate' label='License Plate*'/>
                                <Input type='text' name='model' placeholder='' id='model' label='Model'/>
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                                <Input type='text' name='color' placeholder='' id='color' label='Color'/>
                                <Input type='text' name='budget' placeholder='' id='budget' label='Budget*'/>
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                                <Input type='text' name='year' placeholder='' id='year' label='Car Year'/>
                            </div>
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='text-blue text-xl mr-32' handleClick={handleReset}>Reset</Button>
                                <Submit name="save" handleSubmit={handleSubmit}/>
                            </div>

                        </div>
                    </Form>
                </div>
            </FormModal>
            </SiteLayout>
        
    )
}
