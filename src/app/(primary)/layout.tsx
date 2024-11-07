import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  header: ReactNode;
  // sidebar: ReactNode;
  // footer: ReactNode;
};

export default function PrimaryLayout({ children, header }: Props) {
  return (
    <>
      <div className="w-full fixed top-0 z-10 bg-[#04181C]">
        <div className="w-full">{header}</div>
      </div>

      <div className="mt-20 min-h-screen w-full">{children}</div>
      {/* <div className="w-full">{footer}</div> */}
    </>
  );
}
