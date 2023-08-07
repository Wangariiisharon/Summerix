import logo from '../../../public/logo.png'
import darkLogo from '../../../public/Darklogo.png'
import dashboardLogo from '../../../public/dashboardLogo.png'


import Image from "next/image";

interface Props {
    src: string
    alt: string
}

export function Logo(){
    return(
        <Image src={logo} alt={'logo'} priority={true}/>
    )
}
export function DarkLogo(){
    return(
        <Image src={darkLogo} alt={'logo'} priority={true}/>
    )
}

export function CardIcon({src, alt}:Props){
    return (
        <Image src={src} alt={alt} width={60} height={60}/>
    )
} 

export function DashboardLogo(){
    return (
        <Image src={dashboardLogo} alt={'logo'} priority={true}/>
    )
}
