import { PlusIcon } from "@heroicons/react/24/solid";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/lib/utils.service";
import { ReactNode } from "react";

interface Props {
  className: string;
  handleClick: Function | undefined;
  children: ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
}

export function Button({ className, handleClick, children, type }: Props) {
  const click = () => {
    if (handleClick) handleClick();
  };
  return (
    <>
      <button type={type} onClick={click} className={classNames(className)}>
        {children}
      </button>
    </>
  );
}

interface AddBtnProps {
  name: string;
  handleAddClick: Function;
}

export function AddButton({ name, handleAddClick }: AddBtnProps) {
  return (
    <>
      <Button
        className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center py-4 px-4"
        handleClick={handleAddClick}
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        {name}
      </Button>
    </>
  );
}
interface NewButtonProps {
  className: string;
  handleClick: Function | undefined;
  handleOpenModal: Function | undefined;
  children: ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
}

export function NewButton({
  className,
  handleClick,
  children,
  type,
  handleOpenModal,
}: NewButtonProps) {
  const click = () => {
    if (handleClick) handleClick();
  };
  return (
    <>
      <button type={type} onClick={click} className={classNames(className)}>
        {children}
      </button>
    </>
  );
}
interface AddProps {
  name: string;
  handleAddClick: Function;
  handleModalClick: Function;
}

export function AddButtons({
  name,
  handleAddClick,
  handleModalClick,
}: AddProps) {
  return (
    <>
      <NewButton
        className="rounded bg-d-green w-[160px] h-8 uppercase text-white font-semibold flex items-center py-4 px-4"
        handleClick={handleAddClick}
        handleOpenModal={handleModalClick}
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        {name}
      </NewButton>
    </>
  );
}

export function EditBtn() {
  return (
    <>
      <Button
        className="h-8 w-8 bg-light-green flex items-center justify-center"
        handleClick={undefined}
      >
        <PencilIcon className="h-4 w-4 " />
      </Button>
    </>
  );
}

export function DeleteBtn() {
  return (
    <>
      <Button
        handleClick={undefined}
        className="h-8 w-8 bg-red-200 flex items-center justify-center"
      >
        <TrashIcon className="h-4 w-4 " />
      </Button>
    </>
  );
}
