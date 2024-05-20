import { Header } from "@/components/Headers";
import { Tab } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

import Cities from "./manage_cities/Cities";
import Vehicles from "./Vehicles";
import Trips from "./Trips";
import Drivers from "./manage_drivers/Drivers";
import Class from "./manage_class/class";
import SiteLayout from "@/Layout/SiteLayout";
import Jobcard from "./Jobcards/jobcard";

const tabs = [
  { name: "Trips", href: "#", current: false },
  { name: "Vehicles", href: "#", current: false },
  { name: "Class", href: "#", current: false },
  { name: "Clients", href: "#", current: false },
  { name: "Drivers", href: "#", current: false },
  { name: "Jobcards", href: "#", current: false },
  { name: "Suppliers", href: "#", current: false },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function AdministrationComponent() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Retrieve the saved tab index from local storage when the component mounts
    const savedIndex = localStorage.getItem("selectedTabIndex");
    if (savedIndex !== null) {
      setSelectedIndex(parseInt(savedIndex, 10));
    }
  }, []);

  const handleTabChange = (index: number) => {
    // Save the selected tab index to local storage
    localStorage.setItem("selectedTabIndex", index.toString());
    setSelectedIndex(index);
  };

  return (
    <SiteLayout>
      <div className=" bg-[#FAFAFB] flex flex-col">
        {/* <p className="text-lg font-nunito font-bold mt-2 ml-5">Operations</p> */}

        <div>
          <div className="mt-10">
            <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
              <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3">
                {tabs.map((tab, index) => {
                  return (
                    <Fragment key={index}>
                      <Tab
                        className="ui-selected:border-b-4 border-d-green outline-none
                        ui-selected:text-d-green text-sm font-nunito font-bold uppercase flex flex-row ml-10"
                      >
                        {tab.name}
                      </Tab>
                    </Fragment>
                  );
                })}
              </Tab.List>
              <Tab.Panels className=" bg-[#FAFAFB] h-full">
                <Tab.Panel className="h-full">
                  <Trips />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Vehicles />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Class />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Cities />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Drivers />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Jobcard />
                </Tab.Panel>
                <Tab.Panel className="h-full">{/* <Class /> */}</Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
