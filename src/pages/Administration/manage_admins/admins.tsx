
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import React from "react";
import { useState } from 'react';

const tabs = [
  { name: 'All' },
  { name: 'Active' },
  { name: 'InActive' },
];

const Headers = ['Id', 'Name', 'City', 'Phone', 'Status', 'Super Admin'];


interface Admin  {
    id: string;
    name: string;
    city: string;
    phone: string;
    active: boolean;
    superAdmin: boolean;
  };
  
interface AdminsProps {
    admins: Admin[];
  }
  

  export default function AdminsPage({ admins }: AdminsProps) {
    const router=useRouter()
    const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (index:number) => {
    setSelectedTab(index);
  };

  const handleAdd = () => {   
    router.push('./addAdmins');
 
  };
  
  return (
    <>
    <div className="mt-8">
      <div className="flex w-full justify-end">
        <div className="bg-white">
          <div className="flex justify-center">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`ui-selected:bg-d-green h-10 w-32 ui-not-selected:bg-white${
                  selectedTab === index ? 'ui-selected' : 'ui-not-selected'
                }`}
                onClick={() => handleTabChange(index)}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-8">
          {/* <SearchBar/> */}
        </div>
        <div className="ml-8">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleAdd}>
            Add Admin
          </button>
        </div>
      </div>

      <div className="mt-4">
      <AdminsTable admins={admins} />
      </div>
    </div>
    </>

  );
}



export function AdminsTable({ admins }: { admins: Admin[] }) {
  if (!admins || !Array.isArray(admins) || admins.length === 0) {
    return <div>No admins to display</div>;
  }

    return (
      <>
      <div className="table-container">
        <table className="table-fixed w-full">
          <thead>
            <tr className="">
              <th className="fixed left-30">Id</th>
              <th className="">Name</th>
              <th className="">City</th>
              <th className="">Phone</th>
              <th className="">Status</th>
              <th className="">Super Admin</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, index) => (
              <tr key={index} className="text-sm px-8 py-4">
                <td className="whitespace-nowrap ml-10 text-d-blue sm:pl-0">{admin.id}</td>
                <td>{admin.name}</td>
                <td>{admin.city}</td>
                <td>{admin.phone}</td>
                <td>{admin.active ? 'Active' : 'Inactive'}</td>
                <td>
                  <div className="h-16">
                    {admin.superAdmin ? (
                      <CheckCircleIcon className="h-8 w-8 ml-16 mt-2 text-d-green" />
                    // <i className="fa fa-check-circle-o h-8 w-8 text-d-green" aria-hidden="true"></i>

                    ) : (
                      <XCircleIcon className="h-8 w-8 text-crimson-red" />
                    // <i className="fa fa-times-circle-o bg-red-700" aria-hidden="true"></i>

                    )}
                  </div>
                </td>
              </tr>
            ))}   
          </tbody>
        </table>
      </div>
      </>
    );
  }
  