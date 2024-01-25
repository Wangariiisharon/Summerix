import Image from "next/image";


interface Props {
  children: any;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex flex-row w-full h-full min-h-screen">
      <div className="hidden w-2/5 bg-primary  md:block">
        <div className="flex h-screen w-full">
             <Image
          src="/truckMate.png"
          alt="Truck It"
          width={600}
          height={600} 
          priority={true} 
          /> 
       
        </div>
      </div>
      <div className="w-full m-auto max-w-sm md:mx-40">
        <header className="ml-6 m-auto gap-2">
          <Image
            src="/Group 1000002033.png"
            alt="company logo image"
            width={120}
            height={32}
          />
        </header> 

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
