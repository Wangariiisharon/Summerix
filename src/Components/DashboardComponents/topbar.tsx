import React from "react";
import StatCard from "./startcard";

const TopBar = () => (
  <div className="topBar">
    <StatCard title="Total Sales" value="385k" />
    <StatCard title="Orders" value="1,582" />
    <StatCard title="Revenue" value="₹52.3k" />
    <StatCard title="Customers" value="1,200" />
  </div>
);

export default TopBar;
