import {Tab} from "@headlessui/react";
import {ChangeEvent, Fragment, useEffect, useState} from "react";
import {AddButton, Button} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { CheckCircleIcon, PlusIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { HeaderCell, BodyCell } from "../../../../components/Table/Cells";
import { TableBody } from "../../../../components/Table/Row";
import SearchBar from "../../../../components/Forms/input"
import Link from "next/link";
import DashboardComponent from "../../../Dashboard"
import { fbDb } from "@/firebase/configs";
import { DocumentData, getDocs, collection, addDoc, query, where, getFirestore, onSnapshot } from "firebase/firestore";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from 'formik/dist/index';
import toast from "react-hot-toast"; 
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";


const Headers = ["CLASS ID", "NAME"]
export default function Class(){
    const handleAdd = () => {
    } 
    const [searchQuery, setSearchQuery] = useState(""); 
    const [fetchedClasses, setfetchedClasses]=useState<DocumentData[]>([]);   
    const [open, setOpen] = useState(false) 

   const {organisationId} = useAuthContext(); 
   console.log(" Class Organisation ID:", organisationId);
   

    const handleReset = () => {
        setOpen(false)
    }  

      const handleSearchChange = (e:any) => {
        const query = e.target.value;
        console.log("Search Query:", query);
        setSearchQuery(query);
      };   
      const filteredClients = fetchedClasses.filter((client) => {
        const fullName = `${client.name}`.toLowerCase();
        const nameMatch = fullName.includes(searchQuery.toLowerCase());
          return nameMatch;
      });
   
    useEffect(() => {
    const fetchedClasses = async () => { 
            const db = getFirestore();

      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
       const q = query(collection(db, 'classes'), where('organisationId', '==', organisationId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientsData = querySnapshot.docs.map((doc) => ({
       id: doc.id,
       ...doc.data(),
       }));
       setfetchedClasses(clientsData);
      });

       return () => unsubscribe(); 

        } else {
          console.error('Organisation ID is not available.');
        }  
      } catch (error) {
        console.error('Error fetching Classes:', error);
      }
        };
        fetchedClasses();
         }, [organisationId]); 
    
         async function generateAdminId(organisationId: string) {
            try {
              const querySnapshot = await getDocs(query(collection(fbDb, 'classes'), where('organisationId', '==', organisationId)));
              const adminCount = querySnapshot.size;
          
              // Customize this logic based on your requirements
              return `C${(adminCount + 1).toString().padStart(3, '0')}`;
            } catch (error) {
              console.error('Error fetching Classes count:', error);
              // Handle error or return a default value
              return 'C001';
            }
          }
    const handleAddClient = async (values: { name: any;}) => { 
        setOpen(true)
        console.log("Submitted Values:", values);  

    
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.name) {
                console.error('Required form fields are missing');
                return;
            }  

            const existingDepartmentQuery = query(collection(fbDb, 'classes'), 
            where('name', '==', values.name),
            where('organisationId', '==', organisationId)
          );
      
          const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);
      
          if (!existingDepartmentSnapshot.empty) {
            console.error('Class with this name already exists in the same organisation'); 
            toast.error(`A Class with the name '${values.name}' already exists`);
            return;
          } 
          
          if (organisationId === null) {
            console.error('organisationId is null');
            // Handle the null case, maybe show an error or return
            return;
          }
          const generatedClassId = await generateAdminId(organisationId);

            const clientsData = {
                name: values.name,
                classId: generatedClassId, 
                organisationId: organisationId,

            };
    
            const docRef = await addDoc(collection(fbDb, 'classes'), clientsData);
            console.log('Class added with ID: ', docRef.id);
            toast.success("Class Successfully Added.");

    
            setOpen(false);
        } catch (error) {
            console.error('Error adding Class:', error);
        } 
    }  


    return (
        <>
            <div className='mt-2 max-h-[700px]'>  
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'> 
                        <div className="flex Justify-end">
                      <Button className='rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2'
                                handleClick={handleAddClient}>
                            <>
                                <PlusIcon className='h-6 w-6 mr-2'/>
                                Add Class
                            </>
                        </Button>  
            </div>

                        </div>



                    </div>

                        <Tab.Panel>
                            <div  className="h-full overflow-y-auto">
                            <CitiesTable clients={fetchedClasses} filteredClients={filteredClients}/>
                            </div>
                        </Tab.Panel>
                </Tab.Group> 
                <FormModal open={open} setOpen={setOpen}>
                <div className='p-5'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '> 
                        NEW CLASS
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Formik
                    initialValues={{
                        name: "",
            
                                      }}
                        onSubmit={(values) => handleAddClient(values)}  
  
                        // onSubmit={(values) => handleEditSubmit(values)}


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
        </>
    )
} 

interface ClientsTableProps {
    clients: DocumentData[]; 
    filteredClients: DocumentData[];


}

function CitiesTable({ clients, }: ClientsTableProps) { 
    const [searchQuery, setSearchQuery] = useState("");  
    const [fetchedClients, setfetchedClients]=useState<DocumentData[]>([]);  
    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 6;
    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage; 
    
      const handleSearchChange = (e:any) => {
        const query = e.target.value;
        console.log("Search Query:", query);
        setSearchQuery(query);
      };   
      const filteredClients = clients.filter((client) => {
        const fullName = `${client.name}`.toLowerCase();
        const nameMatch = fullName.includes(searchQuery.toLowerCase());
          return nameMatch;
      }); 
      console.log("FILTERD CLIENTS",filteredClients);
      const visibleClasses = filteredClients.slice(startIndex, endIndex); 
 
      const handleAddClient = async (values: { name: any;}) => { 
        setOpen(true)
        console.log("Submitted Values:", values);  

    
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.name) {
                console.error('Required form fields are missing');
                return;
            } 

    
            const clientsData = {
                name: values.name,
            };
    
            const docRef = await addDoc(collection(fbDb, 'classes'), clientsData);
            console.log('Client added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding Client:', error);
        } 
    }  
      
    return (
        <>
        {/* const Headers = ["CLASS ID", "NAME"] */}
        <p className="text-base ml-10 font-bold">Class</p>  
        <div className='flex  text-base mt-2 ml-8 w-72 searchBarContainer'>
        <SearchBar
                  placeholder='Search For Class'
                  value={searchQuery}
                  onChange={handleSearchChange} 
                  className='ml-5'
                /> 
        </div>  
        {/* <div className="flex justify-end mr-20 bg-[#FAFAFB]">
            <p>Nairobi,Kenya</p> 
           <i className="fa fa-angle-down" aria-hidden="true"></i>
           </div> */}
          <div className="ml-2 px-4 sm:px-6 lg:px-8">
          <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">CLASS ID</th>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">NAME</th>  
                    </tr>
                    </thead>
                    <tbody className="bg-[#FAFAFB]">
                        {visibleClasses.map((clients, index) => {  
                            return (
                                <Fragment key={index}>   
                                    <tr className="hover:bg-gray-100">
                                   <td className="whitespace-nowrap font-nunito font-regular pr-3 pt-1 pl-4 pr-3 text-d-blue text-base sm:pl-0"> {clients.classId}</td>
                                   <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                   {clients.name}
                                   </td>    
                                    </tr> 
                                </Fragment>
                            )
                        })}
                    </tbody>
                </table>
              </div>
            </div>
            </div>      
        </div>  

        
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
      disabled={endIndex >= visibleClasses.length}
       >
      Next
    </button>
    </div>
        </> 
    )
}

