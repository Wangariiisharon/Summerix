import {Header} from "@/components/Headers";
import {Tab} from "@headlessui/react";
import {Fragment} from "react";
import Admins from "./manage_admins/Admins";
import Cities from "./manage_cities/Cities";
import Vehicles from "./manage_vehicles/Vehicles";
import Drivers from "./manage_drivers/Drivers";
import Roles from "./manage_roles/Roles";
import Departments from "./manage_department/Departments";
import SiteLayout from "@/Layout/SiteLayout";
import Profile from "../Profile" 
import HamburgerMenu from "@/components/hamburgerMenu"; 
import AssignRole from "./manage_roles/assignRole";

const tabs = [
    {name: 'Manage Admins', href: '#', current: false},
    {name: 'Manage Cities', href: '#', current: false},
    {name: 'Manage Vehicles', href: '#', current: true},
    {name: 'Manage Driver', href: '#', current: false},
    {name: 'Manage Role', href: '#', current: false},
    {name: 'Manage Department', href: '#', current: false},
]

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ') 

} 


export default function AdministrationComponent() {
    return (
        <SiteLayout>  
            <div className="w-full flex flex-row bg-[#FFFFFF] fixed top-0 h-10">   
            <div className="flex justify-center">
            <div className="ml-7 flex justify-center"><HamburgerMenu/></div> 
            <div> 
            <img src="Frame 13.png" className="fixed right-14 w-8" alt="Notification" /> 
            <img src="Ellipse 1.png" className=" w-9 fixed right-4 pl-2" alt="" />

            </div> 
            </div>   
            </div>
            <div className=" bg-[#FAFAFB] max-h-[600px]"> 
                <p className="text-lg font-nunito font-bold mt-2 ml-7">Administration</p>

                <div>

                    <div className='mt-12'>
                        <Tab.Group>
                            <Tab.List className='w-full bg-[#FAFAFB] font-nunito flex justify-around mb-3 '>
                                {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                            <Tab className='ui-selected:border-b-4 border-d-green outline-none
                                             ui-selected:text-d-green text-sm font-nunito font-bold uppercase flex flex-row'>
                                                {tab.name}
                                            </Tab>
                                        </Fragment>
                                    )
                                })}

                            </Tab.List>
                            <Tab.Panels className=' bg-[#FAFAFB] h-full'>
                                <Tab.Panel className='h-full'>
                                    <Admins/>
                                </Tab.Panel>
                                <Tab.Panel className='h-full'>
                                    <Cities/>
                                </Tab.Panel>
                                <Tab.Panel className='h-full'>
                                    <Vehicles/>
                                </Tab.Panel>
                                <Tab.Panel className='h-full'>
                                    <Drivers/>
                                </Tab.Panel>
                                <Tab.Panel className='h-full'>
                                    <Roles/>
                                </Tab.Panel > 
                                <Tab.Panel className='h-full'>
                                    <Departments/>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>

                    </div>

                </div>
            </div>

            </SiteLayout>
    )
}




