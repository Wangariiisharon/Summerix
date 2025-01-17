import * as Yup from 'yup';
import moment from 'moment';

export const MaintenanceFormSchema = () => {
  return Yup.object().shape({
    // vehicle: Yup.object().shape({
    //   regNumber: Yup.string().required('Vehicle reg. number is required.'),
    // }),
    vehicle: Yup.object().required('Vehicle is required.'),
    supplier: Yup.object().required('Supplier is required.'),
    jobCard: Yup.object().required('Supplier is required.'),
    // supplier: Yup.object().shape({
    //   regNumber: Yup.string().required('Supplier reg. number is required.'),
    // }),
    schedule: Yup.object().shape({
      startAt: Yup.date()
        .required('Start time is required.')
        .test('dates-test-1', 'Cannot be before today.', (value) => {
          const testDate = moment().startOf('day').toDate();
          return value ? moment(value, 'MM/DD/YYYY').toDate() >= testDate : true;
        }),
      endAt: Yup.date()
        .required('End time is required.')
        .test('dates-test-2', 'Should be after start time.', (value, context) => {
          const testDate = moment(context.parent.startAt, 'MM/DD/YYYY').toDate();
          return value ? moment(value, 'MM/DD/YYYY').toDate() >= testDate : true;
        }),
    }),

    status: Yup.string().required('Status is required.'),
    cost: Yup.number().required('Cost is required.'),
    // jobCard: Yup.object().shape({
    //   name: Yup.string().required('JobCard is required.'),
    // }),
  });
};
