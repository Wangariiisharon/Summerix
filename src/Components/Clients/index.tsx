import {Header} from "@/components/Headers";
import {Button} from "@/components/Buttons";
import {ArrowDownTrayIcon, ChevronDownIcon, PlusIcon} from "@heroicons/react/24/solid";
import {Form} from "@/components/Forms/Form";
import {Input} from "@/components/Forms/input";
import {SmallCard} from "@/components/Cards/SmallCard";
import DummyTable, {ClientsTable} from "@/components/Table/Table";
import {Fragment} from "react";


const cards = [
    {amount: '409.66K', href: '#', icon: '/icons/lightCashIcon.png', name: 'Paid by Clients'},
    {amount: '136.98K', href: '#', icon: '/icons/lightCashIcon.png', name: 'Total Expenses'},
    {amount: '1000', href: '#', icon: '/icons/lightCashIcon.png', name: 'Loads'},
    {amount: '136.98K', href: '#', icon: '/icons/lightCashIcon.png', name: 'Profit'}
]

export default function ClientsComponent() {
    const handleClick = () => {
    }
    const handleSearch = () => {
    }
    const handleExport = () => {
    }
    return (
        <>
            <div>
                <div className='flex items-center justify-between'>
                    <Header heading='Clients'/>
                    <div className='flex'>
                        <Button className='bg-white px-3 py-3 uppercase flex items-center rounded font-semibold'
                                handleClick={handleClick}>
                            Nairobi,Kenya
                            <ChevronDownIcon className='ml-4 h-4 w-4'/>
                        </Button>

                        <Button className='ml-2 bg-white px-3 py-3 uppercase flex items-center rounded font-semibold'
                                handleClick={handleClick}>
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
                        <Button
                            className='bg-d-green text-white text-sm flex w-[180px] h-[44px] items-center justify-center uppercase rounded'
                            handleClick={handleExport}>
                            <>
                                <ArrowDownTrayIcon className='h-6 w-6 mr-2'/>
                                Export
                            </>
                        </Button>
                    </div>
                </div>

                <div className='flex w-full items-center justify-evenly'>
                    {cards.map((card, index) => {
                        return (
                            <Fragment key={index}>
                                <SmallCard name={card.name} icon={'/icons/lightCashIcon.png'} amount={card.amount}/>
                            </Fragment>
                        )
                    })}
                </div>
                <ClientsTable/>
            </div>

        </>
    )
}
