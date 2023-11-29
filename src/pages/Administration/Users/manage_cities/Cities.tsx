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
import { DocumentData, getDocs, collection, addDoc, query, where } from "firebase/firestore";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from 'formik/dist/index';
import toast from "react-hot-toast";

const Headers = ["CLIENT ID", "NAME", "EXPENSES", "PROFIT"]
export default function Cities(){
    const handleAdd = () => {
    } 
    const [searchQuery, setSearchQuery] = useState(""); 
    const [fetchedClients, setfetchedClients]=useState<DocumentData[]>([]);   
    const [open, setOpen] = useState(false)

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
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'clients'));
                const clientsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setfetchedClients(clientsData);
            } catch (error) {
                console.error('Error fetching Clients:', error);
            }
        };
    
        fetchedClients();
    }, []);   
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

            const existingDriverQuery = await getDocs(query(collection(fbDb, 'clients'), where('name', '==', values.name)));
    
            if (!existingDriverQuery.empty) {
              console.error('This Client Already Exists'); 
              toast.error(`A Client with the name '${values.name}' already exists`);
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
        <div className="flex justify-end mr-20 bg-[#FAFAFB]">
            <p>Nairobi,Kenya</p> 
           <i className="fa fa-angle-down" aria-hidden="true"></i>
           </div>


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
                                            {clientId}
                                        </td>
                                        <BodyCell>
                                            {clients.name}
                                        </BodyCell>
                                        <BodyCell>Ksh 250000</BodyCell>
                                        <BodyCell>Ksh 250000</BodyCell> 
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

