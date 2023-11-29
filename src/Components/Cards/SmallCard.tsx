import {CardIcon} from "@/components/images";

// interface Props {
//     name: string
//     icon: string
//     amount: string
// }
// export function SmallCard({ name, icon, amount}:Props) {
//     return (
//         <>
//             <div className="overflow-hidden rounded-lg bg-white shadow w-80">
//                 <div className="">
//                     <div className="flex items-center">
//                         <div className="flex-shrink-0 rounded-full">
//                             <CardIcon src={icon} alt={name}/> 
//                         </div>
//                         <div className="ml-10 w-0 flex-1">
//                             <dl>
//                                 <dt className="truncate font-extrabold ">{amount}</dt>
//                                 <dd>
//                                     <div className="text-sm font-medium text-f-black">{name}</div>
//                                 </dd>
//                             </dl>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// } 

interface Props {
    name: string
    icon: string
    amount: string
} 

export function SmallCard({ name, icon, amount}:Props) { 
    return(
     <>
     <div className="overflow-hidden rounded-lg bg-white shadow">  
                     <div className="">
                    <div className="flex">
                        <div className="flex rounded-full">
                             <CardIcon src={icon} alt={name}/> 
                         </div>
                         <div className=" w-32 h-19 flex-1">
                             <dl>
                                 <dt className="truncate font-extrabold ">{amount}</dt>
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

interface Props {
    name: string
    icon: string
    amount: string
} 

export function Cards({ name, icon, amount}:Props) { 
    return(
     <>
     <div className="overflow-hidden rounded-lg bg-white shadow">  
                   <div className="flex">
                        <div className="flex rounded-full h-10  w-10">
                             <CardIcon src={icon} alt={name}/> 
                         </div>
                             <dl className="px-4 py-2">
                                 <dt className="truncate font-extrabold  ">{amount}</dt>
                                 <dd>
                                     <div className="text-sm font-medium text-f-black">{name}</div>
                                 </dd>
                             </dl>
             </div>


        </div> 

     </>
    )
}


