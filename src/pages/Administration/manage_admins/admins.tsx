import firebase from 'firebase/app';
import 'firebase/firestore';
import {Tab} from "@headlessui/react";
import {AddButton, Button} from "@/components/Buttons";
import {Fragment, SetStateAction, useEffect, useState} from "react";
// import {Submit} from "../../../components/Forms/input"; 
import SearchBar from "../../../components/Forms/input"
import Table, {DummyTable} from "../../../components/Table/Table";
import {BodyCell, HeaderCell} from "../../../components/Table/Cells";
import {TableBody} from "../../../components/Table/Row";
import {CheckCircleIcon,CheckIcon, XCircleIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {useRouter} from "next/router";
import { FormModal } from "@/components/Modals/FormModal";
import { Field, Form, Formik } from "formik";

import firebaseApp, { fbDb } from "@/firebase/configs";
import { User, getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc,getDocs, DocumentData } from 'firebase/firestore';

import { Switch } from "@headlessui/react"; 

import ImageInput from '../../../components/ImageInputs';



export const tabs = [
    {name: "All"},
    {name: "Active"},
    {name: "InActive"},

]
const Headers = ["Id", "Name", "Phone", "Status", "Super Admin"]

export default function Admins() {
    const [open,setOpen]=useState(false) 
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);   
    const [searchQuery, setSearchQuery] = useState("");
 
    const handleSearchChange = (e:any) => {
        const query = e.target.value;
        console.log("Search Query:", query);
        setSearchQuery(query);
      }; 
      const filteredAdmins = fetchedAdmins.filter((admin) => {
        const fullName = `${admin.firstname} ${admin.lastname}`.toLowerCase();
        const nameMatch = fullName.includes(searchQuery.toLowerCase());
      
        if (selectedTab === 0) {
          return nameMatch;
        } else if (selectedTab === 1) {
          return admin.status && nameMatch;
        } else if (selectedTab === 2) {
          return !admin.status && nameMatch;
        }
      
        return false;
      });
      

    
    

    const handleAddAdmin = () => {
        setOpen(true)
    }
    const handleExport = () => {
    }
    const handleReset = () => {
        setOpen(false)
    }

    const handleSubmit = async (values: { firstname: any; lastname: any; email: any; phonenumber: any; super_admin:boolean}) => {
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
                status:true,
                super_admin:values.super_admin

            };
            console.log(adminData);
            
    
            const docRef = await addDoc(collection(fbDb, 'admins'), adminData);
            console.log('Admin added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding admin:', error);
        } 
    } 
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'admins'));
                const adminsData: DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    const admin = {
                        id: doc.id,
                        ...doc.data()
                    };
                    adminsData.push(admin);
                });
                setFetchedAdmins(adminsData);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };
    
        fetchAdmins();
    }, []);
    
        
    return (
        <>
        <div className='bg-[#FAFAFB]'>
            <div className='mt-8 max-h-[500px]'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-[#FAFAFB]'>
                            <Tab.List>
                                {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                    <Tab
                                        className='ui-selected:bg-d-green h-8 w-32 ui-not-selected:bg-[#FFFFFF] text-sm uppercase'
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
                        <SearchBar
                  placeholder='Search name, id, phone'
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                         
                        <div className='ml-2'>
                            <AddButton name='Add Admin' handleAddClick={handleAddAdmin}/>
                            </div>
                        </div>


                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                            <div  className="max-h-[500px] overflow-y-auto">
                            <AdminsTable selectedTab={selectedTab} admins={fetchedAdmins} filteredAdmins={filteredAdmins} />
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div  className="max-h-[500px] overflow-y-auto">
                            <AdminsTable selectedTab={selectedTab} admins={fetchedAdmins} filteredAdmins={filteredAdmins} />
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div  className="max-h-[500px] overflow-y-auto">
                            <AdminsTable selectedTab={selectedTab} admins={fetchedAdmins} filteredAdmins={filteredAdmins} />
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
                        super_admin:false,
                                      }}
                        onSubmit={(values) => {
                            handleSubmit(values);
                            console.log(values);
                            
                          }}
                        >
                       {({ values}) => (
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
                             type="email"
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
                            <div className="flex w-full justify-between mt-8">
                                <label className="block">
                                <label className="form-label">Super Admin</label>
                                <Field
                                type="checkbox"
                                name="super_admin" 
                               checked={values.super_admin}
                               className="form-checkbox bg-gray-200"
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
            </div>
        </>
    )
}

interface AdminsTableProps {
    selectedTab: number;
    admins: DocumentData[]; 
    filteredAdmins: DocumentData[];
}

export function AdminsTable({ selectedTab, admins ,filteredAdmins}: AdminsTableProps) { 
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 4;
    console.log("AdminsTable Rendering with selectedTab:", selectedTab);

    // const filteredAdmins = admins.filter(admin =>
    //     selectedTab === 0 ||
    //     (selectedTab === 1 && admin.status) ||
    //     (selectedTab === 2 && !admin.status)
    // ); 

    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const visibleAdmins = filteredAdmins.slice(startIndex, endIndex);

    console.log("Filtered Admins:", filteredAdmins);

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
                    {/* <div className='border-solid border-2 border-[#D9E2F6S] mb-2 '> */}

    {visibleAdmins.map((admin, index) => {
        return (
            

            <Fragment key={index}> 
            <div className='w-full mb-2'></div>
                <tr className='border-solid border-2 border-[#D9E2F6] h-10 font-nunito font-regular'>
                    <td className="whitespace-nowrap font-nunito font-regular pr-3 pt-1 pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                        {admin.id}
                    </td> 
                    <BodyCell>
                        {`${admin.firstname} ${admin.lastname}`}
                    </BodyCell> 
                    <BodyCell >{admin.phonenumber}</BodyCell> 

                    <BodyCell>{admin.status ? 'Active' : 'Inactive'}</BodyCell> 
                    <BodyCell>
                        <>
                            <div className='h-10 flex items-center '>
                                {admin.super_admin ?
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
                    {/* </div> */}

           </TableBody>

                </>
            </Table> 

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
        disabled={endIndex >= filteredAdmins.length}
    >
        Next
    </button>
</div> 
            </div>
    )
}




   