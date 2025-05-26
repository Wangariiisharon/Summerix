import Constants from '@/Constants';
import { Metadata } from 'next';
import Image from 'next/image';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    template: '%s | Launchkit',
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
      <div className="flex h-screen w-full"
          style={{
            background: 'linear-gradient(to bottom, #1C1967, #B26026, #FFFFFF)',
          }}
        > 
        </div>
      </div>
      <div className="m-auto grid w-full max-w-sm lg:w-2/5">
        <div className="mt-10 flex flex-col p-4">
          <header className="flex justify-center">
            <Image
              src="/images/logo-black.png"
              alt="company logo image"
              className="h-auto w-auto"
              width={300}
              height={200}
            />
          </header>

          {children}

          <footer className="mt-10 text-center text-xs text-gray-400">
            <p className="">&copy; {new Date().getFullYear()} Launchkit</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
