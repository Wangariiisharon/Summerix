import { fbDb } from "@/firebase/configs";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import React, { useState } from "react";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { FormModal } from "@/components/Modals/FormModal";
import { Button } from "@/components/Buttons";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ViewDepatment from "./viewDepatment";

interface ViewMenuProps {
  departmentId: string;
  onDeactivate: (id: string) => void; // Callback function for handling deactivation
}

export default function ViewMenu({
  departmentId,
  onDeactivate,
}: ViewMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isRenameFormOpen, setIsRenameFormOpen] = useState(false);

  console.log(departmentId);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleRename = () => {
    // Open the RenameForm modal when Rename is clicked
    setIsRenameFormOpen(true);
  };

  const handleCancel = () => {
    // Open the RenameForm modal when Rename is clicked
    setIsRenameFormOpen(false);
  };
  const renameDepartment = async (newName: string) => {
    try {
      const departmentDocRef = doc(fbDb, "departments", departmentId);

      // Update the department's name field using setDoc
      await setDoc(departmentDocRef, { name: newName }, { merge: true });
      console.log("Department name updated successfully.");
      setIsRenameFormOpen(false); // Close the modal after renaming
    } catch (error) {
      console.error("Error updating department name:", error);
    }
  };

  const handleDeactivate = () => {
    // Call the onDeactivate callback to handle deactivation
    onDeactivate(departmentId);
    // Close the menu after deactivating
    setIsOpen(false);
  };

  return (
    <div className="fixed absolute left-2 top-0 mt-1 relative">
      <div className="menu-icon cursor-pointer" onClick={handleToggle}>
        {isOpen ? <RiCloseLine /> : <RiMenu3Line />}
      </div>
      {isOpen && (
        <ul className="flex flex-col menu absolute bg-white shadow-md p-2">
          <li className="cursor-pointer text-[#000000]">
            <Link
              href={`/Administration/Admins/manage_department/viewDepatment?id=${departmentId}`}
            >
              View
            </Link>
          </li>
          <li className="cursor-pointer text-[#000000]">
            {/* Call handleRename to open the RenameForm */}
            <button onClick={handleRename}>Rename</button>
          </li>
          <li>
            <button
              className="cursor-pointer text-[#000000]"
              onClick={handleDeactivate}
            >
              Deactivate
            </button>
          </li>
        </ul>
      )}
      {isRenameFormOpen && (
        <FormModal open={isRenameFormOpen} setOpen={setIsRenameFormOpen}>
          {/* Place your form elements inside the FormModal */}
          <div className="p-5">
            <div className="flex w-full h-full justify-between items-center mb-12">
              <div className="text-xl font-semibold ">Rename Department</div>
              <Button
                className="bg-red-50 h-12 w-12 flex items-center justify-center rounded-full"
                handleClick={handleCancel}
              >
                <XMarkIcon className="h-6 w-6 text-red-400" />
              </Button>
            </div>
            <label className="block">
              <label className="form-label">Name</label>
              <input
                type="text"
                placeholder="Enter new department name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-input bg-grey w-96"
              />
            </label>
            {/* <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={() => renameDepartment(newName)}
            >
              Save
            </button>  */}
            <div className="flex w-full justify-end mt-24 ">
              <Button
                className="text-blue text-xl mr-32"
                handleClick={renameDepartment}
              >
                Cancel
              </Button>
              {/* <button type='submit' >Save</button> */}
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={() => renameDepartment(newName)}
              >
                Save
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
