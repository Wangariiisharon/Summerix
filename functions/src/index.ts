import * as admin from 'firebase-admin';
import * as admins from './admins';
import * as clients from './clients';
import * as companies from './companies';
import * as drivers from './drivers';
import * as vehicles from './vehicles';

admin.initializeApp();
admin.firestore().settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true,
});

exports.adminsGroup = admins.group;
exports.clientsGroup = clients.group;
exports.companiesGroup = companies.group;
exports.driversGroup = drivers.group;
exports.vehiclesGroup = vehicles.group;
