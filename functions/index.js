// const functions = require('firebase-functions');
// const admin = require('firebase-admin');

// admin.initializeApp();

// exports.sendNotificationOnNewMaintenance = functions.firestore
//   .document('maintenance/{maintenanceId}')
//   .onCreate(async (snapshot, context) => {
//     const maintenanceData = snapshot.data();

//     const querySnapshot = await admin.firestore().collection('admins').get();

//     const tokens = querySnapshot.docs.map(doc => doc.data().fcmToken);

//     const payload = {
//       notification: {
//         title: 'New Maintenance Request',
//         body: `A new maintenance request has been scheduled for ${maintenanceData.vehicle}`,
//       },
//     };

//     try {
//       const response = await admin.messaging().sendToDevice(tokens, payload);
//       console.log('Successfully sent notification:', response);
//     } catch (error) {
//       console.error('Error sending notification:', error);
//     }
//   });


const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendMaintenanceNotification = functions.firestore
    .document('maintenance/{maintenanceId}')
    .onCreate(async (snapshot, context) => {
        const maintenanceData = snapshot.data();

        try {
            // Retrieve FCM tokens of admins with matching organisationId
            const adminsSnapshot = await admin.firestore().collection('admins')
                .where('organisationId', '==', maintenanceData.organisationId)
                .get();

            const fcmTokens = [];
            adminsSnapshot.forEach((doc) => {
                const adminData = doc.data();
                if (adminData.fcmToken) {
                    fcmTokens.push(adminData.fcmToken);
                }
            });
          console.log("fcmTokens",fcmTokens);
            const payload = {
                notification: {
                    title: 'New Maintenance Request',
                    body: 'A new maintenance request has been added.',
                },
                data: {
                    maintenanceId: context.params.maintenanceId,
                },
            };

            if (fcmTokens.length > 0) {
                const response = await admin.messaging().sendToDevice(fcmTokens, payload);
                console.log('Notification sent successfully:', response);
            } else {
                console.log('No FCM tokens found for admins with matching organisationId.');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    });
