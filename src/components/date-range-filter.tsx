'use client';

import Filter from '@/json/params-filter.json';

type Props = {
  dateRange: string;
  setDateRange: Function;
};

export default function DateRangeFilter({ dateRange, setDateRange }: Props) {
  return (
    <div className="">
      <select
        name="dateRange"
        defaultValue={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        className="form-select w-36"
      >
        {Filter.dateRanges.map(({ name, value }) => {
          return (
            <option key={value} value={value}>
              {name}
            </option>
          );
        })}
      </select>
    </div>
  );
}
