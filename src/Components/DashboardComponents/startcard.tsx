import React from "react";

const StatCard = ({ title, value }: any) => (
  <div className="statCard">
    <p className="title">{title}</p>
    <p className="value">{value}</p>
  </div>
);

export default StatCard;
