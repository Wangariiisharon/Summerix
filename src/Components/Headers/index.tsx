import {Fragment} from 'react'
import {Disclosure, Menu, Transition} from '@headlessui/react'
import {Bars3Icon, BellIcon, XMarkIcon} from '@heroicons/react/24/outline'

interface Props {
    heading: string
}

export function Header({heading}: Props) {
    return (
        <>
            <div className='text-3xl font-bold'>{heading}</div>
        </>
    )
}

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

interface NavProps {
    name: string
    active: boolean
}

interface BarProps {
    headers: Array<NavProps>
}

export function HeaderBar({headers}: BarProps) {
    return (
        <Disclosure as="nav" className="bg-white shadow">
            {({open}) => (
                <>
                    <div className="mx-auto px-2 sm:px-6 lg:px-8 pt-4">
                        <div className="relative flex h-16 justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button */}
                                <Disclosure.Button
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-d-green">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true"/>
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="hidden sm:ml-0 sm:flex sm:space-x-8 justify-between ">
                                    {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                                    {headers.map((head, index) => {
                                        return (
                                            <Fragment key={index}>
                                                <a
                                                    className={`${head.active ? 'border-d-green text-d-green' : 'border-transparent text-black'} cursor-pointer inline-flex items-center border-b-2  px-1 pt-1 text-xl font-semibold`}
                                                >
                                                    {head.name}
                                                </a>
                                            </Fragment>
                                        )
                                    })
                                    }

                                </div>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 pb-4 pt-2">
                            {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}

                            {headers.map((head, index) => {
                                return (
                                    <Fragment key={index}>
                                        <Disclosure.Button
                                            as="a"
                                            href="#"
                                            className={`${head.active ? ' border-l-4 border-d-green bg-green-100 ' : ' border-transparent text-black'}  block py-2 pl-3 pr-4 text-base font-medium `}
                                        >
                                            {head.name}
                                        </Disclosure.Button>
                                    </Fragment>
                                )
                            })}

                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}


