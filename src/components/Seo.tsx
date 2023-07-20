import Head from 'next/head';
import React from 'react';
import Constants from '@/Constants';

interface Props {
  lang?: string;
  title: string;
  description?: string;
  imageURL?: string;
}

const Seo = ({ lang, title, description, imageURL }: Props) => {
  const seo = {
    lang: lang || 'en',
    title: title || 'Goracle',
    description: description || Constants.description,
    image: imageURL || Constants.imageURL,
    twitterHandle: '@TruckIt',
    url: 'https://truckit.io',
  };

  return (
    <Head>
      {/* <html lang={seo.lang} /> */}
      <title>{`${seo.title} | Truck It`}</title>
      <meta name="description" content={seo.description} />

      <meta name="og:type" content="website" />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:creator" content={seo.twitterHandle} />
      <meta name="twitter:image" content={seo.image} />
    </Head>
  );
};

export default Seo;
