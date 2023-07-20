import Image from "next/image";

interface Props {
  children: any;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex flex-row w-full h-full min-h-screen">
      <div className="hidden w-full bg-primary md:block">
        <div className="flex h-screen w-full">
          <div className="container m-auto px-20 text-white">
            <p className="font-extrabold text-4xl">Truck it</p>
            <p className="mt-5 text-sm">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Itaque
              beatae veniam illum quae, tenetur minima, ut dicta fugiat amet
              dignissimos deserunt similique accusamus esse nesciunt nemo
              accusantium repellendus deleniti id!
            </p>
          </div>
        </div>
      </div>
      <div className="w-full p-2 m-auto max-w-sm md:mx-10">
        <header className="m-auto flex items-center justify-center gap-2">
          <Image
            src="/vercel.svg"
            alt="company logo image"
            width={150}
            height={32}
          />
        </header>

        {children}

        <footer className="mt-10 grid gap-2 text-gray-400 text-xs">
          <div className="text-center">
            &copy; {new Date().getFullYear()} Truck It.
          </div>
        </footer>
      </div>
    </div>
  );
}
