import {PlusIcon} from "@heroicons/react/24/solid";
import {PencilIcon, TrashIcon} from "@heroicons/react/24/outline";
import {classNames} from "@/Blocks/SiteNav";
import {ReactNode} from "react";

interface Props {
    className: string
    handleClick: Function | undefined
    children: ReactNode
    type?: "button" | "submit" | "reset" | undefined
}

export function Button({className, handleClick, children, type}: Props) {
    const click = () => {
        if (handleClick) handleClick()
    }
    return (
        <>
            <button
                type={type}
                onClick={click}
                className={classNames(className)}>
                {children}
            </button>
        </>
    )
}

interface AddBtnProps {
    name: string
    handleAddClick: Function
}

export function AddButton({name, handleAddClick}: AddBtnProps) {
    return (
        <>
            <Button
                className='rounded bg-d-green w-[180px] h-[44px] uppercase text-white font-semibold flex items-center py-4 px-4'
                handleClick={handleAddClick}>
                <PlusIcon className='h-6 w-6 mr-2'/>
                {name}
            </Button>
        </>
    )
}

export function EditBtn() {
    return (
        <>
            <Button className='h-8 w-8 bg-light-green flex items-center justify-center' handleClick={undefined}>
                <PencilIcon className='h-4 w-4 '/>
            </Button>
        </>
    )
}

export function DeleteBtn() {
    return (
        <>
            <Button handleClick={undefined}
                className='h-8 w-8 bg-red-200 flex items-center justify-center'>
                <TrashIcon className='h-4 w-4 '/>
            </Button>
        </>
    )
}

