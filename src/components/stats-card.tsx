import { ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  children: ReactNode;
  classNames?: string;
  suffix?: string;
};

export default function StatsCard({ label, suffix, value, classNames, children }: Props) {
  return (
    <div className={`${classNames || 'border-b-4 bg-white'}`}>
      <div className="flex items-center justify-between gap-5 p-4">
        <div className="grid gap-2">
          <div className="text-2xl font-bold text-gray-600">
            {value}
            {suffix}
          </div>
          <div className="text-sm text-gray-400">{label}</div>
        </div>
        <div className="text-md rounded-full bg-teal-100 p-3 text-teal-500">
          <div className="flex h-8 w-8 items-center justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
