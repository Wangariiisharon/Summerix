import {Header} from "@/Components/Headers";
import {Tab} from "@headlessui/react";
import {Fragment} from "react";
import {Admins} from "@/Components/Administration/Admins";
import {Cities} from "@/Components/Administration/Cities";
import {Vehicles} from "@/Components/Administration/Vehicles";
import {Drivers} from "@/Components/Administration/Drivers";
import {Roles} from "@/Components/Administration/Roles";


const tabs = [
    {name: 'Manage Admins', href: '#', current: false},
    {name: 'Manage Cities', href: '#', current: false},
    {name: 'Manage Vehicles', href: '#', current: true},
    {name: 'Manage Driver', href: '#', current: false},
    {name: 'Manage Role', href: '#', current: false},
]

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

export default function AdministrationComponent() {
    return (
        <>
            <div>
                <Header heading="Administration"/>

                <div>

                    <div className='mt-12'>
                        <Tab.Group>
                            <Tab.List className='w-full flex justify-around mb-3 '>
                                {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                            <Tab className='ui-selected:border-b-4 border-d-green outline-none
                                             ui-selected:text-d-green text-xl font-bold uppercase p-4'>
                                                {tab.name}
                                            </Tab>
                                        </Fragment>
                                    )
                                })}

                            </Tab.List>
                            <Tab.Panels className='h-full flex flex-col'>
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
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>

                    </div>

                </div>
            </div>

        </>
    )
}




