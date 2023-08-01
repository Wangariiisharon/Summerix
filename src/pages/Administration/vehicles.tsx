import { useState } from "react";
import { Tab } from "@headlessui/react";
import { AddButton } from "../Button";
import Table from "../Tables/tables";

import { Fragment } from "react";


const vehicles: any[] = [
  {
      vehicleId: '98560945bdy',
      name: 'Lina Wainaina',
      license: 'KBD 26496',
      status:"Active"
  
  },
  {
    vehicleId: '98560945bdy',
    name: 'Lina Wainaina',
    license: 'KBD 26496',
    status:"Active"

},
{
    vehicleId: '98560945bdy',
    name: 'Lina Wainaina',
    license: 'KBD 26496',
    status:"Active"

},
{
    vehicleId: '98560945bdy',
    name: 'Lina Wainaina',
    license: 'KBD 26496',
    status:"Active"

},
];

const  vehicleColumns = [
  { label: "VEHICLE ID", accessor: "vehicleId" },
  { label: "NAME", accessor: "name" },
  { label: "LICENSE", accessor: "license" },
  { label: "ACTIVE", accessor: "status" },
];
export function VehiclesTable() {
  return <Table data={vehicles} columns={vehicleColumns} />;
}

export default function Vehicles() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (tabIndex:number) => {
    setActiveTab(tabIndex);
  };

  return (
    <>
      <div className="mt-8">
        <VehiclesTabs handleTabChange={handleTabChange} activeTab={activeTab} />

        <Tab.Group as="div">
          <Tab.Panels>
            {tabs.map((tab, index) => (
              <Tab.Panel key={index}>
                <VehiclesTable />
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

interface VehiclesTableProps {
  handleTabChange: (tabIndex: number) => void;
  activeTab: number;
}

export function VehiclesTabs({ handleTabChange, activeTab }: VehiclesTableProps) {
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
