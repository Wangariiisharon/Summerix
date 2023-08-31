import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import {ReactNode} from "react";
import SiteNav from "@/Blocks/SiteNav";


interface Props {
    children: ReactNode
}

export default function SiteLayout({children}: Props) {
    return (
        <>
            <Head>
                <title>Trucking App</title>
                <meta name="description" content="Platform which makes logistics much easier."/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <SiteNav>
                <div  className=''>
                    {children}
                </div>
            </SiteNav>
        </>
    )
}
