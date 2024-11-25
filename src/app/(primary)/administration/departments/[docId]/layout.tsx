import { ReactNode } from 'react';

export const metadata = {
  title: 'Department',
};

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return <main className="p-4">{children}</main>;
}
