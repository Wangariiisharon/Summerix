const Constants = {
  description: 'LaunchKit Saas',
  imageURL: '',

  phoneRegExp: /\+\d{12}$/,
  defaultPageSize: 25,
  dateFormat: 'MMMM DD, YYYY',
  dateTimeFormat: 'DD/MM/YYYY HH:mm',
  dateInputFormat: 'YYYY-MM-DDThh:mm',
  authCookieName: 'summerix-token',

  // firebase collections
  fbAccounts: 'accounts',
  fbCompanies: 'companies',
  fbAdmins: 'admins',
  fbDepartments: 'departments',
};

export default Constants;
