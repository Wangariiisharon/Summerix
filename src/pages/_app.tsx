import { AuthProvider } from "@/components/Authentication/AuthProvider";
import Head from "next/head";
import { Toaster } from "react-hot-toast";

import "@/globals.css";

export default function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {/* <link rel="icon" href="/favicons/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" /> */}
      </Head>

      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>

      <Toaster />
    </>
  );
}
