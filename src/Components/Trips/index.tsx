import {Header, HeaderBar} from "@/Components/Headers";
import DummyTable, {ClientsTable, TripsTable} from "@/Components/Table/Table";
import {Form} from "@/Components/Forms/Form";
import {Input, Submit} from "@/Components/Forms/input";
import {AddButton, Button} from "@/Components/Buttons";
import {ArrowDownTrayIcon, ChevronDownIcon, InboxArrowDownIcon, PlusIcon} from "@heroicons/react/24/solid";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {FormModal} from "@/Components/Modals/FormModal";
import {useState} from "react";


const Headers = [
    {
        name: "Overview",
        active: true
    },
    {
        name: "Upcoming Trips",
        active: false
    },
]
export default function TripsComponent() {
    const [open, setOpen] = useState(false)

    const handleSearch = () => {

    }
    const handleClick = () => {

    }
    const handleAddTrip = () => {
        setOpen(true)
    }
    const handleExport = () => {
    }
    const handleReset = () => {
        setOpen(false)
    }
    const handleSubmit = () => {
        //validate form
        setOpen(false)
        //submit form
    }

    return (
        <>
            <div>
                <Header heading='Trips'/>
                <div className='mt-8 flex justify-between'>
                    <div className='flex'>
                        <FilterBanner active={true} number={'76'} name={'All'}/>
                        <FilterBanner active={false} number={'76'} name='On Route'/>
                        <FilterBanner active={false} number={'76'} name='Waiting'/>
                        <FilterBanner active={false} number={'76'} name='Incomplete'/>
                        <FilterBanner active={false} number={'76'} name='Complete'/>
                    </div>
                    <div className='flex'>
                        <Button className='bg-white px-3 uppercase flex items-center rounded font-semibold' handleClick={handleClick}>
                            Nairobi,Kenya
                            <ChevronDownIcon className='ml-4 h-4 w-4'/>
                        </Button>

                        <Button className='ml-2 bg-white px-3 uppercase flex items-center rounded font-semibold' handleClick={handleClick}>
                        Today
                        <ChevronDownIcon className='ml-4 h-4 w-4'/>
                    </Button>

                    </div>

                </div>
                <div className='flex w-full items-center justify-between my-6'>
                    <Form handleSubmit={handleSearch}>
                        <Input type='text' name='search' placeholder='Search for track Delivery Status, destination'
                               id='search' label=''/>
                    </Form>

                    <div className='flex'>
                        <Button className='bg-d-green text-white text-sm flex w-[180px] h-[44px] items-center justify-center uppercase rounded'
                                handleClick={handleAddTrip}>
                            <>
                                <ArrowDownTrayIcon className='h-6 w-6 mr-2'/>
                                Export

                            </>
                        </Button>

                        <Button className='ml-4 bg-d-green text-white text-sm flex w-[180px] h-[44px] items-center justify-center uppercase rounded'
                                handleClick={handleAddTrip}>
                            <>
                                <PlusIcon className='h-6 w-6 mr-2'/>
                                Add New Trip
                            </>
                        </Button>
                    </div>
                </div>
                <HeaderBar headers={Headers}/>

                <TripsTable/>

            </div>
            <FormModal open={open} setOpen={setOpen}>
                <div className='p-8'>
                    <div className='flex w-full h-full justify-between items-center mb-12'>
                        <div className='text-xl font-semibold '>
                            New Trip
                        </div>
                        <Button className='bg-red-50 h-12 w-12 flex items-center justify-center rounded-full' handleClick={handleReset}>
                            <XMarkIcon className='h-6 w-6 text-red-400'/>
                        </Button>
                    </div>

                    <Form handleSubmit={handleSubmit}>
                        <div className=''>
                            <div className='flex w-full justify-between'>
                                <Input type='text' name='v_name' placeholder='' id='v_name' label='Vehicle Name*'/>
                                <Input type='text' name='v_type' placeholder='' id='v_type' label='Vehicle Type*'/>
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                                <Input type='text' name='r_date' placeholder='' id='r-date' label='Registration Date*'/>
                                <Input type='text' name='supplier' placeholder='' id='supplier' label='Supplier'/>
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                                <Input type='text' name='plate' placeholder='' id='plate' label='License Plate*'/>
                                <Input type='text' name='model' placeholder='' id='model' label='Model'/>
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                                <Input type='text' name='color' placeholder='' id='color' label='Color'/>
                                <Input type='text' name='budget' placeholder='' id='budget' label='Budget*'/>
                            </div>
                            <div className='flex w-full justify-between mt-8'>
                                <Input type='text' name='year' placeholder='' id='year' label='Car Year'/>
                            </div>
                            <div className='flex w-full justify-end mt-24 '>
                                <Button className='text-blue text-xl mr-32' handleClick={handleReset}>Reset</Button>
                                <Submit name="save" handleSubmit={handleSubmit}/>
                            </div>

                        </div>
                    </Form>
                </div>
            </FormModal>
        </>
    )
}

interface Props {
    active: boolean
    number: string
    name: string
}

export function FilterBanner({active, number, name}: Props) {
    return (
        <>
            <div
                className={`${active ? 'rounded-md bg-d-green text-white' : 'text-black bg-white'}  
                w-48 flex justify-between items-center h-14 pl-6 pr-4  mr-2 cursor-pointer font-bold`}>
                <div className=' '>
                    {name}
                </div>
                <div className={`${active ? 'bg-dd-green' : 'bg-grey'} w-12 text-center py-1 rounded`}>
                    {number}
                </div>
            </div>
        </>
    )

}
