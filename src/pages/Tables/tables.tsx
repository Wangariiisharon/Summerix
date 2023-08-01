import { DeleteBtn, EditBtn } from "../Button";
import { Fragment, ReactNode } from "react";


interface Column {
  label: string;
  accessor: string;
}

interface Props {
  data: any[];
  columns: Column[];
}

export default function Table({ data, columns }: Props) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.accessor}
                      scope="col"
                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0"
                  >
                    <span className="sr-only"></span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="my-4">
                    {columns.map((column) => (
                      <td
                        key={column.accessor}
                        className="whitespace-nowrap px-2 pt-4"
                      >
                        {item[column.accessor]}
                      </td>
                    ))}
                    <td className="relative whitespace-nowrap pt-6 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 flex justify-around">
                      {/* Replace EditBtn and DeleteBtn with the appropriate components */}
                      {/* <EditBtn />
                      <DeleteBtn /> */}
                      {/* Instead of rendering buttons directly, render your appropriate Edit and Delete components here */}
                      {/* For example:
                          <button onClick={() => handleEdit(item)}>Edit</button>
                          <button onClick={() => handleDelete(item)}>Delete</button>
                      */}
                      <div className="h-12"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
