import {Tab} from "@headlessui/react";
import {ChangeEvent, Fragment, useEffect, useState} from "react";
import {AddButton} from "@/components/Buttons";
import Table, {DummyTable} from "@/components/Table/Table";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { HeaderCell, BodyCell } from "../../../components/Table/Cells";
import { TableBody } from "../../../components/Table/Row";
import SearchBar from "../../../components/Forms/input"
import Link from "next/link";
import DashboardComponent from "../../Dashboard"
import { fbDb } from "@/firebase/configs";
import { DocumentData, getDocs, collection } from "firebase/firestore";


const Headers = ["CLIENT ID", "NAME", "EXPENSES", "PROFIT"]
const cities = [
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
    {
        client_id: "789797",
        name: "Bennedict Ambula",
        expenses: "6000",
        profit: "4500",

    },
]

export default function Cities(){
    const handleAdd = () => {
    } 
    const [searchQuery, setSearchQuery] = useState(""); 
    const [fetchedClients, setfetchedClients]=useState<DocumentData[]>([]);  

 

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
  
    const handleClick = () => {
    }
    const handleSearch = () => {
    }
    const handleExport = () => {
    }  

    useEffect(() => { 
        const fetchedClients = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'clients'));  
                console.log(querySnapshot);
                const clientsData: DocumentData[] = []; 
                console.log(clientsData);
                
                querySnapshot.forEach((doc) => {
                    const trips = {
                        id: doc.id,
                        ...doc.data()
                    };
                    clientsData.push(trips);
                });
                setfetchedClients(clientsData);
            } catch (error) {
                console.error('Error fetching Clients:', error);
            }
        };
        fetchedClients();
    }, []);  

    return (
        <>
            <div className='mt-8 max-h-[700px]'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'>

                        </div>



                    </div>

                        <Tab.Panel>
                            <div  className="max-h-[500px] overflow-y-auto">
                            <CitiesTable clients={fetchedClients} filteredClients={filteredClients}/>
                            </div>
                        </Tab.Panel>
                </Tab.Group>

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
      
    return (
        <>
        <p className="text-lg ml-8 font-bold">Clients</p> 
        <div className='flex  text-base mt-2 ml-8 w-72 searchBarContainer'>
        <SearchBar
                  placeholder='Search For Clients'
                  value={searchQuery}
                  onChange={handleSearchChange} 
                  className='ml-5'
                /> 
        </div>
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
                            return (
                                <Fragment key={index}> 
                                    <div className='w-full mb-2'></div>
                                    <tr className='border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mb-2 h-10 font-nunito font-regular'>
                                    <td className="whitespace-nowrap  pl-4 pr-3 !pt-4 text-d-blue text-base sm:pl-0 font-nunito font-regular">
                                            {clients.id}
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

