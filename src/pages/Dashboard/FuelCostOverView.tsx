import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {ChevronDownIcon} from "@heroicons/react/24/solid";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Chart.js Bar Chart',
        },
    },
};

const labels = ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F', 'Truck G'];

const data = {
    labels: labels,
    datasets: [{
        label: 'Fuel Consumed: ',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: [
            '#165DFF',
            '#165DFF',
            '#165DFF',
            '#165DFF',
            '#165DFF',
            '#165DFF',
            '#165DFF',
        ],

        borderWidth: 0, 
        barThickness: 25,
        maxBarThickness: 25,
    }]
};
export default function FuelCostOverView(){
    return(
        <>
            <div className="w-1/2 mt-8 grid max-w-3xl lg:max-w-7xl">
                <div className="space-y-6 ">
                    <section aria-labelledby="applicant-information-title">
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-4 sm:px-6 flex w-full items-center justify-between">
                                <h2 id="applicant-information-title" className="text-lg font-bold leading-6">
                                     Fuel Cost
                                </h2>
                                <div className='text-sm flex items-center'>
                                    This Week
                                    <ChevronDownIcon className='ml-2 h-4 w-4'/>
                                </div>
                            </div>
                            <div className="border-t border-gray-200   px-4 sm:px-6 items-center">
                                <div className='my-6 flex'>
                                    <div>
                                        <div className='text-sm'>Average Fuel Consumption</div>
                                        <div className='text-xl font-extrabold'>6.05 MPG</div>
                                    </div>
                                    <div className='border border-black mx-8'/>

                                    <div>
                                        <div className='text-sm'>Fuel Cost</div>
                                        <div className='text-xl font-extrabold'>524K</div>
                                    </div>

                                </div>  
                                <div className='py-2'>
                                <Bar options={options} data={data} height={170} width={400} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}