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
import firebaseApp, { fbDb } from "@/firebase/configs";
import { DocumentData, getDocs, collection, addDoc, query, where, getFirestore, onSnapshot } from "firebase/firestore";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from 'formik/dist/index';
import toast from "react-hot-toast"; 
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";


const Headers = ["CLIENT ID", "NAME"]
export default function Cities(){
    const handleAdd = () => {
    } 
    const [searchQuery, setSearchQuery] = useState(""); 
    const [fetchedClients, setfetchedClients]=useState<DocumentData[]>([]);   
    const [open, setOpen] = useState(false) 

   const {organisationId} = useAuthContext(); 
   console.log(" Clienst Organisation ID:", organisationId);
   

    const handleReset = () => {
        setOpen(false)
    }  

      const handleSearchChange = (e:any) => {
        const query = e.target.value;
        console.log("Search Query:", query);
        setSearchQuery(query);
      };   
      const filteredClients = fetchedClients.filter((client) => {
        const fullName = `${client.name}`.toLowerCase();
        const nameMatch = fullName.includes(searchQuery.toLowerCase());
          return nameMatch;
      });
     
useEffect(() => {
    const fetchedClients = async () => { 
            const db = getFirestore();

      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
       const q = query(collection(db, 'clients'), where('organisationId', '==', organisationId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const departmentsData = querySnapshot.docs.map((doc) => ({
       id: doc.id,
       ...doc.data(),
       }));
     setfetchedClients(departmentsData);
      });

     return () => unsubscribe(); 

        } else {
          console.error('Organisation ID is not available.');
        }  
      } catch (error) {
        console.error('Error fetching Clients:', error);
      }
        };
       fetchedClients();
         }, [organisationId]); 
         
         async function generateCitiesId(organisationId: string) {
            try {
              const querySnapshot = await getDocs(query(collection(fbDb, 'clients'), where('organisationId', '==', organisationId)));
              const adminCount = querySnapshot.size;
          
              // Customize this logic based on your requirements
              return `C${(adminCount + 1).toString().padStart(3, '0')}`;
            } catch (error) {
              console.error('Error fetching Client count:', error);
              // Handle error or return a default value
              return 'C001';
            }
          }
        

    const handleAddClient = async (values: { name: any; address: any; contact_details: any; representative_address: any; client_details: any;}) => { 
        setOpen(true)
        console.log("Submitted Values:", values);  

    
        try {
            if (!values) {
                console.error('Form values are undefined');
                return;
            }
    
            if (!values.name||!values.address||!values.contact_details||!values.representative_address||!values.client_details) {
                console.error('Required form fields are missing');
                return;
            }  


            let clientDetailsImageUrl = '';  
            if (values.client_details) {
                const storage = getStorage(firebaseApp);
                const storageRef = ref(storage, `client_details/${values.client_details.name}`);
                
                await uploadBytes(storageRef, values.client_details);
                clientDetailsImageUrl = await getDownloadURL(storageRef);
                console.log('Client Details URL:', clientDetailsImageUrl);

            }  

            const existingDepartmentQuery = query(collection(fbDb, 'clients'), 
            where('name', '==', values.name),
            where('organisationId', '==', organisationId)
          );
      
          const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);
      
          if (!existingDepartmentSnapshot.empty) {
            console.error('Client with this name already exists in the same organisation'); 
            toast.error(`A Client with the name '${values.name}' already exists`);
            return;
          } 
          
      
            if (organisationId === null) {
              console.error('organisationId is null');
              // Handle the null case, maybe show an error or return
              return;
            }
            const generatedCitiesId = await generateCitiesId(organisationId);

    
            const clientsData = {
                name: values.name, 
                address: values.address,
                contact_details: values.contact_details,
                representative_address: values.representative_address, 
                client_details: clientDetailsImageUrl,
                clientId:generatedCitiesId, 
                organisationId: organisationId,

            };
    
            const docRef = await addDoc(collection(fbDb, 'clients'), clientsData);
            console.log('Client added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding Client:', error);
        } 
    }  


    return (
        <>
            <div className='mt-8 max-h-[700px]'>  
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'> 
                        <div className="flex Justify-end">
            <Button className='rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2'
                                handleClick={handleAddClient}>
                            <>
                                <PlusIcon className='h-6 w-6 mr-2'/>
                                Add Client
                            </>
                        </Button>  
                     </div>

                        </div>

                    </div>

                        <Tab.Panel>
                            <div  className="max-h-[500px] overflow-y-auto">
                            <CitiesTable clients={fetchedClients} filteredClients={filteredClients}/>
                            </div>
                        </Tab.Panel>
                </Tab.Group> 
                <FormModal open={open} setOpen={setOpen}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '> 
                        ADD NEW CLIENT
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Formik
                    initialValues={{
                        name: "", 
                        address: "",
                        contact_details: "", 
                        representative_address: "", 
                        client_details: null,
                                      }}
                        onSubmit={(values) => handleAddClient(values)}  
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
                             <label className="form-label">ADDRESS</label>
                             <Field
                              type="text"
                              name="address"
                              value={values.address}
                              className="form-input bg-grey w-48"
                            />
                             </label>                        
                             </div> 
                             <div className='flex w-full justify-between mt-8'>
                            <label className="block">
                             <label className="form-label">CONTACT DETAILS</label>
                             <Field
                              type="text"
                              name="contact_details"
                              value={values.contact_details}
                              className="form-input bg-grey w-48"
                            />
                             </label>   

                            <label className="block">
                             <label className="form-label">REPRESENTATIVE ADDRESS</label>
                             <Field
                              type="text"
                              name="representative_address"
                              value={values.representative_address}
                              className="form-input bg-grey w-48"
                            />
                             </label>                        
                             </div> 

                             <div className='flex w-full justify-between mt-8'>
                             <label className="block">
                             <label className="form-label">CLIENT DETAILS</label>
                             <Field name="client_details" >
                            {({ field, form }:any) => (
                            <input 
                            type="file"
                           onChange={(event) => {
                           const file = event.currentTarget?.files?.[0];
                            if (file) {
                          form.setFieldValue('client_details', file);
                          }
                         }} 
                               />
                            )}
                           </Field>
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
    
            const docRef = await addDoc(collection(fbDb, 'clients'), clientsData);
            console.log('Client added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding Client:', error);
        } 
    }  


      
    return (
        <>
        <p className="text-lg ml-8 font-bold">Clients</p>  
        {/* <div className="fles flex-row"> */}
        <div className='flex  text-base mt-2 ml-8 w-72 searchBarContainer'>
        <SearchBar
                  placeholder='Search For Clients'
                  value={searchQuery}
                  onChange={handleSearchChange} 
                  className='ml-5'
                /> 
        </div>  

 

                        {/* </div> */}
        {/* <div className="flex justify-end mr-20 bg-[#FAFAFB]">
            <p>Nairobi,Kenya</p> 
           <i className="fa fa-angle-down" aria-hidden="true"></i>
           </div> */}


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
                        {filteredClients.map((clients, index) => {  
                            const clientId = `C${(index + 1).toString().padStart(3, '0')}`;
                            console.log("Client ID",clientId); 
                            return (
                                <Fragment key={index}> 
                                    <div className='w-full mb-2'></div>
                                    <tr className='border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>
                                    <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0 font-nunito font-regular ">
                                            {clients.clientId}
                                        </td>
                                        <BodyCell>
                                            {clients.name}
                                        </BodyCell>
                                        {/* <BodyCell>Ksh 250000</BodyCell> */}
                                        {/* <BodyCell>Ksh 250000</BodyCell>  */}
                                        <div className='h-10'></div>
    
                                    </tr> 
                                    {/* </div> */} 
                                 
                                </Fragment>
                            )
                        })}
                    </TableBody>
                </>
            </Table> 
      
            
        </>
    )
}

