import { DocumentData, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { Fragment, useEffect, useState } from 'react'; 
import { fbDb } from '@/firebase/configs';
import { useRouter } from 'next/router'; 
import SiteLayout from "@/Layout/SiteLayout"; 
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/Buttons';
import { BodyCell } from '@/components/Table/Cells'; 
import { formatDistanceToNow } from 'date-fns';




interface DepatmentDetailsProps {
    departmentId: string;
    department: {
        name: string,
        members: number,
        permissions: number, 
        update:Date
    };
  }   
  
  

export default function ViewDepatment() {   
  
    const [departments, setdepartments] = useState<DepatmentDetailsProps['department'] | null>(null); 
    const [fetchedDepartments, setFetchedDepartments] = useState<DocumentData[]>([]);
    const [fetchedPermisions, setFetchedPermisions] = useState<DocumentData[]>([]);
    const router=useRouter()
    const { id } = router.query; 
     function handleAddPermissions(){

     } 
     

    useEffect(()=>{ 
        const fetchDepartmentDetails = async () => {
            if (id) {
              try { 
                
                const depatmentDocRef = doc(fbDb, 'departments', id as string);
                const depatmentDocSnap = await getDoc(depatmentDocRef);
    
                if (depatmentDocSnap.exists()) {
                  const depatmentData = depatmentDocSnap.data() as DepatmentDetailsProps['department']; 
                  console.log(depatmentData);
                  
                  setdepartments(depatmentData);
                } else {
                  console.log('Department not found');
                }
              } catch (error) {
                console.error('Error fetching Department:', error);
              }
            }
          }; 
          

          const fetchPermissions = async () => { 
            try {
              const querySnapshot = await getDocs(collection(fbDb, "permisions"));            
              const permissionsData: DocumentData[] = []; 
              console.log(permissionsData);
    
              querySnapshot.forEach((doc) => {
                const permission = {
                  id: doc.id,
                  ...doc.data(),
                };
                permissionsData.push(permission);
              });
              setFetchedPermisions(permissionsData);
            } catch (error) {
              console.error("Error fetching permissions:", error); 
            }
          };

        fetchDepartmentDetails() 
        fetchPermissions();

    },[id])  
    console.log('Department Update Date:', departments?.update);
 

  return ( 
    <>
    {/* <div>viewDepatment</div> 
    <div>{departments?.name}</div>    */}

    
 <SiteLayout> 
 <div  className='bg-[#FAFAFB] h-full text-[#030229]'> 
 <p className="text-lg font-nunito flex justify-center font-bold mt-2  ml-7">{`View Depatment:${departments?.name}`}</p>  
 <div className='flex flex-col'>
 <div className='rounded-md  flex justify-center shadow-md bg-[#FFFFFF] ml-5 mt-5 ' >
 <div className='bg-[#FFFFFF] flex flex-row py-5'>  
 <div className='flex flex-col mt-5 '> 
 {/* <img className=' w-20 h-20 rounded-full border border-gray-600' src="user.png"/> */}  
 <div className='text-gray-600'>
 <i className="fa fa-user-circle fa-3x" aria-hidden="true"></i>  
 </div>


 <p className='font-nunito font-regular text-sm text-[#030229] font-nunito font-bold'>{`${departments?.name}`}</p> 
 <p className='font-nunito font-regular text-sm text-[#030229]'>{departments?.name}</p> 
 <p className='font-nunito font-regular text-sm text-[#030229]'>{departments?.name}</p> 
 </div> 
 <div className='w-full ml-10 flex flex-col'>  
 <div className=' mt-5 px-10 flex flex-row mb-5'>  
<div>
<p className='font-nunito font-regular text-sm font-nunito font-regular'>GROUP NAME</p>
<p className='font-nunito font-regular text-sm text-[#030229] font-nunito font-bold'>{departments?.name}</p> 
</div>  
<div className='ml-14'>
<p className='font-nunito font-regular text-sm font-nunito font-regular'>CREATED AT</p>
<p className='font-nunito font-regular text-sm text-[#030229] font-nunito font-bold'>
{departments?.update
    ? formatDistanceToNow(departments.update instanceof Date ? departments.update : new Date(departments.update), { addSuffix: true })
    : 'N/A'}

</p>
</div>

</div> 
<div className=' mt-5  px-10 flex flex-row mb-5'>  

<div>
<p className='font-nunito font-regular text-sm font-nunito font-regular'>Distance Covered</p>
<p className='font-nunito font-regular text-sm text-[#030229] font-nunito font-bold'>501.4mi</p> 
</div>  
<div className='ml-10'>
<p className='font-nunito font-regular text-sm font-nunito font-regular'>Distance Covered</p>
<p className='font-nunito font-regular text-sm text-[#030229] font-nunito font-bold'>10h 5min</p>
</div>

</div> 
</div> 

</div> 
</div>   
<div className='flex'>
 {/* <div className='mt-10 ml-5 w-1/3'>  */}
{/* <div className="mt-10 ml-5 w-1/3">

<div className='shadow-md bg-[#FFFFFF] rounded-md '>
<div className='flex flex-row divide-y divide-solid flex space-x-20'>
<p className='text-base font-nunito font-bold ml-2 mr-20 mt-2'>Department</p>
<Button
  className='rounded bg-d-green w-[80px] h-6 uppercase text-white font-semibold flex items-center py-4 px-4 ml-20 mr-2 mt-2'
  handleClick={handleAddDepartment}>
  <PlusIcon className='h-10 w-10 mr-2' />
  Add
</Button>
</div>
<div className='bg-[#FAFAFB] mt-1 mr-2 ml-2 mb-2 '>
<DepartmentsTable departments={fetchedDepartments} updateFetchedDepartments={(updatedDepartments) => setFetchedDepartments(updatedDepartments)} />
</div>
</div>
</div>   */}
{/* <div className='mt-10 w-1/3 fixed right-10'> */} 
<div className="mt-10 w-1/3 fixed right-10">
<div className='shadow-md bg-[#FFFFFF] rounded-md'>
<div className='flex flex-row divide-y divide-solid mt-4'>
<p className='text-base font-nunito font-bold ml-2 mr-20 mt-2'>Permisions</p>
<Button
  className='rounded bg-d-green w-[80px] h-6 uppercase text-white font-semibold flex items-center py-4 px-4 ml-20 mr-2 mt-2'
  handleClick={handleAddPermissions}>
  <PlusIcon className='h-10 w-10 mr-2' />
  Add
</Button>
</div>
<div className='bg-[#FAFAFB] mt-1 mr-2 ml-2 mb-2 '>
<PermissionsTable permissions={fetchedPermisions} />
</div>
</div>
</div> 

</div>






</div> 
</div>

</SiteLayout> 






    </>
    
  )
}   


interface DepartmentsTableProps {
  departments: DocumentData[];
  updateFetchedDepartments: (updatedDepartments: DocumentData[]) => void;
}

export function DepartmentsTable({ departments, updateFetchedDepartments }: DepartmentsTableProps) {
  return (
    <table className=" mr-2">

      <tbody>
        {departments.map((department, index) => {
          return (
            <tr key={index} className='h-10'>
              <td className='ml-2'>{department.name} 
               </td> 
              <div className='ml-20'>
              <BodyCell>
              <XMarkIcon className='h-6 w-6 text-crimson-red'/>
              </BodyCell> 
              </div>

              <td>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}




interface PermissionsTableProps {
  permissions: DocumentData[];
}

export function PermissionsTable({ permissions }: PermissionsTableProps) {
  return (

    <table className="mr-2">

      <tbody>
        {permissions.map((permission, index) => {
          return (
            <tr key={index} className='h-10'>
              <td className='ml-2'>{permission.name} 
               </td> 
            </tr>
          );
        })}
      </tbody>
    </table>
  
  );
}






