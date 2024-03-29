import { Header } from "@/components/Headers";
import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import Admins from "./Admins/manage_admins/Admins";
import AdminsComponent from "./Admins";
import UsersComponent from "./Users";

import Cities from "../Operations/manage_cities/Cities";
import Vehicles from "./Users/manage_vehicles/Vehicles";
import Drivers from "../Operations/manage_drivers/Drivers";
import Roles from "./Admins/manage_roles/Roles";
import Departments from "./Admins/manage_department/Departments";
import SiteLayout from "@/Layout/SiteLayout";
import Profile from "../Profile";
import HamburgerMenu from "@/components/hamburgerMenu";
import AssignRole from "./Admins/manage_roles/assignRole";

const tabs = [
  { name: "Manage Users", href: "#", current: false },
  { name: "Company Profile", href: "#", current: false },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function AdministrationComponent() {
  return (
    <SiteLayout>
      <div className=" bg-[#FAFAFB] flex flex-col">
        <p className="text-lg font-nunito font-bold mt-2 ml-5">
          Administration
        </p>

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
                  <AdminsComponent />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <UsersComponent />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
