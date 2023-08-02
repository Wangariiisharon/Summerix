import {FormEvent, ReactNode} from "react";

interface Props{
    handleSubmit: Function
    children: ReactNode
}
export function Form({children, handleSubmit}: Props){
    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
       handleSubmit()
    }
    return(
        <>
            <div>
                <form onSubmit={onSubmit}>
                    {children}
                </form>

            </div>

        </>
    )
}
