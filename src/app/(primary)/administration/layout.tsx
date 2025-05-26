import { ReactNode } from 'react';
import CompanyNav from './nav';

export const metadata = {
  title: {
    template: '%s | Launchkit Administration',
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

      <div className="p-4">{children}</div>
    </main>
  );
}
