import {Doughnut} from "react-chartjs-2";
import {ThisWeek} from "@/pages/Dashboard/index";
import {Chart as ChartJS, ArcElement, Tooltip, ScriptableContext} from 'chart.js';
import {AnyObject} from "chart.js/dist/types/basic";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

ChartJS.register(ArcElement, Tooltip);

export interface dataset {
    datasets: {
        backgroundColor: string[];
        data: number[];
        borderJoinStyle:  "round" | "bevel" | "miter" | ((ctx: ScriptableContext<"doughnut">, options: AnyObject) => CanvasLineJoin | undefined),
        borderWidth: number;
        borderRadius: number;
        borderAlign: "inner" | "center" | ((ctx: ScriptableContext<"doughnut">, options: AnyObject) => "inner" | "center" | undefined) | readonly ("inner" | "center" | undefined)[] | undefined
        spacing: number;
        radius: number;
    }[];
}

const data: dataset = {
    // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
        {
            backgroundColor: ['#20C997', '#F7F8FA'],
            data: [33, 67],
            borderJoinStyle: 'round',
            borderWidth: 20,
            borderRadius: 100,
            borderAlign: "inner",
            spacing: 15,
            radius: 50,
        },

    ],
};
const options = {
    cutout: 130,

}
export default function TripsPieGraph() {
    // @ts-ignore
    return (
        <>
            <div className='rounded-lg bg-white shadow lg:min-w-[20] h-full max-h-[24]'>
            <div className="sm:px-6 flex w-full items-center justify-between">
                    <h2 id="applicant-information-title" className="text-xl font-bold leading-6">
                        Trips Completed
                    </h2> 
                    <div className='text-sm flex items-center'>
                                    This Week
                                    <ChevronDownIcon className='ml-2 h-4 w-4'/>
                                </div>
                </div>
                <div className="flex flex-col items-center justify-center relative">
                    <div className='font-extrabold text-3xl absolute pl-4'>
                        20%
                    </div>
                    <Doughnut id='pp' data={data} options={options}  className='!bg-white '/>
                    <div className='w-56 text-center text-lg absolute bottom-2'>
                        Number of trips Completed this Month
                    </div>
                </div>
            </div>
        </>
    )
}
