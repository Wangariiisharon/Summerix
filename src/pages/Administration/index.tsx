import { Header } from "@/components/Headers";
import { Tab } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Admins from "./Admins/manage_admins/Admins";

import CompanyProfile from "./Users/companyProfile";
import Avatar_profile_photo from "../../../public/Avatar_profile_photo.png";
import Cities from "../Operations/manage_cities/Cities";
import Vehicles from "../Operations/Vehicles/manage_vehicles/Vehicles";
import Drivers from "../Operations/manage_drivers/Drivers";
import Roles from "./Admins/manage_roles/Roles";
import Departments from "./Admins/manage_department/Departments";
import SiteLayout from "@/Layout/SiteLayout";
import Profile from "../Profile";
import HamburgerMenu from "@/components/hamburgerMenu";
import AssignRole from "./Admins/manage_roles/assignRole";
import Image from "next/image";

const tabs = [
  { name: "Company Profile", href: "#", current: false },
  { name: "User Management", href: "#", current: false },
  { name: "Departments", href: "#", current: false },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function AdministrationComponent() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Retrieve the saved tab index from local storage when the component mounts
    const savedIndex = localStorage.getItem("selectedTabIndex");
    if (savedIndex !== null) {
      setSelectedIndex(parseInt(savedIndex, 10));
    }
  }, []);

  return (
    <SiteLayout>
      <div className=" bg-[#FAFAFB] flex flex-col">
        <div className="flex flex-col justify-center items-start gap-2.5 mt-17.5 mb-13 py-2.5 pl-9 bg-white">
          <div className="flex-grow-0 flex justify-center items-center gap-2.5 py-2.5 px-4">
            <div className="flex-grow-0 font-custom text-custom-size flex justify-center font-semibold text-left text-custom-color">
              Administration
            </div>
          </div>
        </div>
        <div className="flex flex-row mt-[30px] pl-9">
          <div className="mt-custom1 mr-custom2 mb-custom3 rounded-custom shadow-custom border-custom border-white">
            <Image src={Avatar_profile_photo} alt={"logo"} priority={true} />
          </div>
          <div className="flex-grow-0 flex flex-col justify-start items-start gap-2.5 py-2.5 px-2.5 ml-[31px] ">
            <div className="flex-grow-0 flex flex-col justify-start items-start gap-1 p-0">
              <div className="flex-grow-0 font-outfit text-[21px]  text-base font-semibold text-left text-deep-blue">
                Truck Mate Limited
              </div>
              <div className="flex-grow-0 mt-1 font-nunito  text-[#6b6b73] text-[16px] font-semibold text-left text-cool-gray">
                Update your company photo and details here.
              </div>
            </div>
            <div className="flex flex row">
              <div className="flex-grow-0 flex justify-center items-center gap-2.5 py-2 px-6 rounded bg-teal-400">
                <div className="self-center flex-grow-0 object-contain">
                  <i className="fa fa-camera text-white" aria-hidden="true"></i>
                </div>
                <div
                  className="flex-grow-0 text-base font-normal text-left text-white"
                  style={{ lineHeight: "0.75" }}
                >
                  Upload a new photo
                </div>
              </div>
              <div className="flex-grow-0 flex justify-center items-center gap-2.5 py-2 px-8 rounded border border-gray-200 bg-gray-50 ml-[15px]">
                Reset
              </div>
            </div>
          </div>
        </div>
        <div className="mr-2 ml-[60px] text-xl font-semibold text-left text-[#030229] ">
          Account Settings
        </div>

        <div>
          <div className="pl-9 mt-[16px]">
            <Tab.Group>
              <Tab.List
                className="flex justify-start
               items-center gap-2.5 py-2.5 px-4 border-b border-gray-300 rounded-lg"
              >
                {tabs.map((tab, index) => (
                  <Fragment key={index}>
                    <Tab as={Fragment} key={tab.name}>
                      {({ selected }) => (
                        <button
                          className={`${
                            selected
                              ? "text-blue-600 font-semibold border-b-2  bg-grey-100"
                              : "text-gray-600 hover:text-gray-900"
                          } flex justify-center items-center py-2.5 px-4 rounded-t-lg transition-colors duration-300`}
                        >
                          {tab.name}
                        </button>
                      )}
                    </Tab>
                  </Fragment>
                ))}
              </Tab.List>
              <Tab.Panels className=" bg-[#FAFAFB] h-full">
                <Tab.Panel className="h-full">
                  <CompanyProfile />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Admins />
                </Tab.Panel>
                <Tab.Panel className="h-full">
                  <Departments />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
