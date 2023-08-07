import SiteLayout from "@/Layout/SiteLayout";
import AdministrationComponent from "@/components/Administration";

export default function Administration() {
    return (
        <>
            <SiteLayout>
                <>
                    <AdministrationComponent/>
                </>
            </SiteLayout>
        </>
    )
}
import { Component, useState } from 'react';
import Seo from "@/components/Seo";
import DashLayout from "@/components/DashboardLayout/DashboardLayout";
import Link from "next/link";
import  AdminsPage,{AdminsTable } from "./manage_admins/admins";
import  Cities  from "./manage_clients/clients";
import Vehicles from "./manage_vehicles/vehicles";
import Drivers from "./manage_drivers/drivers";
import Roles from "./manage_roles/roles";
import Department from "./manage_department/department";


const tabs = [
  { name: 'Manage Admins', component: AdminsPage }, 
  { name: 'Manage Cities', component: Cities }, 
  { name: 'Manage Vehicles', component: Vehicles },
  { name: 'Manage Driver', component: Drivers },
  { name: 'Manage Role', component: Roles },
  { name: 'Manage Department', component: Department },

];

export  function AdministrationPage() { 
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
