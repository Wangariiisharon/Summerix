export default function MetricCard({ value, label, icon, lineColor }: any) {
  return (
    <div
      className={`w-[371px] h-[70px] sm:w-auto md:flex-none px-2 border-b-[3px] bg-white flex flex-row ${
        lineColor ? `border-[${lineColor}]` : "border-red"
      }`}
    >
      <div className="flex flex-col">
        <div className="text-sm font-bold mt-2">{value}</div>
        <div className="w-[200px] mt-2 opacity-70 font-outfit text-xs font-medium text-[#787878]">
          {label}
        </div>
      </div>
      <img className="w-[40px] h-[40px]" src={icon} alt={label} />
    </div>
  );
}
