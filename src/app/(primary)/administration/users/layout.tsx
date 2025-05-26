import { ReactNode } from 'react';

export const metadata = {
  title: {
    template: '%s | Launchkit Users',
    default: 'Users',
  },
};

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return <main className="">{children}</main>;
}
