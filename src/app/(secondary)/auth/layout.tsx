import Constants from '@/Constants';
import { Metadata } from 'next';
import Image from 'next/image';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    template: '%s | TruckMate',
    default: 'Auth',
  },
  description: Constants.description,
};

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <main className="flex h-full min-h-screen w-full flex-row">
      <div className="hidden w-3/5 lg:block">
        <div className="flex h-screen w-full">
          <Image
            src="/images/login-bg.png"
            alt="login background image"
            className="h-full w-full"
            priority={true}
            width={2000}
            height={1000}
          />
        </div>
      </div>
      <div className="m-auto grid w-full max-w-sm lg:w-2/5">
        <div className="mt-10 flex flex-col p-4">
          <header className="flex justify-center">
            <Image
              src="/images/logo-black.png"
              alt="company logo image"
              className="h-auto w-auto"
              width={200}
              height={100}
            />
          </header>

          {children}

          <footer className="mt-10 text-center text-xs text-gray-400">
            <p className="">&copy; {new Date().getFullYear()} TruckMate</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
