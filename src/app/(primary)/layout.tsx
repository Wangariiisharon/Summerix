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
        <div className="relative flex flex-col items-start justify-center self-start xl:flex-row">
          <div className="mt-5 flex w-full flex-col items-center xl:w-1/6">
            <div className="fixed w-full xl:w-fit xl:p-4">{sidebar}</div>
          </div>
          {/* why do we have a gray background here? when all the other pages are white?  */}
          {/* <div className="mt-10 min-h-screen w-full bg-gray-100 sm:mt-5 xl:w-5/6">{children}</div> */}

          <div className="mt-10 min-h-screen w-full bg-white sm:mt-5 xl:w-5/6">{children}</div>
        </div>
      </div>

      {/* <div className="w-full">{footer}</div> */}

      <div className="hidden">
        <div className="status-pending status-booked status-under-maintenance"></div>
        <div className="status-active status-on-route"></div>
        <div className="status-approved status-completed status-available"></div>
        <div className="status-cancelled status-rejected status-out-of-service"></div>
      </div>
    </>
  );
}
