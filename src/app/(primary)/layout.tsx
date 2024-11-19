import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  header: ReactNode;
  sidebar: ReactNode;
  // footer: ReactNode;
};

export default function PrimaryLayout({ children, header, sidebar }: Props) {
  return (
    <>
      <div className="fixed top-0 z-10 w-full bg-[#04181C]">
        <div className="w-full">{header}</div>
      </div>

      <div className="mt-20 min-h-screen w-full">
        <div className="relative flex flex-col items-start justify-center gap-4 self-start lg:flex-row">
          <div className="mt-5 flex w-full flex-col items-center lg:w-1/6">
            <div className="fixed w-full lg:w-fit lg:p-4">{sidebar}</div>
          </div>
          <div className="mt-5 min-h-screen w-full bg-gray-100 lg:w-5/6">{children}</div>
        </div>
      </div>

      {/* <div className="w-full">{footer}</div> */}
    </>
  );
}
