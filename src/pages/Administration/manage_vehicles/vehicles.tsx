import {Tab} from "@headlessui/react";
import {Fragment} from "react";
import {AddButton} from "@/components/Buttons";
import {DummyTable} from "@/components/Table/Table";
import {tabs} from "@/pages/Administration/manage_admins/Admins";

export default function Vehicles(){
    const handleAdd = () => {
    }

    return (
        <>
            <div className='mt-8 max-h-[700px]'>
                <Tab.Group>
                    <div className='flex w-full justify-end'>
                        <div className='bg-white'>
                            <Tab.List>
                                {tabs.map((tab, index) => {
                                    return (
                                        <Fragment key={index}>
                                            <Tab
                                                className='ui-selected:bg-d-green h-10 w-32  ui-not-selected:bg-white uppercase'>
                                                {tab.name}
                                            </Tab>
                                        </Fragment>
                                    )
                                })
                                }
                            </Tab.List>
                        </div>
                        <div className='ml-8'>
                            Search bar
                        </div>
                        <div className='ml-8'>
                            <AddButton name='Add Admin' handleAddClick={handleAdd}/>
                        </div>

                    </div>

                    <Tab.Panels>
                        <Tab.Panel>
                        <div  className="max-h-[500px] overflow-y-auto">
                        <DummyTable/>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </div>
        </>
    )
}
