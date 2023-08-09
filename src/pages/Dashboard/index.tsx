import Card from "@/components/Cards/Card";
import SiteLayout from "@/Layout/SiteLayout";
import {SmallCard} from "@/components/Cards/SmallCard";
import VehicleOverview from "@/pages/Dashboard/VehicleOverview";
import FuelCostOverView from "@/pages/Dashboard/FuelCostOverView";
import TripsPieGraph from "@/pages/Dashboard/TripsPieGraph";
import TripsOverView from "@/pages/Dashboard/TripsOverView";
import ClientsOverView from "@/pages/Dashboard/ClientsOverView";
import OnRoute from "@/pages/Dashboard/OnRoute";
import OutOfService from "@/pages/Dashboard/OutOfService";
import {Header} from "@/components/Headers";
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
        <SiteLayout>
            <div  className="max-h-[700px] overflow-y-auto">
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
            </SiteLayout>
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
