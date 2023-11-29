import { Button } from "@/components/Buttons";
import { FormModal } from "@/components/Modals/FormModal";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {Form} from "@/components/Forms/Form";
import {Input, Submit} from "@/components/Forms/input";
import {useState} from "react";
import { collection, addDoc } from 'firebase/firestore';
import { fbDb } from "@/firebase/configs";



export default function AddAdminComponent(){ 
    const [open,setOpen]=useState(false) 
    const handleAddTrip = () => {
        setOpen(true)
    }
    const handleExport = () => {
    }
    const handleReset = () => {
        setOpen(false)
    }
    const handleSubmit = async (values: { firstname: any; lastname: any; email: any; phonenumber: any; }) => {
    };
    
    

    return(
        <>
            <div>
            <FormModal open={open} setOpen={setOpen}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            New Trip
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

            </div>

        </>
    )
}
