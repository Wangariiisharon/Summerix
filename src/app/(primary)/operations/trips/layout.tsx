import { ReactNode } from 'react';

export const metadata = {
  title: {
    template: '%s | TruckMate Trips',
    default: 'Trips',
  },
};

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return <main className="">{children}</main>;
}
