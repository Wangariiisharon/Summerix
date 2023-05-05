import {ReactNode} from "react";

interface Props {
    children: ReactNode
}

export function TableBody({children}: Props) {
    return (
        <>
            <tbody className="divide-y divide-gray-200 bg-white px-8">
            {children}
            </tbody>

        </>
    )
}
