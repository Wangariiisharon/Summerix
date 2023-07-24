import Image from "next/image";

interface Props {
  children: any;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex flex-row w-full h-full min-h-screen">
      <div className="hidden w-2/5 bg-primary  md:block">
        <div className="flex h-screen w-full">
          {/* <div className="container m-auto"> */}
            {/* <p className="font-extrabold text-4xl">Truck it</p>
            <p className="mt-5 text-sm">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque
              beatae veniam illum quae, tenetur minima, ut dicta fugiat amet
              dignissimos deserunt similique accusamus esse nesciunt nemo
              accusantium repellendus deleniti id!
            </p> */}
            <Image
          src="/truckit.png"
          alt="Truck It"
          width={600}
          height={600} 
          priority={true} 
          />
          {/* </div> */}
        </div>
      </div>
      <div className="w-full p-2 m-auto max-w-sm md:mx-40">
        <header className="ml-3 m-auto gap-2">
          <Image
            src="/logo.png"
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
