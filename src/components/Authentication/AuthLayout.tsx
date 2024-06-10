import Image from "next/image";

interface Props {
  children: any;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex flex-row w-full h-full min-h-screen">
      <div className="w-3/5 hidden lg:block">
        <div className="flex h-screen w-full">
          <Image
            src="/login-bg.png"
            alt="login background image"
            className="h-full w-full"
            priority={true}
            width={2000}
            height={1000}
          />
        </div>
      </div>
      <div className="w-2/5 m-auto max-w-sm grid">
        <div className="mt-10 flex flex-col">
          <header className="flex justify-center">
            <Image
              src="/logo-black.png"
              alt="company logo image"
              className="h-auto w-auto"
              width={150}
              height={50}
            />
          </header>

          {children}

          <footer className="mt-10 text-center text-gray-400 text-xs">
            <p className="">&copy; {new Date().getFullYear()} TruckMate</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
