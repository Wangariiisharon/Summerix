// components/OnRouteVehiclesComponent.js
import React from "react";

const OnRouteVehiclesComponent = ({ data }: any) => (
  <div>
    <h3>On Route Vehicles</h3>
    <ul>
      {data.map((vehicle: any, index: any) => (
        <li key={index}>
          <span>{vehicle.name}</span> - <span>{vehicle.status}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default OnRouteVehiclesComponent;
