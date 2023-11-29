import {ReactNode} from "react";
import {DeleteBtn, EditBtn} from "../Buttons";

interface Props {
    children: ReactNode
}

export function HeaderCell({children}: Props) {
    return (
        <>
            <th
                scope="col"
                className="whitespace-nowrap py-3 pl-4 pr-3 text-left text-base font-bold sm:pl-0 uppercase"
            >
                {children}
            </th>
        </>
    )
}

export function ButtonsHeaderCell() {
    return (
        <>
            <th scope="col" className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                <span className="sr-only"></span>
            </th>
        </>
    )
}

export function BodyCell({children}: Props) {
    return (
        <>
            <td className="whitespace-nowrap px-2 pt-4 ">{children}</td>
        </>
    )
}

export function BodyButtonCell({children}: Props){
    return(
        <>
            <td className="relative whitespace-nowrap pt-6 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 flex justify-around">
                {children}
                <div className='h-12'></div>
            </td>
        </>
    )
}
