const Constants = {
  description: 'Truck mate logistics',
  imageURL: '',

  phoneRegExp: /\+\d{12}$/,
  defaultPageSize: 25,
  dateFormat: 'MMMM DD, YYYY',
  dateTimeFormat: 'DD/MM/YYYY HH:mm',
  dateInputFormat: 'YYYY-MM-DDThh:mm',
  authCookieName: 'truck-mate-token',

  // firebase collections
  fbAccounts: 'accounts',
  fbCompanies: 'companies',
  fbAdmins: 'admins',
  fbClients: 'clients',
  fbDepartments: 'departments',
  fbExpenses: 'expenses',
  fbPermissions: 'permisions',
  fbDrivers: 'drivers',
  fbJobCards: 'jobcard',
  fbMaintenance: 'maintenance',
  fbNotifications: 'notifications',
  fbSettings: 'settings',
  fbSuppliers: 'suppliers',
  fbTrips: 'trips',
  fbVehicles: 'vehicles',
  fbClasses: 'classes',
};

export default Constants;
