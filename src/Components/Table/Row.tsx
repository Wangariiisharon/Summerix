import {ReactNode} from "react";

interface Props {
    children: ReactNode
}

export function TableBody({children}: Props) {
    return (
        <>
            <tbody className="divide-y border-solid divide-gray-200 bg-[#FAFAFB]">
                
            {children}
            </tbody>

        </>
    )
}
