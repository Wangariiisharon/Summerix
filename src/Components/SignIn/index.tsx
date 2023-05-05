import Image from "next/image";
import truckImage from '../../../public/truck.png'
import {useRouter} from "next/router";
import {FormEvent} from "react";
import {DarkLogo} from "@/Components/images";

export default function SignInComponent(){
    const router = useRouter()
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        router.push('/Dashboard')
    }
    return (
        <>
            <div className='max-w-7xl flex flex-col mx-auto justify-center min-h-screen'>
                <div className="flex min-h-full">

                    <div className="relative hidden w-0 flex-1 lg:block">
                        <div className="absolute inset-0 h-full w-full  ">
                            <Image src={truckImage} alt={'truck'} className='w-[500px] mx-auto'/>
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                        <div className="mx-auto w-full max-w-sm lg:w-96">
                            <div>
                                <DarkLogo/>
                                <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Log in to your account</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Welcome Back

                                </p>
                            </div>

                            <div className="mt-8">


                                <div className="mt-6">
                                    <form onSubmit={handleSubmit} method="POST" className="space-y-6">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                                Email address
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                                Password
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    autoComplete="current-password"
                                                    required
                                                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    id="remember-me"
                                                    name="remember-me"
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                />
                                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                                    Remember me
                                                </label>
                                            </div>

                                            <div className="text-sm">
                                                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                                    Forgot your password?
                                                </a>
                                            </div>
                                        </div>

                                        <div>
                                            <button
                                                type="submit"
                                                className="flex w-full h-12 items-center justify-center rounded-md bg-d-blue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                            >
                                                Sign in
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>
    )
}
