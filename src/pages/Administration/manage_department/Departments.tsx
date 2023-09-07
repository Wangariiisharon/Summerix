import {Tab} from "@headlessui/react";
import {Fragment, SetStateAction, useEffect, useState} from "react";
import {AddButton, Button} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BodyCell, HeaderCell } from "../../../components/Table/Cells";
import { TableBody } from "../../../components/Table/Row";
import { DocumentData, addDoc, collection, getDocs } from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { FormModal } from "@/components/Modals/FormModal";
import { Field, Form, Formik } from "formik"; 
import { formatDistanceToNow } from 'date-fns'; 
import ViewMenu from "./viewMenu"


const Headers = ["DRIVER ID", "NAME", "MEMBERS","UPDATED"," STATUS"]


export default function Departments(){ 
    const [open,setOpen]=useState(false) 
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedDepartments, setFetchedDepartments] = useState<DocumentData[]>([]); 
    const handleAdd = () => { 
        setOpen(true)
    }  
    const handleReset = () => {

    }
    const handleSubmit = async (values: { name: any; members: any;}) => { 
        console.log("Submitted Values:", values);
    
        try {
            
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.name || !values.members ) {
                console.error('Required form fields are missing');
                console.log("Submitted Values:", values);

                
                return;
            } 
            

            const updated = new Date();


            const DepartmentsData = {
                name: values.name,
                members: values.members,
                updated: updated,  
                status:true,

             
            };
    
            const docRef = await addDoc(collection(fbDb, 'departments'), DepartmentsData);
            console.log('Department added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding Driver:', error);
        } 
} 
    useEffect(() => {
        const fetchedDepartments = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'departments'));
                const departmentsData: DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    const department = {
                        id: doc.id,
                        ...doc.data()
                    };
                    departmentsData.push(department);
                });
                setFetchedDepartments(departmentsData);
            } catch (error) {
                console.error('Error fetching Drivers:', error);
            }
        };
    
        fetchedDepartments();
    }, []);  
    const updatefetchedDepartments = (updatedDepartments: SetStateAction<DocumentData[]>) => {
        setFetchedDepartments(updatedDepartments);
    };

    return (
        <>
            <div className='mt-8 max-h-[700px]'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'>
             
                        </div>

                        <div className='flex justify-end text-base mr-2'>
                          <div className='ml-2'>
                            <AddButton name='Add' handleAddClick={handleAdd}/>
                            </div>
                        </div>

                    </div>

                    <Tab.Panels>

                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto"> 
                        <DepartmentsTable departments={fetchedDepartments} updateFetchedDepartments={updatefetchedDepartments} />

                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
                <div>
            <FormModal open={open} setOpen={setOpen}>
                <div className='p-5'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            New Department
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>
                    <Formik
                    initialValues={{
                        name: "",
                        members: 0,

                                      }}
                        onSubmit={(values) => {
                        console.log('Form Values:', values);

                            handleSubmit(values);
                          }}
                        >
                       {({ values,setFieldValue }) => (
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
                             <label className="form-label">Members</label>
                              <Field
                              type="number"
                              name="members"
                              value={values.members}
                              className="form-input bg-grey w-48"
                              />
                            </label>                           
                             </div>
              

   
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='text-blue text-xl mr-32' handleClick={handleReset}>Reset</Button>
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
    departments: DocumentData[];
    updateFetchedDepartments: (updatedDepartments: DocumentData[]) => void; 
}

export function DepartmentsTable({ departments,updateFetchedDepartments }: VehiclesTableProps) { 

  
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
                        {departments.map((departments, index) => {
                        const { seconds } = departments.updated; 
                        const updatedDate = new Date(seconds * 1000);

                            return (
                                <Fragment key={index}>
                                   <div className="w-full mb-2"></div>
                                    <tr className='border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] h-10 font-nunito font-regular' >
                                        <td className="whitespace-nowrap flex flex-row  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0 font-nunito font-regular">
                                            {departments.id}  <ViewMenu departmentId={departments.id} />
                                            {/* router.push(`/Administration/manage_roles/assignRole?id=${admin.id}`); */}

                                        </td>
                                        <BodyCell>
                                        {departments.name}
                                        </BodyCell>
                                        <BodyCell>{departments.members}</BodyCell>
                                        <BodyCell>{formatDistanceToNow(updatedDate)} ago</BodyCell>
                                        <BodyCell>{departments.status ? 'Active' : 'Inactive'}</BodyCell>
                                        <div className="h-10 font-nunito font-regular"></div>

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


