import { AuthProvider } from "@/components/Authentication/AuthProvider";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import "@/globals.css";
import React from "react";
import Script from "next/script";
import { useActivityTracker } from "@/components/SessionTimeOut/useActivityTracker";
import InactivityModal from "@/components/SessionTimeOut/inactivityModal";

export default function MyApp({ Component, pageProps }: any) {
  // useActivityTracker(300000); // 5 minutes timeout
  const { isModalOpen, setModalOpen } = useActivityTracker(900000); // 5 minutes timeout

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <title>TruckMate</title>
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
        <InactivityModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      </AuthProvider>
      <Toaster />
      <Script src="/register-service-worker.js" />
    </>
  );
}
