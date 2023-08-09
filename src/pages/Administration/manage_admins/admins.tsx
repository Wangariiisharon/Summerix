import {Tab} from "@headlessui/react";
import {AddButton, Button} from "@/components/Buttons";
import {Fragment, useState} from "react";
import {Input, SearchBar, Submit} from "../../../components/Forms/input";
import Table, {DummyTable} from "../../../components/Table/Table";
import {BodyCell, HeaderCell} from "../../../components/Table/Cells";
import {TableBody} from "../../../components/Table/Row";
import {CheckCircleIcon, XCircleIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {useRouter} from "next/router";
import { FormModal } from "@/components/Modals/FormModal";
import {Form} from "@/components/Forms/Form";
import { collection, addDoc } from 'firebase/firestore';
import { fbDb } from "@/firebase/configs";

export const tabs = [
    {name: "All"},
    {name: "Active"},
    {name: "InActive"},

]
const Headers = ["Id", "Name", "City", "Phone", "Status", "Super Admin"]
const admins = [
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: true

    },
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: false,
        superAdmin: false

    },
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: false

    },
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: true

    },
    {
        id: "789797",
        name: "Brian Andy",
        city: "Nairobi, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: true

    },
    {
        id: "789068",
        name: "Yvone chaka",
        city: "Meru, Kenya",
        phone: "+254710607738",
        active: false,
        superAdmin: true

    },
    {
        id: "789797",
        name: "Lovette Kendi",
        city: "Kiambu, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: true

    },
    {
        id: "789797",
        name: "Christopher Njiru",
        city: "Mombasa, Kenya",
        phone: "+254710607738",
        active: false,
        superAdmin: true

    },
    {
        id: "789797",
        name: "Joseph Njau",
        city: "Kasarani, Kenya",
        phone: "+254710607738",
        active: true,
        superAdmin: true

    },
]

export default function Admins() {
    const [open,setOpen]=useState(false) 
    const handleAddAdmin = () => {
        setOpen(true)
    }
    const handleExport = () => {
    }
    const handleReset = () => {
        setOpen(false)
    }
    const handleSubmit = async (values: {
        firstname: string;
        lastname: string;
        email: string;
        phonenumber: string;
    }) => {
        console.log('Submitted values:', values);
    
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.firstname || !values.lastname || !values.email || !values.phonenumber) {
                console.error('Required form fields are missing');
                return;
            }
    
            const adminData = {
                firstname: values.firstname,
                lastname: values.lastname,
                email: values.email,
                phonenumber: values.phonenumber,
            };
    
            // Add the admin data to the Firestore collection
            const docRef = await addDoc(collection(fbDb, 'admin'), adminData);
            console.log('Admin added with ID:', docRef.id);
    
            // Close the modal after submitting
            setOpen(false);
        } catch (error) {
            // Handle error (show error toast or message)
            console.error('Error adding admin:', error);
        }
    };
    

    const router = useRouter()


    return (
        <>
            <div className='mt-8 max-h-[500px]'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'>
                            <Tab.List>
                                {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                            <Tab
                                                className='ui-selected:bg-d-green h-10 w-32  ui-not-selected:bg-white uppercase'>
                                                {tab.name}
                                            </Tab>
                                        </Fragment>
                                    )
                                })
                                }
                            </Tab.List>
                        </div>
                        <div className='ml-8'>
                            <SearchBar name='admins_searchbar' placeholder='Search name, id, phone, email'/>
                        </div>
                        <div className='ml-8'>
                            <AddButton name='Add Admin' handleAddClick={handleAddAdmin}/>
                        </div>

                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                            <div  className="max-h-[500px] overflow-y-auto">
                            <AdminsTable/>
                            </div>
                        </Tab.Panel>
                       
                    </Tab.Panels>
                </Tab.Group> 
                <div>
            <FormModal open={open} setOpen={setOpen}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            New Admin
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Form handleSubmit={handleSubmit}>
                        <div className=''>
                            <div className='flex w-full justify-between'>
                            <Input type="text" name="firstname" placeholder="" id="firstname" label="First Name*" />
                            <Input type='text' name='lastname' placeholder='' id='lastname' label='Last Name*' />
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                            <Input type='email' name='email' placeholder='' id='email' label='Email*' />
                                <Input type='text' name='phonenumber' placeholder='' id='phonenumber' label='Phone number'/>
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

            </div>
        </>
    )
}

function AdminsTable() {
    return (
        <div className="">
            <Table>
                <>
                    <thead>
                    <tr>
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
                        {admins.map((admin, index) => {
                            return (
                                <Fragment key={index}>
                                    <tr className=' text-base'>
                                        <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                                            {admin.id}
                                        </td>
                                        <BodyCell>
                                            {admin.name}
                                        </BodyCell>
                                        <BodyCell>{admin.city}</BodyCell>
                                        <BodyCell>{admin.phone}</BodyCell>
                                        <BodyCell>{admin.active ? 'Active' : 'Inactive'}</BodyCell>
                                        <BodyCell>
                                            <>
                                                <div className='h-16 flex items-center '>
                                                    {admin.superAdmin ?
                                                        <CheckCircleIcon className='h-8 w-8 text-d-green'/>
                                                        :
                                                        <XCircleIcon className='h-8 w-8 text-crimson-red'/>
                                                    }
                                                </div>

                                            </>
                                        </BodyCell>

                                    </tr>
                                </Fragment>
                            )
                        })}
                    </TableBody>
                </>
            </Table>
            </div>
    )
}
