import { ReactNode } from 'react';
import CompanyNav from './nav';

export const metadata = {
  title: {
    template: '%s | TruckMate Administration',
    default: 'Administration',
  },
};

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <main className="p-2">
      <div className="w-full bg-white p-4">
        <CompanyNav />
      </div>

      <div className="mt-5 p-4">{children}</div>
    </main>
  );
}
