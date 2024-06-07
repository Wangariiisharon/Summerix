export function CardWithHeader(){
    return(
        <>
            <div className="w-1/2 mt-8 grid max-w-3xl lg:max-w-7xl mr-4">
                <div className="space-y-6 ">
                    {/* Description list*/}
                    <section aria-labelledby="applicant-information-title">
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 flex w-full items-center justify-between">
                                <h2 id="applicant-information-title" className="text-lg font-bold leading-6">
                                     Vehicle Overview
                                </h2>
                                <div className='text-sm'>
                                    This Week
                                </div>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}
