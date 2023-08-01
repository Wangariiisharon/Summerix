import Image from "next/image";
import Link from "next/link";
import HamburgerMenu from "./hamburgerMenu"


export default function Header() {
  return ( 
     <div>
      <header className=" flex flex-row mt-5 mb-12 m-auto gap-2">
      <Image
      className="ml-8"
        src="/DashboardLogo.png"
        alt="company logo image"
        width={120}
        height={32} 
      /> 
      <div className="ml-20"><HamburgerMenu/></div> 

      <i className="fa fa-bell fixed right-20 " aria-hidden="true"></i>
    </header> 
 
    <div>
    <ul>
        <li className="text-white hover:text-cyan-200 leading-10 hover:bg-cyan-500 my-5"><Link href="../../Dashboard">
        <i className="fa-solid fa-table-cells-large ml-8 mr-2"></i>
             Dashboard</Link></li>   
        <li className="text-white hover:text-cyan-200 leading-10 hover:bg-cyan-500 my-5"><Link href="../../Administration">
            <i className="fa-solid fa-square-poll-vertical ml-8 mr-2"></i>
             Administration</Link></li>
        <li className="text-white hover:text-cyan-200 leading-10 hover:bg-cyan-500 my-5"><Link href="../../Vehicles">
            <i className="fa-solid fa-square-poll-vertical ml-8 mr-2"></i>
            Vehicles</Link></li> 
          <li className="text-white hover:text-cyan-200 leading-10 hover:bg-cyan-500 my-5"><Link href="../../Trips">
            <i className="fa-solid fa-square-poll-vertical ml-8 mr-2"></i>
            Trips</Link></li>   
          <li className="text-white hover:text-cyan-200 leading-10 hover:bg-cyan-500 my-5"><Link href="../../Clients">
            <i className="fa-solid fa-square-poll-vertical ml-8 mr-2"></i>
            Clients</Link></li> 
        </ul>
        </div>    
    </div>
  );
}

