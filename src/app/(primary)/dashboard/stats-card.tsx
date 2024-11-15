import { ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  children: ReactNode;
  classNames?: string;
};

export default function StatsCard({
  label,
  value,
  classNames,
  children,
}: Props) {
  return (
    <div className={`${classNames || "bg-white border-b-4"}`}>
      <div className="p-4 flex items-center justify-between gap-5">
        <div className="grid gap-2">
          <div className="text-2xl font-bold text-gray-600">{value}</div>
          <div className="text-gray-400 text-sm">{label}</div>
        </div>
        <div className="p-3 rounded-full bg-teal-100 text-teal-500 text-md">
          <div className="flex items-center justify-center h-8 w-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
