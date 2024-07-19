import { Button } from "@/components/Buttons";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";
import { FormModal } from "@/components/Modals/FormModal";
import { Field, Formik, Form } from "formik";
import { Tab } from "@headlessui/react";
import firebaseApp, { fbDb } from "@/firebase/configs";
import {
  getDocs,
  collection,
  DocumentData,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  query,
  where,
  getFirestore,
  onSnapshot,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { format } from "date-fns";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/components/Authentication/AuthProvider";
import Pending from "./pending";
import * as Yup from "yup";

interface MaintenanceTableProps {
  selectedTab: number;
  maintananceList: DocumentData;
  isSuperAdmin: boolean;
  handleCheckboxClick: any;
  checkboxState: any;
}

export default function MaintananceTable({
  selectedTab,
  maintananceList = [],
}: MaintenanceTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;
  const totalTrips = maintananceList.length;
  const totalPages = Math.ceil(totalTrips / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentDate = new Date();

  if (!maintananceList || maintananceList.length === 0) {
    return <div>No maintenance data available.</div>;
  }

  const filteredApprovedMaintenance = maintananceList.filter(
    (maintenance: { status: string }) => maintenance.status === "Approved"
  );

  const filteredMaintenance = filteredApprovedMaintenance.filter(
    (maintenance: any) => {
      const maintenanceDate = new Date(maintenance?.date?.seconds * 1000);

      if (selectedTab === 0) {
        return maintenanceDate > currentDate;
      } else if (selectedTab === 1) {
        return maintenanceDate < currentDate;
      }

      return true;
    }
  );
  const visibleClasses = filteredMaintenance.slice(startIndex, endIndex);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const pageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages = [0, 1, 2, 3, "...", totalPages - 1];
    }
    return pages;
  };

  return (
    <>
      <div className="ml-4 px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    ></th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      VEHICLE
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      DATE
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      JOB CARDS
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      REQUESTED BY
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      COST
                    </th>

                    <th
                      scope="col"
                      className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0"
                    >
                      <span className="sr-only"></span>
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-[#FAFAFB]">
                  {visibleClasses.map((maintenance: any, index: any) => {
                    const { seconds } = maintenance.date;
                    const updatedDate = new Date(seconds * 1000);

                    return (
                      <Fragment key={index}>
                        <div className="w-full mb-2 font-nunito font-regular"></div>
                        <tr key={maintenance.id} className="hover:bg-gray-100">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            <span className="fa-stack fa-lg">
                              <i
                                className="fa fa-circle fa-stack-2x text-[#F2F2F2]"
                                aria-hidden="true"
                              ></i>
                              <i
                                className="fa fa-truck fa-stack-1x fa-inverse text-[#0C0C0C]"
                                aria-hidden="true"
                              ></i>
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {maintenance.vehicle}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {format(updatedDate, "MM/dd/yy")}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {maintenance.job_cards}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {maintenance.requested_by}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {maintenance.cost}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-[#777E96]">
                            {maintenance.status}
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => handlePageClick(0)}
            disabled={currentPage === 0}
          >
            {"<<"}
          </button>
          {pageNumbers().map((num, index) => {
            if (typeof num === "number") {
              return (
                <button key={index} onClick={() => handlePageClick(num)}>
                  {num + 1}
                </button>
              );
            } else {
              return <span key={index}>...</span>;
            }
          })}
          <button
            onClick={() => handlePageClick(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
          >
            {">>"}
          </button>
        </div>
      </div>
    </>
  );
}
