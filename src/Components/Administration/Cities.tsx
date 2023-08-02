import {Tab} from "@headlessui/react";
import {Fragment} from "react";
import {AddButton} from "@/Components/Buttons";
import DummyTable from "@/Components/Table/Table";

const tabs = [
    {name: "All"},
    {name: "Active"},
    {name: "InActive"},

]

export function Cities(){
    const handleAdd = () => {
    }

    return (
        <>
            <div className='mt-8'>
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
                            <DummyTable/>
                        </Tab.Panel>
                        <Tab.Panel>
                            <DummyTable/>
                        </Tab.Panel>
                        <Tab.Panel>
                            <DummyTable/>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </div>
        </>
    )
}
