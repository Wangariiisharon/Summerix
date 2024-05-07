// components/DataTableComponent.js
import React from "react";

const DataTableComponent = ({ data }: any) => (
  <table>
    <thead>
      <tr>
        <th>Client Name</th>
        <th>Revenue</th>
        <th>Profit</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item: any, index: any) => (
        <tr key={index}>
          <td>{item.clientName}</td>
          <td>{item.revenue}</td>
          <td>{item.profit}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default DataTableComponent;
