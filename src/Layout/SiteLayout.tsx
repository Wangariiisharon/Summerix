import Head from "next/head";
import { ReactNode } from "react";
import SiteNav from "@/components/Headers/SiteNav";

interface Props {
  children: ReactNode;
}

export default function SiteLayout({ children }: Props) {
  return (
    <>
      <Head>
        <title>Truck Mate</title>
        <meta
          name="description"
          content="Platform which makes logistics much easier."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SiteNav>
        <div className="">{children}</div>
      </SiteNav>
    </>
  );
}
