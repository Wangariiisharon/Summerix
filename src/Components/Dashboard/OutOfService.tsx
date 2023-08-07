import {ChevronRightIcon, SignalIcon} from "@heroicons/react/20/solid";

const people = [
    {
        name: 'Vehicle out of service',
        title: '25',
        department: '',
        email: '',
        role: '',
        image:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },

    // More people...
]

export function OutOfService() {
    return (
        <>
            <div className='bg-white shadow rounded-lg w-1/3 ml-2'>
                <div className="px-4 pt-8 sm:px-6">
                    <h2 id="applicant-information-title" className="text-lg font-bold leading-6">
                        Out Of Service
                    </h2>
                    <div className="text-gray-500 text-sm">
                        Out of Order Vehicles
                    </div>
                </div>
                <div className="px-4 py-5 sm:px-6   ">
                    <div className='font-extrabold text-xl'>25</div>
                    <div className="text-gray-500 text-sm">
                        Vehicles total
                    </div>


                    <div className=" ">
                        <div className=" overflow-x-auto w-full">
                            <div className="inline-block min-w-full py-2 align-middle ">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                    <tr>
                                        <th scope="col"
                                            className="py-3.5 pl-4 pr-3 text-left text-sm text-gray-300 sm:pl-0">
                                        </th>

                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-400 bg-white">
                                    {people.map((person) => (
                                        <tr key={person.email}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3  sm:pl-0">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="font-bold">{person.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                                                <div className="font-bold">{person.title}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <ChevronRightIcon className='h-6 w-6 font-extrabold'/>
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
