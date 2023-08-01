import React from "react";
import Table from "./tables";

const vehicles: any[] = [
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
    {
        id: '98560945bdy',
        name: 'Ford F-150',
        status: 'Available',
        reg_date: '20021-02-11',
        supplier: 'Railway Lane',
        consumption: '80',
        trips: '3',
    },
];

const trips: any[] = [
    {
        trip_id: '98560945bdy',
        driver: 'David Mwangi',
        pickUp: 'Nairobi',
        dropOff: '20021-02-11',
        distance: 'Railway Lane',
        Duration: '80',
        tripCost: '3',
        status: 'Available',
    },
    {
        trip_id: '98560945bdy',
        driver: 'David Mwangi',
        pickUp: 'Nairobi',
        dropOff: '20021-02-11',
        distance: 'Railway Lane',
        Duration: '80',
        tripCost: '3',
        status: 'Available',
    },
    {
        trip_id: '98560945bdy',
        driver: 'David Mwangi',
        pickUp: 'Nairobi',
        dropOff: '20021-02-11',
        distance: 'Railway Lane',
        Duration: '80',
        tripCost: '3',
        status: 'Available',
    },
    {
        trip_id: '98560945bdy',
        driver: 'David Mwangi',
        pickUp: 'Nairobi',
        dropOff: '20021-02-11',
        distance: 'Railway Lane',
        Duration: '80',
        tripCost: '3',
        status: 'Available',
    },

];

const clients: any[] = [
    {
        clientId: '98560945bdy',
        name: 'David Mwangi',
        Expenpses: 'Nairobi',
        Profit: '20021-02-11',
        tipID: 'Railway Lane',
    },
    {
        clientId: '98560945bdy',
        name: 'David Mwangi',
        Expenpses: 'Nairobi',
        Profit: '20021-02-11',
        tipID: 'Railway Lane',
    },    
    {
        clientId: '98560945bdy',
        name: 'David Mwangi',
        Expenpses: 'Nairobi',
        Profit: '20021-02-11',
        tipID: 'Railway Lane',
    },
    {
        clientId: '98560945bdy',
        name: 'David Mwangi',
        Expenpses: 'Nairobi',
        Profit: '20021-02-11',
        tipID: 'Railway Lane',
    },
];

const vehicleColumns = [
  { label: "Vehicle ID", accessor: "id" },
  { label: "Name", accessor: "name" },
  { label: "Status", accessor: "status" },
  { label: "Registration Date", accessor: "reg_date" },
  { label: "Supplier", accessor: "supplier" },
  { label: "Fuel Consumptions", accessor: "consumption" },
  { label: "Trips Completed", accessor: "trips" },
];

const tripColumns = [
    { label: "TRIP ID", accessor: "id" },
    { label: "DRIVER", accessor: "driver" },
    { label: "PICK UP", accessor: "pickUp" },
    { label: "DROP OFF", accessor: "dropOff" },
    { label: "DISTANCE", accessor: "distance" },
    { label: "DURATION", accessor: "duration" },
    { label: "TRIP COST", accessor: "tripCost" },
    { label: "STATUS", accessor: "status" },
];

const clientColumns = [
    { label: "Clieint ID", accessor: "id" },
    { label: "Name", accessor: "id" },
    { label: "Expenses", accessor: "id" },
    { label: "Profit", accessor: "id" },
    { label: "TRIP ID", accessor: "id" },
    { label: "TRIP ID", accessor: "id" },
];

export function VehiclesTable() {
  return <Table data={vehicles} columns={vehicleColumns} />;
}

export function TripsTable() {
  return <Table data={trips} columns={tripColumns} />;
}

export function ClientsTable() {
  return <Table data={clients} columns={clientColumns} />;
}

