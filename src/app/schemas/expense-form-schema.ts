import * as Yup from 'yup';

export const ExpenseFormSchema = () => {
  return Yup.object().shape({
    name: Yup.string().trim().required('Expense name is required.'),
    amount: Yup.number().required('Amount is required.').positive('Amount must be positive.'),
    category: Yup.string().trim().required('Category is required.'),
    date: Yup.date().required('Date is required.'),
  });
};
