import { FaHome } from "react-icons/fa"; // Importing a house icon from react-icons

export default function CompanyProfile() {
  return (
    <div className="pl-9">
      <div className="flex flex-row border-b border-gray-300">
        <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-60 mb-2  ">
          <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
            Public Profile
          </div>
          <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
            This will be displayed on your profile
          </div>
        </div>

        <div className="flex items-center  mt-6 mb-6 mr-24 bg-white border border-blue-500 rounded-md shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <div className="px-2 flex items-center text-gray-400">
            <FaHome size={18} />
          </div>
          <input
            type="text"
            placeholder="Truck Mate"
            className="form-input w-full py-1 outline-none placeholder-gray-400"
            style={{ height: "38px" }} // Adjust height as needed to align with the icon
          />
        </div>
      </div>
      <div className="flex flex-col border-b border-gray-300">
        <div className="flex flex-row">
          <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-60 mb-2  ">
            <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
              Phone Number{" "}
            </div>
            <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
              +254 725 146 071
            </div>
          </div>

          <div className="flex items-center  mt-6 mb-6 mr-24 bg-white border border-blue-500 rounded-md shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <div className="px-2 flex items-center text-gray-400">
              <FaHome size={18} />
            </div>
            <input
              type="text"
              placeholder="Truck Mate"
              className="form-input w-full py-1 outline-none placeholder-gray-400"
              style={{ height: "38px" }} // Adjust height as needed to align with the icon
            />
          </div>
        </div>

        <div className="flex flex-row">
          <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-60 mb-2  ">
            <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
              Country{" "}
            </div>
            <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
              Kenya{" "}
            </div>
          </div>

          <div className="flex mt-6 mb-6 ml-16 mr-24  bg-white border border-blue-500 rounded-md shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <div className="px-2 flex items-center text-gray-400">
              <FaHome size={18} />
            </div>
            <input
              type="text"
              placeholder="Truck Mate"
              className="form-input w-full py-1 outline-none placeholder-gray-400"
              style={{ height: "38px" }} // Adjust height as needed to align with the icon
            />
          </div>
        </div>

        <div className="flex flex-row">
          <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-60 mb-2  ">
            <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
              Timezone{" "}
            </div>
            <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
              Select your timezone{" "}
            </div>
          </div>

          <div className="flex  mt-6 mb-6 mr-24 bg-white border border-blue-500 rounded-md shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <div className="px-2 flex items-center text-gray-400">
              <FaHome size={18} />
            </div>
            <input
              type="text"
              placeholder="Truck Mate"
              className="form-input w-full py-1 outline-none placeholder-gray-400"
              style={{ height: "38px" }} // Adjust height as needed to align with the icon
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col justify-start items-start gap-2 mt-2 mr-60 mb-2  ">
          <div className="flex-grow-0 text-base font-bold text-left text-dark-blue font-outfit">
            Currency{" "}
          </div>
          <div className="flex-grow-0 mt-[4px] text-sm font- text-left text-gray-600 font-nunito">
            Select your Currency{" "}
          </div>
        </div>

        <div className="flex mt-6  mr-24 mb-6 bg-white border border-blue-500 rounded-md shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <div className="px-2 flex items-center text-gray-400">
            <FaHome size={18} />
          </div>
          <input
            type="text"
            placeholder="Truck Mate"
            className="form-input w-full py-1 outline-none placeholder-gray-400"
            style={{ height: "38px" }} // Adjust height as needed to align with the icon
          />
        </div>
      </div>
    </div>
  );
}
// mb-[36px]
