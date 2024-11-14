import * as admin from 'firebase-admin';
import * as clients from './clients';

admin.initializeApp();
admin.firestore().settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true,
});

exports.clientsGroup = clients.group;
