import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import Cities from "../../Operations/manage_cities/Cities";
import Vehicles from "../../Operations/Vehicles/manage_vehicles/Vehicles";
import Class from "../../Operations/manage_class/class";
import Drivers from "../../Operations/manage_drivers/Drivers";
import Jobcard from "./jobcard";
import React, { useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function UsersComponent() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const operationsTabs = [
    { name: "Class", href: "#", current: selectedTabIndex === 0 },
    { name: "Vehicles", href: "#", current: selectedTabIndex === 1 },
    { name: "Drivers", href: "#", current: selectedTabIndex === 2 },
    { name: "Clients", href: "#", current: selectedTabIndex === 3 },
    { name: "Job Cards", href: "#", current: selectedTabIndex === 4 },
  ];

  return (
    <div className="bg-[#FAFAFB] flex flex-col">
      <div>
        <div className="mt-6">
          <Tab.Group>
            <Tab.List className="w-full bg-[#FAFAFB] font-nunito flex justify-start mb-3">
              {operationsTabs.map((tab, index) => (
                <Fragment key={index}>
                  <Tab
                    className={classNames(
                      "border-d-green outline-none text-sm font-nunito font-bold uppercase flex flex-row ml-10",
                      tab.current
                        ? "ui-selected border-b-4 ui-selected:text-d-green"
                        : ""
                    )}
                    onClick={() => setSelectedTabIndex(index)}
                  >
                    {tab.name}
                  </Tab>
                </Fragment>
              ))}
            </Tab.List>
            <Tab.Panels className="bg-[#FAFAFB] h-full">
              <Tab.Panel
                className={classNames(
                  selectedTabIndex === 0 ? "ui-selected border-b-4" : "",
                  "h-full"
                )}
              >
                <Class />
              </Tab.Panel>
              <Tab.Panel
                className={classNames(
                  selectedTabIndex === 0 ? "ui-selected border-b-4" : "",
                  "h-full"
                )}
              >
                <Vehicles />
              </Tab.Panel>
              <Tab.Panel
                className={classNames(
                  selectedTabIndex === 1 ? "ui-selected border-b-4" : "",
                  "h-full"
                )}
              >
                <Drivers />
              </Tab.Panel>
              <Tab.Panel
                className={classNames(
                  selectedTabIndex === 2 ? "ui-selected border-b-4" : "",
                  "h-full"
                )}
              >
                <Cities />
              </Tab.Panel>
              <Tab.Panel
                className={classNames(
                  selectedTabIndex === 3 ? "ui-selected border-b-4" : "",
                  "h-full"
                )}
              >
                <Jobcard />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}
