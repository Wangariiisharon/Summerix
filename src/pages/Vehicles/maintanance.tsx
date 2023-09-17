import {Header, HeaderBar} from "@/components/Headers";
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons";
import {headers} from "next/headers";
import {DummyTable} from "@/components/Table/Table";
import {FormEvent, Fragment, ReactNode, useEffect, useState} from "react";
import {FormModal} from "@/components/Modals/FormModal";
import {Input, Submit} from "@/components/Forms/input";
import SiteLayout from "@/Layout/SiteLayout";
import {PlusIcon, XMarkIcon} from "@heroicons/react/24/outline";
import { Tab } from "@headlessui/react";
import Planned from "./jobcard";
import { fbDb } from "@/firebase/configs";
import { getDocs, collection, DocumentData, addDoc } from "firebase/firestore";
import { parseISO, format } from 'date-fns';
import Jobcard from "./jobcard";
import { Field, Formik,Form } from "formik";


const tabs = [
    {name: 'PLANNED', href: '#', current: false},
    {name: 'HISTORY', href: '#', current: false},
    {name: 'JOB CARD', href: '#', current: true},
]


export default function Maintenance() {
    const [open, setOpen] = useState(false)
    const [selectedTab, setSelectedTab] = useState<number>(0);  
    const [fetchedMaintanance, setFetchedMaintanance]=useState<DocumentData[]>([]);  

    const handleAddClick = () => {
        setOpen(true)
    }
    const handleReset = () => {
        setOpen(false)
    }  
    const handleTabClick = (index:any) => {
        setSelectedTab(index);
    };

    useEffect(() => {
        const fetchedMaintanance = async () => {
            try {
                const querySnapshot = await getDocs(collection(fbDb, 'maintenance'));
                const maintenanceData: DocumentData[] = []; 
                console.log(maintenanceData);
                
                querySnapshot.forEach((doc) => {
                    const maintenance = {
                        id: doc.id,
                        ...doc.data()
                    };
                    maintenanceData.push(maintenance);
                });
                setFetchedMaintanance(maintenanceData);
            } catch (error) {
                console.error('Error fetching maintenance:', error);
            }
        };
    
        fetchedMaintanance();
    }, []); 

    const handleAddJobcard = async (values: { name: any;}) => {
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

    
            const JobcardData = {
                name: values.name,
            };
    
            const docRef = await addDoc(collection(fbDb, 'jobcard'), JobcardData);
            console.log('Jobcard added with ID: ', docRef.id);
    
            setOpen(false);
        } catch (error) {
            console.error('Error adding jobcard:', error);
        } 
    } 


    


    return (
        <>
            <div className=''>
                {/* <div className=''>
                    <div className='flex flex row w-full  fixed top-12'>  
                    <div className=''>
                    <AddButton name="Add JOB CARD" handleAddClick={handleAddClick}/>
                    </div>
                    <div className=' ml-10'>
                    <AddButton name="Add Vehicle" handleAddClick={handleAddClick}/>
                    </div>
                    </div>

                </div> */} 
                <div className="flex flex-row fixed top-12 right-10">  
                <div>  
                {/* <AddButton name="JOB CARD" handleAddClick={handleAddClick}/> */} 
                <Button
                className='rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4 mr-2 mt-2'
                handleClick={handleAddClick}>
               <PlusIcon className='h-6 w-6 mr-2' />
                ADD JOB CARD
              </Button>
                </div>  
                <div className="ml-2"> 
                {/* <AddButton name="Add Vehicle" handleAddClick={handleAddClick}/> */} 
                <Button
                className='rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4  mr-2 mt-2'
                handleClick={handleAddClick}>
               <PlusIcon className='h-6 w-6 mr-2' />
                 Schedule Maintenance
              </Button>

                </div>



                </div>
                <div className='mt-4'> 
                <Tab.Group>
                <Tab.List className='w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3'> 
                                {tabs.map((tab, index) => {
                                     return (
                                        <Fragment key={index}>
                                            <Tab className='ui-selected:border-b-4 border-d-green outline-none
                                             ui-selected:text-d-green text-sm font-nunito font-bold uppercase flex flex-row ml-10' 
                                             onClick={() => handleTabClick(index)}
                                             >
                                                {tab.name}
                                            </Tab>
                                        </Fragment>
                                    )
                                })}

                            </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <MaintananceTable selectedTab={selectedTab} maintananceList={fetchedMaintanance}  />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <MaintananceTable selectedTab={selectedTab} maintananceList={fetchedMaintanance}  />

                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <Jobcard />
                            </div>
                        </Tab.Panel>
       
                

                    </Tab.Panels>
                </Tab.Group> 
                </div> 
                <div>
                </div>
            
            </div>

            <FormModal open={open} setOpen={setOpen}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            Manage Vehicle
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Formik
                    initialValues={{
                        name: "",
            
                                      }}
                        onSubmit={(values) => handleAddJobcard(values)}  
  
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
            </>
        
    )
}  



interface VehiclesTableProps {
    selectedTab: number;  
    maintananceList:DocumentData
}

export function MaintananceTable({ selectedTab,maintananceList }: VehiclesTableProps) {
        console.log("MaintananceTable Rendering with selectedTab:", selectedTab); 
        console.log("Mainanace list", maintananceList);
        
        const currentDate = new Date();

        const filteredMaintenance = maintananceList.filter((maintenance: any) => {
            const maintenanceDate = new Date(maintenance.date.seconds * 1000);
    
            if (selectedTab === 0) {
                // Show items with dates that are yet to reach (future dates)
                return maintenanceDate > currentDate;
            } else if (selectedTab === 1) {
                // Show items with dates that have already passed (past dates)
                return maintenanceDate < currentDate;
            }
    
            return true;
        });
        
    

    console.log("Filtered Vehicles:", filteredMaintenance); 
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr> 
                                    <th 
                                      scope="col"
                                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0" 
                                    > 
                                       Truck  

                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0"
                                    >
                                        VEHICLE
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                        DATE
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                        JOB CARDS
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                         REQUESTED BY
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                        COST
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    > 
                                    

                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                                    >
                                        ACTION 
                                    </th>
                                    <th scope="col" className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only"></span>
                                    </th>
                                </tr>
                            </thead>
 
                            <tbody  className="divide-y divide-gray-200 bg-white">
                            {filteredMaintenance.map((maintenance:any, index:any) => {  
                                 const { seconds } = maintenance.date; 
                                 const updatedDate = new Date(seconds * 1000);

                                return( 
                                    
                                    <tr  className='my-4'>
                                      <td>  
                                      <span className="fa-stack fa-lg">
                                      <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
                                      <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
                                      </span>

                                       </td>
                    
                                        <td className="whitespace-nowrap pl-4 pr-3 !pt-4 text-d-blue sm:pl-0">{maintenance.vehicle}</td>
                                        <td className="whitespace-nowrap px-2  pt-4 font-medium ">
                                        {format(updatedDate, 'MM/dd/yy')}
                                        </td>
                               
                                        <td className="whitespace-nowrap px-2 pt-4">{maintenance.job_cards}</td>
                                        <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">{maintenance.requested_by}</td>
                                        <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">{maintenance.cost}</td>
                                        <td className="whitespace-nowrap px-2 pt-4 text-sm text-[#777E96]">
                                        Details <i className="fa-solid fa-angle-down"></i>
                                         </td>

                                        <td className="whitespace-nowrap pl-8 pt-4 ">  
                                        :
                                        {/* <i className="fa-light fa-ellipsis-vertical"></i>                                            */}
                                         </td>

                           
                                    </tr>
                            )
                        })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}



