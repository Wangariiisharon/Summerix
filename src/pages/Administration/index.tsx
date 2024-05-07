import { Header } from "@/components/Headers";
import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import Admins from "./Admins/manage_admins/Admins";
import AdminsComponent from "./Admins";
import UsersComponent from "./Users";

import Cities from "../Operations/manage_cities/Cities";
import Vehicles from "../Operations/Vehicles/manage_vehicles/Vehicles";
import Drivers from "../Operations/manage_drivers/Drivers";
import Roles from "./Admins/manage_roles/Roles";
import Departments from "./Admins/manage_department/Departments";
import SiteLayout from "@/Layout/SiteLayout";
import Profile from "../Profile";
import HamburgerMenu from "@/components/hamburgerMenu";
import AssignRole from "./Admins/manage_roles/assignRole";

const tabs = [
  { name: "Company Profile", href: "#", current: false },
  { name: "User Management", href: "#", current: false },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function AdministrationComponent() {
  return (
    <SiteLayout>
      <div className=" bg-[#FAFAFB] flex flex-col">
        <div className="h-[70px] pl-[35px] bg-white flex justify-between w-full">
          <div className=" flex items-center">
            <h1 className="text-base font-semibold text-gray-800 mr-4 ml-4">
              Administration
            </h1>
          </div>
        </div>
        <div className="h-[134.6px] flex flex-row mb-2">
          <div className="w-32 h-32 mt-14 ml-8 mb-10 mr-8 rounded-lg shadow-lg border-4 shadow-custom bg-gradient-to-r from-brand-blue to-brand-red p-6 rounded-lg"></div>
          <div className="ml-4 flex flex-col mt-14">
            <h1 className="text-base font-semibold text-gray-800 mr-4 ml-4">
              Truck Mate Limited
            </h1>
            <p className="text-sm font-nunito text-gray-400">
              Update your company photo and details here.
            </p>
            <div className="mt-4 flex flex-row">
              <button className="w-[240px] h-[51px] flex flex-row items-center justify-center  text-white rounded bg-[#4FD1C5]">
                Update Photo
              </button>
              <button className="ml-4 w-[100px] h-[49px] flex flex-row items-center justify-center gap-2.5 px-30 py-19.5 rounded-4 border border-gray-border bg-light-bg">
                Reset
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="mt-10">
            <Tab.Group>
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
                  {/* <UsersComponent /> */}
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <AdminsComponent />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
