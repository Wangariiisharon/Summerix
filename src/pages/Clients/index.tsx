import { Header } from "@/components/Headers";
import { Button } from "@/components/Buttons";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Input } from "@/components/Forms/input";
import { SmallCard } from "@/components/Cards/SmallCard";
import { Fragment, useEffect, useState } from "react";
import SiteLayout from "@/Layout/SiteLayout";
import { FormModal } from "@/components/Modals/FormModal";
import { Formik, Field, Form } from "formik";
import { fbDb } from "@/firebase/configs";
import {
  AuthProvider,
  useAuthContext,
} from "@/components/Authentication/AuthProvider";

import {
  DocumentData,
  addDoc,
  collection,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";

const cards = [
  {
    amount: "409.66K",
    href: "#",
    icon: "/icons/lightCashIcon.png",
    name: "Paid by Clients",
  },
  {
    amount: "136.98K",
    href: "#",
    icon: "/icons/lightCashIcon.png",
    name: "Total Expenses",
  },
  {
    amount: "1000",
    href: "#",
    icon: "/icons/lightCashIcon.png",
    name: "Loads",
  },
  {
    amount: "136.98K",
    href: "#",
    icon: "/icons/lightCashIcon.png",
    name: "Profit",
  },
];

export default function ClientsComponent() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedClients, setfetchedClients] = useState<DocumentData[]>([]);

  const { organisationId } = useAuthContext();

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    console.log("Search Query:", query);
    setSearchQuery(query);
  };

  const filteredClients = fetchedClients.filter((client) => {
    const fullName = `${client.name}`.toLowerCase();
    const nameMatch = fullName.includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const handleClick = () => {};
  const handleSearch = () => {};
  const handleExport = () => {};
  const handleJobCardReset = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchedClients = async () => {
      const db = getFirestore();

      try {
        // Ensure organisationId is available before making the query
        if (organisationId) {
          const q = query(
            collection(db, "clients"),
            where("organisationId", "==", organisationId)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const clientsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setfetchedClients(clientsData);
          });

          return () => unsubscribe();
        } else {
          console.error("Organisation ID is not available.");
        }
      } catch (error) {
        console.error("Error fetching Clients:", error);
      }
    };
    fetchedClients();
  }, [organisationId]);

  const handleAddClient = async (values: { name: any }) => {
    setOpen(true);
    console.log("Submitted Values:", values);

    try {
      if (!values) {
        console.error("Form values are undefined");
        return;
      }

      if (!values.name) {
        console.error("Required form fields are missing");
        return;
      }

      const clientsData = {
        name: values.name,
      };

      const docRef = await addDoc(collection(fbDb, "clients"), clientsData);
      console.log("Client added with ID: ", docRef.id);
      toast.success("Client Successfully Added.");

      setOpen(false);
    } catch (error) {
      console.error("Error adding Client:", error);
    }
  };

  return (
    <SiteLayout>
      <div>
        {/* <div className='flex items-center justify-between'>
                <p className="text-lg font-nunito font-bold mt-2 ml-5">Clients</p>
                    <div className='flex mt-2'>
                        <Button className='bg-white w-25 h-30 px-3 text-sm uppercase flex items-center rounded font-semibold'
                                handleClick={handleClick}>
                            Nairobi,Kenya
                            <ChevronDownIcon className='ml-4 h-3 w-3'/>
                        </Button>

                        <Button className='ml-2 bg-white px-3 py-3 text-sm w-30 h-38 uppercase flex items-center rounded font-semibold'
                                handleClick={handleClick}>
                            Today
                            <ChevronDownIcon className='ml-4 h-4 w-4'/>
                        </Button>
                    </div>
                </div>

                <div className='flex w-full items-center justify-between my-6'> 
                <div className="ml-5">
                <SearchBar
                  placeholder='Search For Clients'
                  value={searchQuery}
                  onChange={handleSearchChange} 
                  className=''
                /> 
                </div>
                         <div className='flex'>
                        <Button className='bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded'
                                handleClick={handleAddClient}>
                            <>
                                <ArrowDownTrayIcon className='h-6 w-6 mr-2'/>
                                Export

                            </>
                        </Button>

                        <Button className='ml-4 bg-d-green text-white text-sm flex w-[140px] h-[38px] items-center justify-center uppercase rounded'
                                handleClick={handleAddClient}>
                            <>
                                <PlusIcon className='h-6 w-6 mr-2'/>
                                Add Client
                            </>
                        </Button> 
                    </div>
                </div>

                <div className='flex w-full justify-around '>
                    {cards.map((card, index) => {
                        return (
                            <Fragment key={index}>
                                <SmallCard name={card.name} icon={'/icons/lightCashIcon.png'} amount={card.amount}/>
                            </Fragment>
                        )
                    })}
                </div>
                <ClientsTable clients={fetchedClients} filteredClients={filteredClients}/> 

                <FormModal open={open} setOpen={setOpen}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '> 
                        ADD NEW CLIENT
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleJobCardReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Formik
                    initialValues={{
                        name: "",
            
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
                             </div>
        
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='text-blue text-xl mr-32' handleClick={handleJobCardReset}>Reset</Button>
                                <button type='submit' >Save</button>
                            </div>

                        </div>
                    </Form>
                     )}
                    </Formik>
                </div>
            </FormModal>  */}
      </div>
    </SiteLayout>
  );
}

