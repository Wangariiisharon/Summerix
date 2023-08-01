import { Component, useState } from 'react';
import Seo from "@/components/Seo";
import DashLayout from "@/components/DashboardLayout/DashboardLayout";
import Link from "next/link";
import  { AdminsPage,AdminsTable } from "./admins";
import  Cities  from "./clients";
import Vehicles from "./vehicles";
import Drivers from "./drivers";
import Roles from "./roles";
import Department from "./department";


const tabs = [
  { name: 'Manage Admins', component: AdminsPage }, 
  { name: 'Manage Cities', component: Cities }, 
  { name: 'Manage Vehicles', component: Vehicles },
  { name: 'Manage Driver', component: Drivers },
  { name: 'Manage Role', component: Roles },
  { name: 'Manage Department', component: Department },

];

export default function AdministrationPage() { 
  const admins=[{
    id: '789797',
    name: 'Brian Andy',
    city: 'Nairobi, Kenya',
    phone: '+254710607738',
    active: true,
    superAdmin: true,
  },
  {
    id: '789797',
    name: 'Brian Andy',
    city: 'Nairobi, Kenya',
    phone: '+254710607738',
    active: true,
    superAdmin: true,
  },
  {
    id: '789797',
    name: 'Brian Andy',
    city: 'Nairobi, Kenya',
    phone: '+254710607738',
    active: false,
    superAdmin: true,
  },
  {
    id: '789797',
    name: 'Brian Andy',
    city: 'Nairobi, Kenya',
    phone: '+254710607738',
    active: false,
    superAdmin: true,
  },
]
 
  
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main>
      <Seo title="Admin" />
      <DashLayout>
        <div className="">
          <p className="fixed top-10 p-4 ml-0.5">Administration</p>
          <div className='mt-16'>
            <div className='w-full flex justify-around  mb-3'>
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className={`ui-selected:border-b-4 border-d-green outline-none ui-selected:text-d-green text-sm font-semibold uppercase p-6
              ${index === activeTab ? 'ui-selected' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            <div className='h-full flex flex-col'>
            {tabs.map((tab, index) => (
              <div className="h-full text-sm" key={index} hidden={index !== activeTab}>
              <tab.component admins={admins} />
             </div>
              ))}

            </div>
          </div>
        </div>
      </DashLayout>
    </main>
  );
}
