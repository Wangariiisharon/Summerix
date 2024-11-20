import { ReactNode } from 'react';
import OperationsNav from './nav';

export const metadata = {
  title: {
    template: '%s | TruckMate Operations',
    default: 'Operations',
  },
};

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <main className="p-4">
      <OperationsNav />
      <div className="mt-5">{children}</div>
    </main>
  );
}
