import firebase from 'firebase/app';
import 'firebase/firestore';
import {Tab} from "@headlessui/react";
import {AddButton, Button, EditBtn} from "@/components/Buttons";
import {Fragment, SetStateAction, useEffect, useState} from "react";
import SearchBar from "../../../../components/Forms/input"
import Table, {DummyTable} from "../../../../components/Table/Table";
import {BodyCell, HeaderCell} from "../../../../components/Table/Cells";
import {TableBody} from "../../../../components/Table/Row";
import {CheckCircleIcon,CheckIcon, XCircleIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {useRouter} from "next/router";
import { FormModal } from "@/components/Modals/FormModal";
// import { Field, Form, Formik } from "formik";
import { Formik, Field, Form } from 'formik/dist/index';
import firebaseApp, { fbDb } from "@/firebase/configs";
import { User, createUserWithEmailAndPassword, getAuth,sendSignInLinkToEmail} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc,updateDoc,addDoc,query,getDocs,where, DocumentData } from 'firebase/firestore'; 
import { toast } from 'react-hot-toast';
import { Switch } from "@headlessui/react"; 
import ImageInput from '../../../../components/ImageInputs';



const Headers = ["Id", "Name", "Phone", "Admin"]

export default function Admins() {
    const [open,setOpen]=useState(false) 
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);   
    const [searchQuery, setSearchQuery] = useState(""); 
    const [selectedAdmin, setSelectedAdmin] = useState<DocumentData | null>(null); 
    const [editModalOpen, setEditModalOpen] = useState(false); 
    const [editFormInitialValues, setEditFormInitialValues] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phonenumber: "",
        super_admin:false, 
        status:true,

      });
    const router=useRouter()
 
    const handleSearchChange = (e:any) => {
        const query = e.target.value;
        console.log("Search Query:", query);
        setSearchQuery(query);
      };  
      
      const filteredAdmins = fetchedAdmins.filter((admin) => {
        const fullName = `${admin.firstname} ${admin.lastname}`.toLowerCase();
        const nameMatch = fullName.includes(searchQuery.toLowerCase());
      
        // Check if status is true (either boolean or string 'true')
        const isStatusTrue = admin.status === true || admin.status === 'true';
      
        return isStatusTrue && nameMatch;
      });
      
      
    const handleAddAdmin = () => {
        setOpen(true)
    }
    const handleExport = () => {
    }
    const handleReset = () => {
        setOpen(false)
    }
    const handleSubmit = async (values: { firstname: any; lastname: any; email: any; phonenumber: any; super_admin: boolean; invitationSent: boolean }) => {
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
    
            // Check if user with the given email already exists
            const existingAdminQuery = query(collection(fbDb, 'admins'), where('email', '==', values.email));
            const existingAdminSnapshot = await getDocs(existingAdminQuery);
    
            if (!existingAdminSnapshot.empty) {
                console.error('User with this email already exists'); 
                toast.error('User with this email already exists');  
                toast.error(`A User with the Email '${values.email}' already exists`);


                return;
            }
    
            const adminData = {
                firstname: values.firstname,
                lastname: values.lastname,
                email: values.email,
                phonenumber: values.phonenumber,
                status: true,
                super_admin: values.super_admin,
            };
    
            const docRef = await addDoc(collection(fbDb, 'admins'), adminData);
            console.log('Admin added with ID: ', docRef.id);
    
            if (!values.invitationSent) {
                // Authentication
                const auth = getAuth(firebaseApp);
    
                // Send invitation email
                const actionCodeSettings = {
                    url: `https://truckit-bonq6jlwi-truckit.vercel.app/auth?adminId=${docRef.id}`,
                    handleCodeInApp: true,
                };
    
                await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);
    
                // Mark the invitation as sent in Firestore
                await updateDoc(docRef, {
                    invitationSent: true,
                });
    
                console.log('Invitation email sent successfully');
            }
    
            // Close your form or perform any other necessary actions
            setOpen(false);
        } catch (error) {
            console.error('Error adding admin:', error);
        }
    };
    
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'admins'));
                const adminsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFetchedAdmins(adminsData);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };
    
        fetchAdmins();
    }, []);  
    
    const updateFetchedAdmins = (updatedAdmins: SetStateAction<DocumentData[]>) => {
        setFetchedAdmins(updatedAdmins);
    };

    const handleEditClick = (admin: DocumentData) => {
        setSelectedAdmin(admin);
        setEditFormInitialValues({
            firstname: admin.firstname,
            lastname: admin.lastname,
            email: admin.email,
            phonenumber:admin.phonenumber,
            super_admin:admin.super_admin,
            status:admin.status,

        });
        setEditModalOpen(true);
      };
      

    const handleEditModalClose = () => {
        setSelectedAdmin(null); 
        setEditModalOpen(false); 
    };

    const handleEditSubmit = async (values: { 
        firstname: any,
        lastname: any,
        email: any,
        phonenumber: any,
        super_admin:any, 
        status:any,

      }) => { 
        if (!selectedAdmin) {
            console.error("No selected Admin to update");
            return;
          }
        
          console.log("Edited Values:", values);
      
        try {
          if (!values) {
            console.error("Form values are undefined");
            return;
          }
      
          if (
            !values.firstname ||
            !values.lastname ||
            !values.email ||
            !values.phonenumber ||
            !values.super_admin|| 
            !values.status
          ) 
           {
            console.error("Required form fields are missing");
            return;
          }  
          
          // Update the vehicle data in the database using the selectedVehicle.id
          const AdminRef = doc(fbDb, "admins", selectedAdmin.id);
          await setDoc(AdminRef, {
            firstname: values.firstname,
            lastname: values.lastname,
            email: values.email,
            phonenumber:values.phonenumber,
            super_admin:values.super_admin,
            status:values.status,
          });
      
          // Update the local fetchedVehicles state
          const updatedVehicles = fetchedAdmins.map((admin) =>
            admin.id === selectedAdmin.id
              ? {
                  ...admin,
                  firstname: values.firstname,
                  phonenumber: values.phonenumber,
                  lastname: values.lastname,
                  email:values.email,
                  super_admin:values.super_admin,
                  status:values.status,
                }
              : admin
          );
          setFetchedAdmins(updatedVehicles);
      
          setSelectedAdmin(null);
          setEditModalOpen(false);
        } catch (error) {
          console.error("Error updating Admin:", error);
        }
      };
    
        
    return (
        <>
        <div className='bg-[#FAFAFB]'>
            <div className='mt-8 max-h-[500px]'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-[#FAFAFB]'>
                        </div> 
                        <div className='flex justify-end text-base mr-2'>
                        <SearchBar
                         placeholder='Search name, id, phone'
                          value={searchQuery}
                          onChange={handleSearchChange} 
                          className="h-6"
                />
                         
                        <div className='ml-2'>
                            <AddButton name='Add User' handleAddClick={handleAddAdmin}/>
                            </div>
                        </div>


                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                            <div  className="h-full overflow-y-auto">
                            <AdminsTable selectedTab={selectedTab} admins={fetchedAdmins} filteredAdmins={filteredAdmins} updateFetchedAdmins={updateFetchedAdmins} handleEditClick={handleEditClick} /> 
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
                        invitationSent: false,

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
                                <label className="form-label">Admin</label>
                                <Field
                                type="checkbox"
                                name="super_admin" 
                               checked={values.super_admin}
                               className="form-checkbox bg-gray-200"
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
            {editModalOpen && selectedAdmin && (
                <FormModal open={editModalOpen} setOpen={handleEditModalClose}> 
                <div>
                <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Edit Admin Details
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleEditModalClose}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>
                
                    <Formik
            

                // initialValues={editFormInitialValues}
                // onSubmit={handleEditSubmit} 
                        initialValues={editFormInitialValues}
                      onSubmit={handleEditSubmit}
                        > 

                            {({ values }) => (
                                      <Form>
                                      <div className=''>
                                          <div className='flex w-full justify-between'>
                                          <label className="block">
                                           <label className="form-label">fIRST NAME</label>
                                           <Field
                                            type="text"    
                                            name="firstname"
                                            value={values.firstname} 
                                            disabled
                                            className="form-input bg-grey w-48"
                                          />
                                           </label>
                                           <label className="block">
                                           <label className="form-label">LASTNAME</label>
                                            <Field
                                            type="text"
                                            name="lastname"
                                            value={values.lastname} 
                                            disabled
                                            className="form-input bg-grey w-48"
                                            />
                                          </label>                           
                                           </div>
                                          <div className='flex w-full justify-between mt-8'>
                                          <label className="block">
                                          <label className="form-label"> EMAIL</label>
                                          <Field
                                           type="email"
                                           name="email"
                                           value={values.email} 
                                           disabled
                                           className="form-input bg-grey w-48"
                                          />
                                           </label> 
                                           <label className="block">
                                          <label className="form-label">STATUS</label>
                                          <Field
                                           type="text"
                                           name="status"
                                           value={values.status} 
                                           className="form-input bg-grey w-48"
                                          />
                                           </label>                                 
                                          </div>
                                          <div className='flex w-full justify-between mt-8'>
                                           <label className="block">
                                           <label className="form-label">Admin</label>
                                           <Field
                                            type="checkbox"
                                            name="super_admin"
                                            checked={values.super_admin}
                                            className="form-checkbox bg-gray-200"
                                            />
                                            </label>                                                       
                                          </div> 
                                          <div className='flex w-full justify-end mt-24 '>
                                              <Button className='rounded bg-d-green w-[160px] h-8 uppercase  text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' handleClick={handleEditModalClose}>Reset</Button>
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
            </div> 
            </div>
        </>
    )
}

interface AdminsTableProps {
    selectedTab: number;
    admins: DocumentData[]; 
    filteredAdmins: DocumentData[]; 
    updateFetchedAdmins: (updatedAdmins: DocumentData[]) => void; 
    handleEditClick: any
}

export function AdminsTable({ selectedTab,updateFetchedAdmins,handleEditClick,admins ,filteredAdmins}: AdminsTableProps) { 
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 4;
    console.log("AdminsTable Rendering with selectedTab:", selectedTab);
    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage; 
    console.log('Filterd Admins',filteredAdmins);
    
    const visibleAdmins = filteredAdmins.slice(startIndex, endIndex); 
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
                    {visibleAdmins.map((admin, index) => {  
                        const userId = `U${(index + 1).toString().padStart(3, '0')}`;
                        console.log("User ID",userId); 
                   return (
            <Fragment key={index}> 
            <div className='w-full mb-2'></div>
                <tr className='border-solid border-2 border-[#D9E2F6] h-10 font-nunito font-regular'>
                    <td className="whitespace-nowrap font-nunito font-regular pr-3 pt-1 pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0">
                        {userId}
                    </td> 
                    <BodyCell>
                        {`${admin.firstname} ${admin.lastname}`}
                    </BodyCell> 
                    <BodyCell >{admin.phonenumber}</BodyCell> 

                             <div className='h-10 flex items-center '>
                                {admin.super_admin ?
                                    <CheckCircleIcon className='h-8 w-8 text-d-green'/>
                                    :
                                    <XCircleIcon className='h-8 w-8 text-crimson-red'/>
                                }
                            </div> 
                            {/* onClick={() => updateDriverStatusInDatabase(drivers.id, !drivers.archive)} */}                     <BodyCell>
                        <>
                        <div  onClick={()=>handleEditClick(admin)}>
                            <EditBtn/>
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




   