import * as admin from 'firebase-admin';
import * as admins from './admins';
import * as clients from './clients';
import * as companies from './companies';

admin.initializeApp();
admin.firestore().settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true,
});

exports.adminsGroup = admins.group;
exports.clientsGroup = clients.group;
exports.companiesGroup = companies.group;
