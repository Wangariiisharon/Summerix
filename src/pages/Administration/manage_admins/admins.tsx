import firebase from 'firebase/app';
import 'firebase/firestore';
import {Tab} from "@headlessui/react";
import {AddButton, Button} from "@/components/Buttons";
import {Fragment, useState} from "react";
import {SearchBar, Submit} from "../../../components/Forms/input";
import Table, {DummyTable} from "../../../components/Table/Table";
import {BodyCell, HeaderCell} from "../../../components/Table/Cells";
import {TableBody} from "../../../components/Table/Row";
import {CheckCircleIcon, XCircleIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {useRouter} from "next/router";
import { FormModal } from "@/components/Modals/FormModal";
import { Field, Form, Formik } from "formik";
import firebaseApp, { fbDb } from "@/firebase/configs";
import { User, getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc } from 'firebase/firestore';


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
    // async function addAdmin(values: {
    //     firstname: string;
    //     lastname: string;
    //     email: string;
    //     phonenumber: string;
    //   })
    //    {  
    //     console.log("Submitted values > formValues:", values);

    //     try {
    //       const auth = getAuth(); 
          
    //       const currentUser: User | null = auth.currentUser;
    //       if (!currentUser) {
    //         console.log('User is not authenticated');
    //         return;
    //       }
      
    //       if (
    //         !values ||
    //         values.firstname === "" ||
    //         values.lastname === "" ||
    //         values.email === "" ||
    //         values.phonenumber === ""
    //       ) {
    //         console.error('Required form fields are missing');
    //         return;
    //       }
          
      
    //       const fbDb = getFirestore();
      
    //       const adminValues = {
    //         firstname: values.firstname,
    //         lastname: values.lastname,
    //         email: values.email,
    //         phonenumber: values.phonenumber,
    //       };

      
    //       const adminCollectionRef = collection(fbDb, 'admin');
    //       const newAdminDocRef = doc(adminCollectionRef);
    //       await setDoc(newAdminDocRef, adminValues); 
      
    //       console.log('Admin added successfully');
    //     } catch (error) {
    //       console.error('Error adding admin:', error);
    //     }
    //   }  


    
    const handleSubmit = async (values: { firstname: any; lastname: any; email: any; phonenumber: any; }) => {
        console.log("Submitted Values:", values);
    
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
    
            const docRef = await addDoc(collection(fbDb, 'admins'), adminData);
            console.log('Admin added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding admin:', error);
        }
    }
    
        
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
                <div className='p-5'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            New Admin
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>
                    <Formik
                    initialValues={{
                        firstname: "",
                        lastname: "",
                        email: "",
                        phonenumber: "",
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
                             <label className="form-label">First Name</label>
                             <Field
                              type="text"
                              name="firstname"
                              value={values.firstname}
                              className="form-input bg-grey w-48"
                            />
                             </label>
                             <label className="block">
                             <label className="form-label">Last Name</label>
                              <Field
                              type="text"
                              name="lastname"
                              value={values.lastname}
                              className="form-input bg-grey w-48"
                              />
                            </label>                           
                             </div>
                            <div className='flex w-full justify-between mt-8'>
                            <label className="block">
                            <label className="form-label">Email</label>
                            <Field
                             type="text"
                             name="email"
                             value={values.email}
                             className="form-input bg-grey w-48"
                            />
                             </label>                                
                             <label className="block">
                             <label className="form-label">Phone Number</label>
                             <Field
                             type="text"
                             name="phonenumber"
                             value={values.phonenumber}
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

export  function AdminsTable() {
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




   