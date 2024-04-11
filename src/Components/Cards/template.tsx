import { DocumentData } from "firebase/firestore";

interface ExampleProps {
  heading: string;
  list: DocumentData[];
}

// export const Example: React.FC<ExampleProps> = ({ heading, list }) => {
//   return (
//     <div className="shadow-md bg-[#FFFFFF] w-2/5 rounded-md h-64 px-2 py-2">
//       <div className="flex justify-between">
//         <div className="sm:flex-auto">
//           <h1 className="text-base font-semibold leading-6 text-gray-900 sticky">
//             {heading}
//           </h1>
//         </div>
//         <div className="mt-4 lg sm:ml-16 sm:mt-0 sm:flex-none">
//           <button
//             type="button"
//             className="block rounded-md bg-[#4FD1C5] px-3 py-1 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//           >
//             Add +
//           </button>
//         </div>
//       </div>
//       <div
//         className="overflow-x-auto"
//         style={{ maxHeight: "calc(100vh - 200px)" }}
//       >
//         <table className="w-full divide-y divide-gray-300">
//           <thead className="sticky top-0 bg-white">
//             <tr>
//               <th className="whitespace-nowrap py-1 px-1 text-sm font-medium text-gray-900">
//                 Name
//               </th>
//               <th className="whitespace-nowrap py-1 px-1 text-right text-sm font-medium">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 bg-white">
//             {list.map((permission, index) => (
//               <tr key={index} className="bg-[#FAFAFB]">
//                 <td className="whitespace-nowrap py-1 px-1 text-sm font-medium text-gray-900">
//                   {permission.name}
//                 </td>
//                 <td className="whitespace-nowrap py-1 px-1 text-right text-sm font-medium">
//                   <a href="#" className="text-red-600 hover:text-red-900">
//                     <span className="fa-stack fa-lg">
//                       <i className="fa fa-square fa-stack-2x"></i>
//                       <i className="fa fa-times fa-stack-1x fa-inverse"></i>
//                     </span>
//                   </a>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };import { DocumentData } from "firebase/firestore";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Example: React.FC<ExampleProps> = ({ heading, list }) => {
  const isPermissions = heading === "Permissions";

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {heading}
          </h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {isPermissions ? (
            <button
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full border-separate border-spacing-0">
              <tbody>
                {list.map((permission: any, index: any) => (
                  <tr key={index} className="bg-[#FAFAFB]">
                    <td
                      className={classNames(
                        index !== permission.length - 1
                          ? "border-b border-gray-200"
                          : "",
                        "whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      )}
                    >
                      {permission.name}
                    </td>
                    <td
                      className={classNames(
                        index !== permission.length - 1
                          ? "border-b border-gray-200"
                          : "",
                        "relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8"
                      )}
                    >
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {isPermissions ? "Add" : "Edit"}
                        <span className="sr-only">, {permission.name}</span>
                      </a>
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
};
