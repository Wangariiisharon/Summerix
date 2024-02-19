import {Tab} from "@headlessui/react";
import {Fragment, SetStateAction, useEffect, useState} from "react";
import {AddButton, Button} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BodyCell, HeaderCell } from "../../../../components/Table/Cells";
import { TableBody } from "../../../../components/Table/Row";
import { DocumentData, addDoc, collection, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { fbDb } from "@/firebase/configs";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from 'formik/dist/index';
import { formatDistanceToNow } from 'date-fns'; 
import ViewMenu from "./viewMenu"
import toast from "react-hot-toast"; 
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";



const Headers = ["DEPARTMENT ID", "NAME","UPDATED"]
export default function Departments(){ 
    const [open,setOpen]=useState(false) 
    const [selectedTab, setSelectedTab] = useState<number>(0); 
    const [fetchedDepartments, setFetchedDepartments] = useState<DocumentData[]>([]);  
    
    const { organisationId } = useAuthContext();
    console.log("Departments Organisation ID:", organisationId);


    const handleAdd = () => { 
        setOpen(true)
    }  
    const handleReset = () => { 
        setOpen(false)
    }

    useEffect(() => {
        const fetchedDepartments = async () => { 
                const db = getFirestore();

          try {
            if (organisationId) {
         const q = query(collection(db, 'departments'), where('organisationId', '==', organisationId));

       const unsubscribe = onSnapshot(q, (querySnapshot) => {
         const departmentsData = querySnapshot.docs.map((doc) => ({
           id: doc.id,
           ...doc.data(),
         }));
         setFetchedDepartments(departmentsData);
       });

      return () => unsubscribe(); 

            } else {
              console.error('Organisation ID is not available.');
            }  
          } catch (error) {
            console.error('Error fetching Departments:', error);
          }
        };
        fetchedDepartments();
}, [organisationId]);  


// Function to generate departmentId based on the count of departments
async function generateDepartmentId(organisationId: string) {
    try {
      const querySnapshot = await getDocs(query(collection(fbDb, 'departments'), where('organisationId', '==', organisationId)));
      const departmentCount = querySnapshot.size;
  
      // Customize this logic based on your requirements
      return `D${(departmentCount + 1).toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error fetching departments count:', error);
      // Handle error or return a default value
      return 'D001';
    }
  }

    const handleSubmit = async (values: { name: any;}) => { 
        console.log("Submitted Values:", values);
    
        try {
            
            if (!values.name) {
                console.error('Required form fields are missing');
                console.log("Submitted Values:", values);  
                toast.error("Please fill in the name field");  
 
                return;
            }  
            const existingDepartmentQuery = query(collection(fbDb, 'departments'), 
            where('name', '==', values.name),
            where('organisationId', '==', organisationId)
          );
      
          const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);
      
          if (!existingDepartmentSnapshot.empty) {
            console.error('Department with this name already exists in the same organisation'); 
            toast.error(`A Department with the name '${values.name}' already exists`);
            return;
          } 
            if (organisationId === null) {
                console.error('organisationId is null');
                // Handle the null case, maybe show an error or return
                return;
              }
          
              // Use the generateDepartmentId function to get the appropriate departmentId
              const generatedDepartmentId = await generateDepartmentId(organisationId);


    
            const updated = new Date();
            const DepartmentsData = {
                departmentId: generatedDepartmentId,
                name: values.name,
                updated: updated,  
                status:true, 
                organisationId: organisationId      
            };
    
            const docRef = await addDoc(collection(fbDb, 'departments'), DepartmentsData);
            console.log('Department added with ID: ', docRef.id); 
            toast.success("Department Successfully Added.");
   
            setOpen(false);
        } catch (error) {
            console.error('Error adding Department:', error);
        } 
} 

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
                            <AddButton name='Add Group' handleAddClick={handleAdd}/>
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
                        // members: 0,

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
                             </div>
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4 mr-32' handleClick={handleReset}>Reset</Button>
                                <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center justify-center py-4 px-4' type='submit' >Save</button>
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
    const handleDeactivate = (id: string) => {
        // Implement your deactivation logic here
        console.log(`Deactivating department with ID: ${id}`);
    
        // Filter out the deactivated department from the list
        const updatedDepartments = departments.filter((department) => department.id !== id);
    
        // Update the state with the filtered list of departments
        updateFetchedDepartments(updatedDepartments);
      };

  
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
                        // const { seconds } = departments.updated; 
                        const { seconds } = departments?.updated || {}; // Use optional chaining
                        if (seconds !== undefined) {
                            const updatedDate = new Date(seconds * 1000);
                            const departmentId = `D${(index + 1).toString().padStart(3, '0')}`;
                            console.log("Vehicle ID", departmentId);

                        // const updatedDate = new Date(seconds * 1000); 
                        // const departmentId = `D${(index + 1).toString().padStart(3, '0')}`; 
                        
                        console.log("Vehicle ID",departmentId); 

                            return (
                                <Fragment key={index}>
                                   <div className="w-full mb-2"></div>
                                    <tr className='border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] h-10 font-nunito font-regular' >
                                        <td className="whitespace-nowrap flex flex-row  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0 font-nunito font-regular">
                                            {departments.departmentId}  <ViewMenu departmentId={departments.id} onDeactivate={() => handleDeactivate(departments.id)}/>
                                            {/* router.push(`/Administration/manage_roles/assignRole?id=${admin.id}`); */}
                                        </td>
                                        <BodyCell>
                                        {departments.name}
                                        </BodyCell>
                                        {/* <BodyCell>{departments.members}</BodyCell> */}
                                        <BodyCell>{formatDistanceToNow(updatedDate)} ago</BodyCell>
                                        {/* <BodyCell>{departments.status ? 'Active' : 'Inactive'}</BodyCell> */}
                                        <div className="h-10 font-nunito font-regular"></div>

                                    </tr>
                                </Fragment>
                            )
                        }
                        })}
                    </TableBody>
                </>
            </Table>
        </>
    )
}


