import {CardIcon} from "@/components/images";

const people = [
    {
        name: 'Mombasa Kilifi',
        title: 'Kampala',
        department: '',
        email: '',
        role: 'AB1234',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Mombasa Kilifi',
        title: 'Kampala',
        department: '',
        email: '',
        role: 'AB1234',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Mombasa Kilifi',
        title: 'Kampala',
        department: '',
        email: '',
        role: 'AB1234',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Mombasa Kilifi',
        title: 'Kampala',
        department: '',
        email: '',
        role: 'AB1234',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },

    // More people...
]
export function OnRoute(){
    return(
        <>
        <div className='bg-white shadow rounded-lg w-2/3 mr-2'>
            <div className="sm:px-10 lg:px-12 pt-8">
                <h2 id="applicant-information-title" className="text-lg font-bold leading-6">
                    On Route
                </h2>
            </div>
            <div className=" px-4 py-5 sm:px-6 ">
                <div className="mt ">
                    <div className=" overflow-x-auto w-full">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-bold  sm:pl-0">
                                        Starting Route
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold ">
                                        Ending Route
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold ">
                                        Truck NO
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold ">
                                        Status
                                    </th>

                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                {people.map((person) => (
                                    <tr key={person.email} className='font-bold'>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3  sm:pl-0">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <CardIcon src='/icons/truckIcon.png' alt="truck"/>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-bold ">{person.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4  ">
                                            <div className="">{person.title}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">{person.role}</td>

                                        <td className="whitespace-nowrap px-3 py-4  ">
                                              <span className="inline-flex rounded-full bg-pill-green
                                              text-xs font-bold leading-5 w-[92px] h-[32px] justify-center items-center">
                                                On Route
                                              </span>
                                        </td>

                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        </>
    )
}
