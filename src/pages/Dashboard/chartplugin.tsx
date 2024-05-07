// import { Doughnut } from "react-chartjs-2";
// import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

// ChartJS.register(ArcElement, Tooltip);

// const centerTextPlugin = {
//   id: "centerText",
//   afterDraw: (chart: {
//     ctx: any;
//     chartArea: { top: any; bottom: any; left: any; right: any };
//     data: any;
//   }) => {
//     const {
//       ctx,
//       chartArea: { top, bottom, left, right },
//       data,
//     } = chart;
//     ctx.save();
//     ctx.font = "bold 24px Arial";
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     const totalVehicles = data.datasets[0].data.reduce(
//       (a: any, b: any) => a + b,
//       0
//     );
//     const text = `${totalVehicles}`;
//     const textX = (left + right) / 2;
//     const textY = (top + bottom) / 2;
//     ctx.fillText(text, textX, textY - 10); // Adjust text position as needed
//     ctx.font = "16px Arial";
//     ctx.fillText("Total Vehicles", textX, textY + 20);
//     ctx.restore();
//   },
// };

// ChartJS.register(centerTextPlugin);

import React from "react";

export default function chartplugin() {
  return <div>chartplugin</div>;
}
