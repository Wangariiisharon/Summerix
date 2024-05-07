// components/ListTableComponent.js
import React from "react";

const ListTableComponent = ({ data }: any) => (
  <div>
    <h3>Best Drivers</h3>
    <ul>
      {data.map((driver: any, index: any) => (
        <li key={index}>
          {driver.name} - {driver.miles} miles
        </li>
      ))}
    </ul>
  </div>
);

export default ListTableComponent;
