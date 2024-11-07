import Constants from "@/Constants";
import "@/globals.css";

import { Raleway } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContextProvider } from "./auth-provider";

const raleway = Raleway({ subsets: ["latin"] });

export const metadata = {
  title: {
    template: "%s | TruckMate",
    default: "TruckMate Platform",
  },
  description: Constants.description,
  metadataBase: new URL("https://www.truckmate.io"),
  openGraph: {
    images: ["/images/cover.png"],
  },
  twitter: {
    card: "summary",
    creator: "@TruckMate",
    images: ["/images/cover.png"],
  },
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={raleway.className}>
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <GoogleAnalytics
          gaId={`${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}`}
        />

        <AuthContextProvider>{children}</AuthContextProvider>

        <Toaster />
      </body>
    </html>
  );
}
