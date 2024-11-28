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
  fbAdmins: 'admins',
  fbClients: 'clients',
  fbCompanies: 'companies',
  fbDepartments: 'departments',
  fbPermissions: 'permisions',
  fbDrivers: 'drivers',
  fbJobCards: 'jobcard',
  fbMaintenance: 'maintenance',
  fbNotifications: 'notifications',
  fbSettings: 'settings',
  fbSuppliers: 'suppliers',
  fbTrips: 'trips',
  fbVehicles: 'vehicles',
};

export default Constants;