interface ClientsTableProps {
  clients: DocumentData[];
  filteredClients: DocumentData[];
}

export function ClientsTable({ clients, filteredClients }: ClientsTableProps) {
  // const [searchQuery, setSearchQuery] = useState("");
  // const handleSearchChange = (e:any) => {
  //     const query = e.target.value;
  //     console.log("Search Query:", query);
  //     setSearchQuery(query);
  //   }

  return (
    <div></div>
    // <div className="px-4 sm:px-6 lg:px-8">
    //     <div className="mt-8 flow-root">
    //         <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
    //             <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
    //                 <table className="min-w-full divide-y divide-gray-300">
    //                     <thead>
    //                     <tr>
    //                         <th
    //                             scope="col"
    //                             className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left  font-semibold  sm:pl-0"
    //                         >
    //                             Client ID
    //                         </th>
    //                         <th
    //                             scope="col"
    //                             className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
    //                         >
    //                             Name
    //                         </th>
    //                         <th
    //                             scope="col"
    //                             className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
    //                         >
    //                             Expenses
    //                         </th>
    //                         <th
    //                             scope="col"
    //                             className="whitespace-nowrap px-2 py-3.5 text-left  font-semibold "
    //                         >
    //                             Profit
    //                         </th>

    //                     </tr>
    //                     </thead>
    //                     <tbody  className="divide-y divide-gray-200  bg-[#FAFAFB]">
    //                     {filteredClients.map((client,index) => {
    //                              return(
    //                                 <Fragment key={index}>
    //                             <div className="w-full mb-2 font-nunito font-regular"></div>

    //                         <tr key={client.id}  className='my-2 border-solid border-2 border-[#D9E2F6] bg-[#FAFAFB] mt-2 h-10 font-nunito font-regular'>
    //                             <td className="whitespace-nowrap pl-4 pr-3 py-4 text-d-blue sm:pl-0">{client.id}</td>
    //                             <td className="whitespace-nowrap px-2 py-2  font-medium ">
    //                                 {client.name}
    //                             </td>
    //                             <td className="whitespace-nowrap px-2 py-2  ">Ksh.250000</td>
    //                             <td className="whitespace-nowrap px-2 py-2  ">Ksh.250000</td>

    //                         </tr>
    //                         </Fragment>

    //                     )
    //                         })}
    //                     </tbody>
    //                 </table>
    //             </div>
    //         </div>
    //     </div>
    // </div>
  );
}
