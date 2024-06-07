import Document, { Html, Head, Main, NextScript } from "next/document";
import { GtagsNoScript, GtagsScript } from "@/components/GoogleTags";
import Script from "next/script";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <GtagsScript />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400&display=swap"
            rel="stylesheet"
          />
          <Script
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE&libraries=places"
            strategy="beforeInteractive"
          />
        </Head>
        <body>
          <GtagsNoScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
