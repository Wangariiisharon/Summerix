import { ReactNode } from 'react';

export const metadata = {
  title: 'User',
};

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return <main className="p-4">{children}</main>;
}
