import {CardIcon} from "@/Components/images";

interface Props {
    name: string
    icon: string
    amount: string
}
export function SmallCard({ name, icon, amount}:Props) {
    return (
        <>
            <div className="overflow-hidden rounded-lg bg-white shadow w-80 ">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-full">
                            <CardIcon src={icon} alt={name}/>
                        </div>
                        <div className="ml-10 w-0 flex-1">
                            <dl>
                                <dt className="truncate text-2xl font-extrabold ">{amount}</dt>
                                <dd>
                                    <div className="text-sm font-medium text-f-black">{name}</div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
