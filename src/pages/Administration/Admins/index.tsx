import {Header} from "@/components/Headers";
import {Tab} from "@headlessui/react";
import {Fragment, useState} from "react";
import Admins from "./manage_admins/Admins";
import Roles from "./manage_roles/Roles";
import Departments from "./manage_department/Departments";
import SiteLayout from "@/Layout/SiteLayout";
import HamburgerMenu from "@/components/hamburgerMenu"; 


function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ') 
} 
export default function AdminsComponent() { 
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    const userTabs = [
      { name: 'Users', href: '#', current: selectedTabIndex === 0 },
      { name: 'Groups', href: '#', current: selectedTabIndex === 1 },

    ];
    return (
   
            <div className=" bg-[#FAFAFB] flex flex-col"> 
   
                <div>

                    <div className='mt-6'>
                        <Tab.Group>
                        <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3 mr-10">
                        {userTabs.map((tab, index) => (
                      <Fragment key={index}>
                  <Tab
                    className={classNames(
                      'border-d-green outline-none text-sm font-nunito font-bold uppercase flex flex-row ml-10',
                      tab.current ? 'ui-selected border-b-4 ui-selected:text-d-green' : ''
                    )}
                    onClick={() => setSelectedTabIndex(index)}
                  >
                    {tab.name}
                  </Tab>
                   </Fragment>
                            ))}
                       </Tab.List>
                            <Tab.Panels className=' bg-[#FAFAFB] h-full'>
                            <Tab.Panel className={classNames(selectedTabIndex === 0 ? 'ui-selected border-b-4' : '', 'h-full')}>
                                    <Admins/>
                                </Tab.Panel>
                                <Tab.Panel className={classNames(selectedTabIndex === 0 ? 'ui-selected border-b-4' : '', 'h-full')}>
                                    <Departments/>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>

                    </div>

                </div>
            </div>

    )
}




