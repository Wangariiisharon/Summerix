import Image from "next/image";

const people = [
  {
    name: "Lynda Lynn",
    title: "$14,000",
    department: "",
    email: "",
    role: "$14,000",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Lynda Lynn",
    title: "$14,000",
    department: "",
    email: "",
    role: "$14,000",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Lynda Lynn",
    title: "$14,000",
    department: "",
    email: "",
    role: "$14,000",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Lynda Lynn",
    title: "$14,000",
    department: "",
    email: "",
    role: "$14,000",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

export default function ClientsOverView() {
  return (
    <>
      <div className=" grid lg:min-w-1/3 h-full max-h-[24]">
        <div className="space-y-6 ">
          <section aria-labelledby="applicant-information-title">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-2 sm:px-6 flex w-full items-center justify-between border-b border-gray-200 ">
                <h2
                  id="applicant-information-title"
                  className="text-xl font-bold leading-6"
                >
                  Clients
                </h2>
                <div className="text-sm bg-d-blue text-white px-2 py-1 rounded cursor-pointer">
                  See All
                </div>
              </div>
              <div className="px-4 pt-4 sm:px-6">
                <div className="text-base text-gray-500">Profit</div>
                <div className="text-lg font-extrabold">524K</div>
              </div>

              <div className=" px-4 py-1 sm:px-6">
                <div className=" ">
                  <div className=" overflow-x-auto w-full">
                    <div className="inline-block min-w-full py-2 align-middle ">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr className="text-gray-400 uppercase text-xs ">
                            <th
                              scope="col"
                              className=" pl-4 pr-3 text-left sm:pl-0"
                            >
                              Clients
                            </th>
                            <th scope="col" className="px-3 py-2  text-left">
                              Expenses
                            </th>
                            <th scope="col" className="px-3  text-left">
                              Profit
                            </th>
                            <th
                              scope="col"
                              className="px-3 text-left font-bold "
                            ></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {people.map((person, index) => (
                            <tr key={index} className="font-bold py-2">
                              <td className="whitespace-nowrap pl-4 pr-3 text-sm sm:pl-0 ">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    <Image
                                      className="h-10 w-10 rounded-full"
                                      src={person.image}
                                      alt={person.name}
                                      height={100}
                                      width={100}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="">{person.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3  text-sm ">
                                <div className="">{person.title}</div>
                              </td>
                              <td className="whitespace-nowrap px-3  text-sm ">
                                {person.role}
                              </td>

                              <td className="whitespace-nowrap px-3 text-sm">
                                <span
                                  className="inline-flex bg-pill-blue px-2
                                                               text-xs font-semibold leading-5 text-t-blue rounded cursor-pointer"
                                >
                                  View
                                </span>
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
          </section>
        </div>
      </div>
    </>
  );
}
