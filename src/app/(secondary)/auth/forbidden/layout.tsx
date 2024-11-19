import { ReactNode } from 'react';

export const metadata = {
  title: 'Forbidden',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <main className="">{children}</main>;
}
