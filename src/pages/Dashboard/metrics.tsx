export default function MetricCard({ value, label, icon, lineColor }: any) {
  return (
    <div
      className="bg-white border-b-[3px]"
      style={{ borderBottomColor: lineColor || "red" }}
    >
      <div className="flex flex-row pt-[20px] pb-[20px]">
        <div className="flex flex-col ml-[26px]  ">
          <div className="text-sm font-bold  pr-[26px]">{value}</div>
          <div className="font-outfit text-xs font-medium text-[#787878] mt-[4px]">
            {label}
          </div>
        </div>
        <div className="ml-[40px]">
          <img className="w-[40px] h-[40px] mr-[26px]" src={icon} alt={label} />
        </div>
      </div>
    </div>
  );
}
