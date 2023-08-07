import {ChevronRightIcon, SignalIcon} from "@heroicons/react/20/solid";


const trips = [
    {
        name: 'Live Trips',
        title: '158',
    },
    {
        name: 'Scheduled',
        title: '158',
        color: 'light-yellow'
    },
    {
        name: 'Completed',
        title: '158',

    },
    {
        name: 'Incomplete',
        title: '158',
    },

]

export function TripsOverView(){
    return(
        <>
        <div className='rounded-lg bg-white shadow lg:min-w-[28rem]'>
            <div className="px-4 pt-8 sm:px-6   ">
                <h2 id="applicant-information-title" className="text-xl font-bold leading-6">
                    Trips
                </h2>
                <div className='text-sm mt-2'>
                   Trips Data
                </div>
            </div>
            <div className=" px-4 py-2 sm:px-6 flex flex-col items-center">

                <div className="w-full">
                    <div className=" overflow-x-auto">
                        <div className="inline-block min-w-full py-2 align-middle ">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                <tr>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white font-bold ">
                                {trips.map((trip, index) => (
                                    <tr key={index}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 flex items-center">
                                                    <SignalIcon className='h-6 w-6 text-d-blue'/>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="">{trip.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 ">
                                            <div className="text-gray-900">{trip.title}</div>
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
