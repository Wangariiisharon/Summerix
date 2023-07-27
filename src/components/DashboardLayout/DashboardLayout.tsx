import Link from "next/link";
import Header from "../header";
import HamburgerMenu from "../hamburgerMenu"

interface Props {
  children: any;
}

export default function DashLayout({ children }: Props) {
  return (
    <div className="flex flex-row w-full h-full min-h-screen">
      <div className="hidden w-1/5 bg-blue-600  md:block">
        <Header />
      </div>
      <div className="w-4/5 m-auto md:mx-40">
        <div className="fixed top-5 flex flex-row items-center"> 
        <HamburgerMenu/>  
        <i className="fa fa-bell ml-40 fixed right-20 " aria-hidden="true"></i>
            </div> 
        {children}
        <footer className="mt-10 grid gap-2 text-gray-400 text-xs">
          <div className="text-center">
            &copy; {new Date().getFullYear()}  
          </div>
        </footer>
      </div>
    </div>
  );
}