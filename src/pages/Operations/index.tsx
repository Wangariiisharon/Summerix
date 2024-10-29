import { Header } from "@/components/Headers";
import { Tab } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/router";

import Cities from "./manage_cities/Cities";
import Vehicles from "./Vehicles";
import Trips from "./Trips/trips";
import Drivers from "./manage_drivers/Drivers";
import Class from "./manage_class/class";
import SiteLayout from "@/Layout/SiteLayout";
import Jobcard from "./Jobcards/jobcard";
import Cargo from "./manage_cargo/cargo";
import Link from "next/link";
import Suppliers from "./Suppliers/suppliers";

const tabs = [
  { name: "Trips", href: "/Operations?tab=Trips", current: false },
  { name: "Vehicles", href: "/Operations?tab=Vehicles", current: false },
  { name: "Class", href: "/Operations?tab=Class", current: false },
  { name: "Clients", href: "/Operations?tab=Clients", current: false },
  {
    name: "Drivers",
    href: "/Operations?tab=Drivers",
    current: false,
  },
  { name: "Jobcards", href: "/Operations?tab=Jobcards", current: false },
  { name: "Cargo", href: "/Operations?tab=Cargo", current: false },
  {
    name: "Suppliers",
    href: "/Operations?tab=Suppliers",
    current: false,
  },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function OperationsComponent() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const { tab } = router.query;

    // Find the tab index based on the query parameter
    const tabIndex = tabs.findIndex((t) => t.name === tab);
    if (tabIndex !== -1) {
      setSelectedIndex(tabIndex);
    }
  }, [router.query]);

  const handleTabChange = (index: any) => {
    localStorage.setItem("selectedTabIndex", index.toString());
    setSelectedIndex(index);

    router.push({
      pathname: "/Operations", // Keeps the current route
      query: { tab: tabs[index].name }, // Updates the tab query parameter
    });
  };

  return (
    <SiteLayout>
      <div className=" bg-[#FAFAFB] flex flex-col">
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

                <Tab.Panel className="h-full">
                  <Cargo />
                </Tab.Panel>

                <Tab.Panel className="h-full">
                  <Suppliers />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
