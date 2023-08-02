import Card from "@/Components/Cards/Card";
import {SmallCard} from "@/Components/Cards/SmallCard";
import {VehicleOverview} from "@/Components/Dashboard/VehicleOverview";
import {FuelCostOverView} from "@/Components/Dashboard/FuelCostOverView";
import TripsPieGraph from "@/Components/Dashboard/TripsPieGraph";
import {TripsOverView} from "@/Components/Dashboard/TripsOverView";
import {ClientsOverView} from "@/Components/Dashboard/ClientsOverView";
import {OnRoute} from "@/Components/Dashboard/OnRoute";
import {OutOfService} from "@/Components/Dashboard/OutOfService";
import {Header} from "@/Components/Headers";
import {Fragment} from "react";
import {ChevronDownIcon} from "@heroicons/react/24/solid";


const cards = [
    {amount: '335K', href: '#', icon: '/icons/cashIcon.png', name: 'Overall Earnings'},
    {amount: '150K', href: '#', icon: '/icons/cardIcon.png', name: 'Earnings per truck'},
    {amount: '524K', href: '#', icon: '/icons/trophyIcon.png', name: 'Targeted Earnings'},
    {amount: '100', href: '#', icon: '/icons/bluetruckIcon.png', name: 'Trucks Available'}
]

export default function DashboardComponent() {
    return (
        <>
            <div>
                <Header heading="Dashboard"/>
                <div className='mt-8 flex justify-around'>
                    {cards.map((card, index) => {
                        return (
                            <Fragment key={index}>
                                <SmallCard name={card.name} icon={card.icon} amount={card.amount}/>
                            </Fragment>
                        )
                    })}
                </div>
                <div className='w-full flex'>
                    <VehicleOverview/>
                    <FuelCostOverView/>
                </div>
                <div className='flex w-full justify-between mt-8 '>
                    <TripsPieGraph/>
                    <TripsOverView/>
                    <ClientsOverView/>
                </div>
                <div className='flex w-full mt-8'>
                    <OnRoute/>
                    <OutOfService/>
                </div>

            </div>
        </>
    )
}

export function ThisWeek() {
    return (
        <>
            <div className='text-sm flex items-center'>
                This Week
                <ChevronDownIcon className='ml-2 h-4 w-4'/>
            </div>
        </>
    )
}
