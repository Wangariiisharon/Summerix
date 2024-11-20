import { ReactNode } from 'react';
import CompanyView from './company';

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
    <main className="p-4">
      <CompanyView />
      <div className="mt-5">{children}</div>
    </main>
  );
}
