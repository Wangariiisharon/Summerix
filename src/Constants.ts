const Constants = {
  description: '',
  imageURL: '',

  phoneRegExp: /\+\d{12}$/,
  defaultPageSize: 20,
  dateFormat: 'MMMM DD, YYYY',
  dateTimeFormat: 'DD/MM/YYYY HH:mm',

  // firebase collections
  fbAdmins: 'admins',
  fbClients: 'clients',
  fbCompanies: 'companies',
  fbDepartments: 'departments',
  fbDrivers: 'drivers',
  fbJobCards: 'jobcard',
  fbMaintenance: 'maintenance',
  fbNotifications: 'notifications',
  fbOrganisations: 'organizations',
  fbSettings: 'settings',
  fbSuppliers: 'suppliers',
  fbTrips: 'trips',
  fbUserNotifications: 'user_notifications',
  fbVehicleAllocations: 'vehicleAllocations',
  fbVehicles: 'vehicles',
};

export default Constants;
