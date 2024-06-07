import { DocumentData } from "firebase/firestore";

interface ExampleProps {
  heading: string;
  list: string[];
  action: any;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
export const Example: React.FC<ExampleProps> = ({ heading, list, action }) => {
  return (
    <div className="shadow-md bg-[#FFFFFF] rounded-md overflow-y-auto h-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center  mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              {heading}
            </h1>
          </div>
        </div>
        <div className="flow-root">
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0">
                <tbody>
                  {list.map((permission: string, index: number) => (
                    <tr key={index} className="bg-[#FAFAFB]">
                      <td
                        className={classNames(
                          index !== list.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        )}
                      >
                        {permission}
                      </td>
                      <td
                        className={classNames(
                          index !== list.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8"
                        )}
                        onClick={() => action(permission)}
                      >
                        <a
                          href="#"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Remove
                          <span className="sr-only">, {permission}</span>
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
    </div>
  );
};

interface AllPermissionsProps {
  heading: string;
  list: DocumentData[];
  action: any;
}
export const AllPermissions: React.FC<AllPermissionsProps & {}> = ({
  heading,
  list,
  action,
}) => {
  return (
    <div className="shadow-md bg-[#FFFFFF] rounded-md overflow-y-auto h-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              {heading}
            </h1>
          </div>
        </div>
        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0">
                <tbody>
                  {list.map((permission: any, index: any) => (
                    <tr key={permission.id} className="bg-[#FAFAFB] px-2">
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
                        <button
                          onClick={() => action(permission.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
