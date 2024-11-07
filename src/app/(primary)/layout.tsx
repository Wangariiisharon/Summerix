import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  header: ReactNode;
  sidebar: ReactNode;
  // footer: ReactNode;
};

export default function PrimaryLayout({ children, header, sidebar }: Props) {
  return (
    <>
      <div className="w-full fixed top-0 z-10 bg-[#04181C]">
        <div className="w-full">{header}</div>
      </div>

      <div className="mt-20 min-h-screen w-full">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-4 self-start relative">
          <div className="mt-5 w-full lg:w-1/6 flex flex-col items-center">
            <div className="w-full lg:w-fit fixed lg:p-4">{sidebar}</div>
          </div>
          <div className="mt-5 w-full min-h-screen lg:w-5/6 bg-gray-100">{children}</div>
        </div>
      </div>

      {/* <div className="w-full">{footer}</div> */}
    </>
  );
}
