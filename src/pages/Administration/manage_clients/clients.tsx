import { useState } from "react";
import { Tab } from "@headlessui/react";
import {AddButton} from "@/components/Buttons";
// import {VehiclesTable} from "../Tables/functions";
import Table from "../../Tables/tables";

import { Fragment } from "react";


const cities: any[] = [
  {
      clientid: '98560945bdy',
      name: 'Winfred Njiru',
      expenses: 'ksh 25000',
      profit:"ksh 10000"
  
  },
  {
    clientid: '98560945bdy',
    name: 'Winfred Njiru',
    expenses: 'ksh 25000',
    profit:"ksh 10000"

},
{
  clientid: '98560945bdy',
  name: 'Winfred Njiru',
  expenses: 'ksh 25000',
  profit:"ksh 10000"

},
{
  clientid: '98560945bdy',
  name: 'Winfred Njiru',
  expenses: 'ksh 25000',
  profit:"ksh 10000"

},
];

const clientsColumns = [
  { label: "CLIENT ID", accessor: "clientid" },
  { label: "NAME", accessor: "name" },
  { label: "EXPENSES", accessor: "expenses" },
  { label: "PROFIT", accessor: "profit" },
];
export function ClientsTable() {
  return <Table data={cities} columns={clientsColumns} />;
}

export default function Cities() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (tabIndex:number) => {
    setActiveTab(tabIndex);
  };

  return (
    <>
      <div className="mt-8">
        <CitiesTabs handleTabChange={handleTabChange} activeTab={activeTab} />

        <Tab.Group as="div">
          <Tab.Panels>
            {tabs.map((tab, index) => (
              <Tab.Panel key={index}>
                <ClientsTable />
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

interface CitiesTabsProps {
  handleTabChange: (tabIndex: number) => void;
  activeTab: number;
}

export function CitiesTabs({ handleTabChange, activeTab }: CitiesTabsProps) {
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
