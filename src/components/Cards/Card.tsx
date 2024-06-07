import {ReactNode} from "react";

interface Props{
    children: ReactNode,
    className: string
}

export default function Card({children, className}: Props){
    return(
        <>
            <div className={'rounded ring ring-b-gray bg-white ' + className}>
                {children}
            </div>
        </>
    )
}
