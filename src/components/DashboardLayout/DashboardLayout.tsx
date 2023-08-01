import Link from "next/link";
import Header from "../header";
import Image from "next/image";
import HamburgerMenu from "../hamburgerMenu"

interface Props {
  children: any;
}

export default function DashLayout({ children }: Props) {
  return (
    <div className="flex flex-row w-full h-full min-h-screen"> 
      <div className="hidden w-1/6 bg-blue-600  md:block">
        <Header />
      </div>
      <div  className="absolute top-0 left-20  pt-5 md:mx-40">
        {children}
      </div>
    </div>
  );
}
