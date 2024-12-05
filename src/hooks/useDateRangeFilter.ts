import { PARAMS_FILTER } from '@/models/params-filter';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface Props {
  dateRange: string;
  filterByDate?: string;
}

function useDateRangeFilter({ dateRange, filterByDate }: Props) {
  const [params, setParams] = useState<PARAMS_FILTER>();

  useEffect(() => {
    switch (dateRange) {
      case 'today':
        setParams({
          dateRange: 'Today',
          filterByDate: filterByDate || 'dateCreated',
          startDate: moment().startOf('day').toDate(),
          endDate: moment().endOf('day').toDate(),
        });
        break;

      case 'yesterday':
        setParams({
          dateRange: 'Yesterday',
          filterByDate: filterByDate || 'dateCreated',
          startDate: moment().subtract(1, 'days').startOf('day').toDate(),
          endDate: moment().subtract(1, 'days').endOf('day').toDate(),
        });
        break;

      case 'thisWeek':
        setParams({
          dateRange: 'This Week',
          filterByDate: filterByDate || 'dateCreated',
          startDate: moment().startOf('week').toDate(),
          endDate: moment().endOf('week').toDate(),
        });
        break;

      case 'thisMonth':
        setParams({
          dateRange: 'This Month',
          filterByDate: filterByDate || 'dateCreated',
          startDate: moment().startOf('month').toDate(),
          endDate: moment().endOf('month').toDate(),
        });
        break;

      case 'thisYear':
        setParams({
          dateRange: 'This Year',
          filterByDate: filterByDate || 'dateCreated',
          startDate: moment().startOf('year').toDate(),
          endDate: moment().endOf('year').toDate(),
        });
        break;

      case 'lastMonth':
        setParams({
          dateRange: 'Last Month',
          filterByDate: filterByDate || 'dateCreated',
          startDate: moment().subtract(1, 'months').startOf('month').toDate(),
          endDate: moment().subtract(1, 'months').endOf('month').toDate(),
        });
        break;

      case 'last3Months':
        setParams({
          dateRange: 'Last 3 Months',
          filterByDate: filterByDate || 'dateCreated',
          startDate: moment().subtract(3, 'months').startOf('month').toDate(),
          endDate: moment().subtract(1, 'months').endOf('month').toDate(),
        });
        break;

      case 'last6Months':
        setParams({
          dateRange: 'Last 6 Months',
          filterByDate: filterByDate || 'dateCreated',
          startDate: moment().subtract(6, 'months').startOf('month').toDate(),
          endDate: moment().subtract(1, 'months').endOf('month').toDate(),
        });
        break;

      case 'lastYear':
        setParams({
          dateRange: 'Last Year',
          filterByDate: filterByDate || 'dateCreated',
          startDate: moment().subtract(1, 'years').startOf('year').toDate(),
          endDate: moment().subtract(1, 'years').endOf('year').toDate(),
        });
        break;

      default:
        setParams({
          dateRange: 'All Data',
          filterByDate: filterByDate || 'dateCreated',
          startDate: null,
          endDate: null,
        });
        break;
    }
  }, [dateRange, filterByDate]);

  return params;
}

export default useDateRangeFilter;
