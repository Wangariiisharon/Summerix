import { ReactNode } from 'react';

export const metadata = {
  title: 'Company',
};

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return <main className="bg-white p-4">{children}</main>;
}
