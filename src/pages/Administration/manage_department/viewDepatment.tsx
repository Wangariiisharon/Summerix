import { doc, getDoc } from 'firebase/firestore';
import React, { Fragment, useEffect, useState } from 'react'; 
import { fbDb } from '@/firebase/configs';
import { useRouter } from 'next/router';


interface DepatmentDetailsProps {
    departmentId: string;
    department: {
        name: string,
        members: number,
        permissions: number,
    };
  } 
  

export default function ViewDepatment() {  
    const [departments, setdepartments] = useState<DepatmentDetailsProps['department'] | null>(null);
    const router=useRouter()
    const { id } = router.query;

    useEffect(()=>{ 
        const fetchDepartmentDetails = async () => {
            if (id) {
              try { 
                
                const depatmentDocRef = doc(fbDb, 'admins', id as string);
                const depatmentDocSnap = await getDoc(depatmentDocRef);
    
                if (depatmentDocSnap.exists()) {
                  const depatmentData = depatmentDocSnap.data() as DepatmentDetailsProps['department'];
                  setdepartments(depatmentData);
                } else {
                  console.log('Department not found');
                }
              } catch (error) {
                console.error('Error fetching Department:', error);
              }
            }
          }; 

        fetchDepartmentDetails()

    },[id])  

  return ( 
    <>
    <div>viewDepatment</div> 
    <div>{departments?.name}</div>  
    </>
    
  )
}
