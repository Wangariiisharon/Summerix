import Link from 'next/link';
import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'; 

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hamburger-menu relative ">
      <div className="menu-icon text-2xl cursor-pointer" onClick={handleToggle}>
        {isOpen ? <RiCloseLine /> : <RiMenu3Line />}
      </div>
      {isOpen && (
        <ul className="flex flex-col menu absolute top-12 bg-white shadow-md p-2">       
          <li className="mb-2 cursor-pointer"><Link href="../../Dashboard">
        <i className="fa-solid fa-table-cells-large  "></i>
             </Link></li>
        <li>
            <Link className="mb-2 cursor-pointer" href="../../Administration">
            <i className="fa-solid fa-square-poll-vertical "></i>
                </Link></li> 

            <li>
            <Link className="mb-2  cursor-pointer" href="../../Vehicles">
            <i className="fa fa-truck mr-2" aria-hidden="true"></i>                
            </Link></li> 
                <li>
            <Link className="mb-2 cursor-pointer" href="../../Trips">
            <i className="fa-solid fa-square-poll-vertical "></i>
                </Link></li> 
                <li>
            <Link className="mb-2 cursor-pointer" href="../../Clients">
            <i className="fa fa-user" aria-hidden="true"></i>
            </Link></li>  
        </ul>
      )}
    </div>
  );
};

export default HamburgerMenu; 



