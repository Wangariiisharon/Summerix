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
    <main className="p-2">
      <div className="w-full bg-white p-4">
        <h1 className="text-xl font-semibold">Operations</h1>

        <hr className="-mx-4 my-3" />

        <OperationsNav />
      </div>

      <div className="p-4">{children}</div>
    </main>
  );
}
