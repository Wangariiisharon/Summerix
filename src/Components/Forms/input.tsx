import {ExclamationCircleIcon} from '@heroicons/react/20/solid'
import {Button} from "@/components/Buttons";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";

interface inputProps {
    type: string
    name: string
    placeholder: string
    id: string
    label: string
}

export function Input({type, name, id, placeholder, label}: inputProps) {
    return (
        <div className='max-w-sm w-96'>
            <label htmlFor="email" className="block text-lg font-medium leading-6 text-gray-400">
                {label}
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
                <input
                    type={type}
                    name={name}
                    id={id}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 bg-grey
                      placeholder:text-gray-400 focus:ring-2 focus:ring-inset h-[52px] p-2
                    focus:ring-light-green  sm:leading-6"
                    placeholder={placeholder}
                />
                <div className="!hidden pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true"/>
                </div>
            </div>
            <p className="mt-2 text-sm text-red-600 hidden" id="email-error">
                {  //todo errors
                }
            </p>
        </div>
    )
}

interface submitProps {
    name: string
    handleSubmit: Function
}

export function Submit({name, handleSubmit}: submitProps) {
    return (
        <>
            <Button className='rounded-lg bg-d-blue w-[180px] h-[48px] text-xl text-white capitalize'
                    handleClick={handleSubmit} type={"submit"}>
                {name}
            </Button>
        </>
    )
}
// components/Forms/input.js
import React from 'react';

const SearchBar = ({ placeholder, value, onChange }:any) => {
  return (
    <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="searchbar bg-white"
    />
  );
};

export default SearchBar;


