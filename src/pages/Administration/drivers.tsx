import { useState } from "react";
import { Tab } from "@headlessui/react";
import { AddButton } from "../Button";
import Table from "../Tables/tables";

import { Fragment } from "react";


const drivers: any[] = [
  {
      driverId: '2822',
      driver: 'David Mwangi',
      mobile: '01313368009',
      vehicleType:"Flatbed Truck",
      completedTrips:"3 trips"  
  },
  {
    driverId: '2822',
    driver: 'David Mwangi',
    mobile: '01313368009',
    vehicleType:"Flatbed Truck",
    completedTrips:"3 trips"  
},
{
    driverId: '2822',
    driver: 'David Mwangi',
    mobile: '01313368009',
    vehicleType:"Flatbed Truck",
    completedTrips:"3 trips"  
},
{
    driverId: '2822',
    driver: 'David Mwangi',
    mobile: '01313368009',
    vehicleType:"Flatbed Truck",
    completedTrips:"3 trips"  
},
];

const  driversColumns = [
  { label: "DRIVER ID", accessor: "driverId" },
  { label: "DRIVER", accessor: "driver" },
  { label: "MOBILE", accessor: "mobile" },
  { label: "VEHICLE TYPE", accessor: "vehicleType" },
  { label: "COMPLETED TRIPS", accessor: "completedTrips" },

];
export function DriversTable() {
  return <Table data={drivers} columns={driversColumns} />;
}

export default function Drivers() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (tabIndex:number) => {
    setActiveTab(tabIndex);
  };

  return (
    <>
      <div className="mt-8">
        <DriversTabs handleTabChange={handleTabChange} activeTab={activeTab} />

        <Tab.Group as="div">
          <Tab.Panels>
            {tabs.map((tab, index) => (
              <Tab.Panel key={index}>
                <DriversTable />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
}





const tabs = [
  { name: "All" },
  { name: "Active" },
  { name: "InActive" },
];

interface DriversTableProps {
  handleTabChange: (tabIndex: number) => void;
  activeTab: number;
}

export function DriversTabs({ handleTabChange, activeTab }: DriversTableProps) {
  return (
    <div className="flex w-full justify-end">
      <div className="bg-white">
        <Tab.Group>
        <Tab.List>
          {tabs.map((tab, index) => (
            <Fragment key={index}>
              <Tab
                className={`ui-selected:bg-d-green h-10 w-32 ui-not-selected:bg-white uppercase ${
                  activeTab === index ? "ui-selected:bg-d-green" : ""
                }`}
                onClick={() => handleTabChange(index)}
              >
                {tab.name}
              </Tab>
            </Fragment>
          ))}
        </Tab.List>
        </Tab.Group>
      </div>
      <div className="ml-8">Search bar</div>
      <div className="ml-8">
        <AddButton name="Add Admin" handleAddClick={() => {}} />
      </div>
    </div>
  );
}
