import * as admin from 'firebase-admin';
import * as accounts from './accounts';
import * as admins from './admins';
import * as companies from './companies';


admin.initializeApp();
admin.firestore().settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true,
});

exports.accountsGroup = accounts.group;
exports.adminsGroup = admins.group;
exports.companiesGroup = companies.group;
