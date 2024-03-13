import { fbDb } from '@/firebase/configs';
import { DocumentData, addDoc, collection, getDocs, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import React, { Fragment, useEffect, useState } from 'react' 
import { parseISO, format } from 'date-fns';
import {AddButton, Button, DeleteBtn, EditBtn} from "@/components/Buttons"; 
import {PlusIcon, XMarkIcon} from "@heroicons/react/24/outline"; 
import {FormModal} from "@/components/Modals/FormModal"; 
import { Formik, Field, Form } from 'formik/dist/index';
import { toast } from 'react-hot-toast';
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";



export default function Jobcard() { 
    const [open, setOpen] = useState(false)
    const [jobcards, setjobcards] = useState<string[]>([]); 
    const [showAddJobcardModal, setShowAddJobcardModal] = useState(false);
    const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
  const [fetchedJobcards, setfetchedJobcards]=useState<DocumentData[]>([]);   
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;   

  const {organisationId} = useAuthContext(); 
  console.log("Jobcards Organisation ID:", organisationId);
    
      useEffect(() => {
        const fetchedJobcards = async () => { 
        const db = getFirestore();

      try {
      if (organisationId) {
      const q = query(collection(db, 'jobcard'), where('organisationId', '==', organisationId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobcardData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
     }));
     setfetchedJobcards(jobcardData);
     });

     return () => unsubscribe(); 

    } else {
    console.error('Organisation ID is not available.');
    }  
   } catch (error) {
   console.error('Error fetching Jobcards:', error);
     }
     };
    fetchedJobcards(); 

}, [organisationId]);  


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
      const existingDepartmentQuery = query(collection(fbDb, 'jobcard'), 
      where('name', '==', values.name),
      where('organisationId', '==', organisationId)
    );

    const existingDepartmentSnapshot = await getDocs(existingDepartmentQuery);

    if (!existingDepartmentSnapshot.empty) {
      console.error('Jobcard with this name already exists in the same organisation'); 
      toast.error(`A Jobcard with the  name  '${values.name}' already exists`);
      return;
    } 
  
      const JobcardData = {
        name: values.name,
        status: true, 
        organisationId: organisationId,
      };
  
      const docRef = await addDoc(jobcardCollection, JobcardData);
      console.log("Jobcard added with ID: ", docRef.id);
      toast.success("Jobcard Successfully Added.");
  
      setOpen(false);
      setShowAddJobcardModal(false);
    } catch (error) {
      console.error("Error adding jobcard:", error);
    }
  }; 

  const visibleJobCards = fetchedJobcards.slice(startIndex, endIndex); 

  

  return (
    // <div>planned</div> 
    <div className="mt-2 h-full">  
    <div className=" flex justify-end">
        <Button
    className='rounded bg-d-green min-w-[160px] h-6 uppercase text-white text-sm font-semibold flex items-center py-4 px-4  mt-2'
    handleClick={handleAddJobcard}>
    <PlusIcon className='h-6 w-6 mr-2' />
    ADD JOB CARD
    </Button> 
    </div>
    <div className="mt-2 ml-2 flow-root"> 
     <div className="px-4 sm:px-6 lg:px-8">
          <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr> 
                            <th 
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"                            > 
                               Truck  

                            </th>
                            <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"                            >
                                NAME
                            </th>
                        
                            <th scope="col" 
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"                            >
                            <span className="sr-only"></span>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-[#FAFAFB]">
                    {visibleJobCards.map((jobcard:any, index:any) => {  
                        return( 
                          <Fragment key={index}>

                            <tr key={jobcard.id}   className='my-4 bg-[#FAFAFB]'>
                              <td className="whitespace-nowrap font-nunito font-regular pr-3 pt-1 pl-4 pr-3  text-d-blue text-base sm:pl-0">  
                              <span className="fa-stack fa-lg">
                              <i className="fa fa-circle fa-stack-2x text-[#F2F2F2]" aria-hidden="true"></i>
                              <i className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]" aria-hidden="true"></i> 
                              </span>
                               </td> 
                               <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                {jobcard.name}
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
      disabled={endIndex >= fetchedJobcards.length}
       >
      Next
    </button>
    </div>
</div>
  )
}
