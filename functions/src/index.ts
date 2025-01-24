import * as admin from 'firebase-admin';
import * as accounts from './accounts';
import * as admins from './admins';
import * as clients from './clients';
import * as companies from './companies';
import * as drivers from './drivers';
import * as trips from './trips';
import * as vehicles from './vehicles';
import * as checkTripSchedules from './trip-Update-Schedule';

admin.initializeApp();
admin.firestore().settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true,
});

exports.accountsGroup = accounts.group;
exports.adminsGroup = admins.group;
exports.clientsGroup = clients.group;
exports.companiesGroup = companies.group;
exports.driversGroup = drivers.group;
exports.tripsGroup = trips.group;
exports.vehiclesGroup = vehicles.group;
exports.checkTripSchedules = checkTripSchedules.checkTripSchedules;
