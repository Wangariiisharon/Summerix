import { fbDb } from '@/firebase/configs';
import { DocumentData, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react' 
import { parseISO, format } from 'date-fns';
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons"; 
import {PlusIcon, XMarkIcon} from "@heroicons/react/24/outline"; 
import {FormModal} from "@/components/Modals/FormModal"; 
import { Formik, Field, Form } from 'formik/dist/index';
import { toast } from 'react-hot-toast';



export default function Jobcard() { 
    const [open, setOpen] = useState(false)
    const [jobcards, setjobcards] = useState<string[]>([]); 

    const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
  const [fetchedJobcards, setfetchedJobcards]=useState<DocumentData[]>([]);   
  useEffect(() => {
  
    const fetchedJobcards = async () => {
        try {
            const querySnapshot = await getDocs(collection(fbDb, 'jobcard'));
            const jobcardData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setfetchedJobcards(jobcardData);
        } catch (error) {
            console.error('Error fetching Jobcards:', error);
        }
    };
    

    fetchedJobcards();
}, []);  
const handleJobCardReset = () => {
    setShowAddJobcardModal(false) 
    setOpen(false)
}
const handleAddJobcard = async (values: { name: any }) => {
    setShowAddJobcardModal(true);
    setShowScheduleMaintenanceModal(false);
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
  
      const jobcardCollection = collection(fbDb, "jobcard");
  
      // Check if a Jobcard with the same name already exists
      const querySnapshot = await getDocs(
        query(jobcardCollection, where("name", "==", values.name))
      );
  
      if (!querySnapshot.empty) {
        console.error("A Jobcard with this name already exists"); 
        toast.error(`A Jobcard with the name '${values.name}' already exists`);

        return;
      }
  
      const JobcardData = {
        name: values.name,
        status: true,
      };
  
      const docRef = await addDoc(jobcardCollection, JobcardData);
      console.log("Jobcard added with ID: ", docRef.id);
  
      setOpen(false);
    } catch (error) {
      console.error("Error adding jobcard:", error);
    }
  };
  

  return (
    // <div>planned</div> 
    <div className="px-4 sm:px-6 lg:px-8">  
    <div className=" flex justify-end">
        <Button
    className='rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4  mt-2'
    handleClick={handleAddJobcard}>
    <PlusIcon className='h-6 w-6 mr-2' />
    ADD JOB CARD
    </Button> 
    </div>
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
                                NAME
                            </th>
                            <th
                                scope="col"
                                className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                            >
                                STATUS
                            </th>
             
                            {/* <th
                                scope="col"
                                className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                            >
                                ACTION 
                            </th> */}
                            <th scope="col" className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                                <span className="sr-only"></span>
                            </th>
                        </tr>
                    </thead>

                    <tbody  className="divide-y divide-gray-200 bg-white">
                    {fetchedJobcards.map((jobcard:any, index:any) => {  

                        return( 
                            
                            <tr key={jobcard.id}   className='my-4 bg-[#FAFAFB]'>
                              <td>  
                              <span className="fa-stack fa-lg">
                              <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
                              <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
                              </span>

                               </td>
            
                                <td className="whitespace-nowrap pl-4 pr-3 !pt-4 text-d-blue sm:pl-0">{jobcard.name}</td>
                                <td className="whitespace-nowrap px-2  pt-4 font-medium ">
                                {jobcard.status ? 'Approved' : 'Denied'}
                                </td> 
                                {/* <BodyCell>{admin.status ? 'Active' : 'Inactive'}</BodyCell>  */}

                       
                                {/* <td className="whitespace-nowrap pl-8 pt-4 ">  
                                :
                                 </td> */}

                            </tr>
                    )
                })}
                    </tbody>
                </table>
            </div>
        </div>
    </div> 
    <FormModal open={showAddJobcardModal} setOpen={setShowAddJobcardModal}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '> 
                        ADD JOBCARD
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleJobCardReset}>
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
                                <Button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center py-4 px-4 mr-32' handleClick={handleJobCardReset}>Reset</Button>
                                {/* <Submit name="save" handleSubmit={handleSubmit}/> */}
                                <button className='rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center py-4 px-4' type='submit' >Save</button>
                            </div>

                        </div>
                    </Form>
                     )}
                    </Formik>
                </div>
            </FormModal> 
</div>
  )
}
