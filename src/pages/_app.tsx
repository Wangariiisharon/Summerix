import { AuthProvider } from "@/components/Authentication/AuthProvider";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import "@/globals.css";
import React from "react";
import  Script  from 'next/script';

export default function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />      
      </Head> 
      <Script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE&libraries=places"
        strategy="beforeInteractive"
      />
        <AuthProvider>
        <Component {...pageProps} />
        </AuthProvider>
      <Toaster />
      <Script src="/register-service-worker.js" />
    </>
  );
}  


