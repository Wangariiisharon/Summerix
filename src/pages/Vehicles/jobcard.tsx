import { fbDb } from '@/firebase/configs';
import { DocumentData, collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react' 
import { parseISO, format } from 'date-fns';


export default function Jobcard() {
  const [fetchedJobcards, setfetchedJobcards]=useState<DocumentData[]>([]);   
  useEffect(() => {
    const fetchedJobcards = async () => {
        try {
            const querySnapshot = await getDocs(collection(fbDb, 'jobcard'));
            const jobcardData: DocumentData[] = []; 
            console.log(jobcardData);
            
            querySnapshot.forEach((doc) => {
                const jobcard = {
                    id: doc.id,
                    ...doc.data()
                };
                jobcardData.push(jobcard);
            });
            setfetchedJobcards(jobcardData);
        } catch (error) {
            console.error('Error fetching Jobcards:', error);
        }
    };

    fetchedJobcards();
}, []);

  return (
    // <div>planned</div> 
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
                                NAME
                            </th>
                            <th
                                scope="col"
                                className="whitespace-nowrap px-2 py-3.5 text-left font-semibold"
                            >
                                STATUS
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
                    {fetchedJobcards.map((jobcard:any, index:any) => {  

                        return( 
                            
                            <tr  className='my-4'>
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
