import Link from 'next/link';
import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'; 




interface ViewMenuProps {
    departmentId: string; 
  }
  
  export default function ViewMenu({ departmentId }: ViewMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    console.log();
    
  
    const handleToggle = () => {
      setIsOpen(!isOpen);
    };

  return (
    <div className="fixed absolute left-2 top-0 mt-1 relative ">
      <div className="menu-icon cursor-pointer" onClick={handleToggle}>
        {isOpen ? <RiCloseLine /> : <RiMenu3Line />}   
      </div>
      {isOpen && (
        <ul className="flex flex-col menu absolute bg-white shadow-md p-2">       
          <li className=" cursor-pointer text-[#000000]"><Link href={`/Administration/manage_departments/viewDepartment?id=${departmentId}`}> 
          View             
          </Link></li>
        <li>
            <Link className=" cursor-pointer text-[#000000]" href="./rename">
             Rename               
             </Link></li> 
             {/* router.push(`/Administration/manage_drivers/driversDetails?id=${driver.id}`); */}

            <li>
            <Link className="  cursor-pointer text-[#000000]" href="./Deactivate">
            Deactivate            
            </Link></li> 
          
        </ul>
      )}
    </div>
  );
}; 

    




