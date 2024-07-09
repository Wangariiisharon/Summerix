import { Chart } from "chart.js";

export const centerTextPlugin = {
  id: "centerText",
  afterDraw: (chart: any) => {
    const {
      ctx,
      chartArea: { top, bottom, left, right },
      data,
    } = chart;
    ctx.save();
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const totalVehicles = data.datasets[0].data.reduce(
      (a: any, b: any) => a + b,
      0
    );
    const text = `${totalVehicles}`;
    const textX = (left + right) / 2;
    const textY = (top + bottom) / 2;
    ctx.fillText(text, textX, textY - 10);
    ctx.font = "16px Arial text-lg";
    ctx.restore();
  },
};

Chart.register(centerTextPlugin);
