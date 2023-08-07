import {Doughnut} from "react-chartjs-2";
import {ThisWeek} from "@/components/Dashboard/index";
import {Chart as ChartJS, ArcElement, Tooltip, ScriptableContext} from 'chart.js';
import {AnyObject} from "chart.js/dist/types/basic";

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
            borderWidth: 0,
            borderRadius: 10,
            borderAlign: "inner",
            spacing: 10,
            radius: 106,
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
            <div className='rounded-lg bg-white shadow lg:min-w-[28rem] h-full max-h-[34rem]'>
                <div className="px-4 py-8 sm:px-6 flex w-full items-center justify-between">
                    <h2 id="applicant-information-title" className="text-xl font-bold leading-6">
                        Trips Completed
                    </h2>
                    <ThisWeek/>
                </div>
                <div className=" px-4 py-5 sm:px-6 flex flex-col items-center justify-center relative h-[24rem]">
                    <div className='font-extrabold text-3xl absolute pl-4'>
                        20%
                    </div>
                    <Doughnut id='pp' data={data} options={options} updateMode="default" className='!bg-white '/>
                    <div className='w-56 text-center text-lg absolute bottom-2'>
                        Number of trips Completed this Month
                    </div>
                </div>
            </div>
        </>
    )
}
