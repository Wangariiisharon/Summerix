import { firestore } from "firebase-admin";
import { https, logger } from "firebase-functions/v1";
import Constants from "../Constants";

export const OnCountAdminsCall = https.onCall(async (data, context) => {
  logger.log(`OnCountAdminsCall > context: ${context}, data:`, data);

  let query = firestore().collectionGroup(
    Constants.fbAdmins,
  ) as firestore.Query;
  if (data.email) query = query.where("email", "==", data.email);
  if (data.idNumber) query = query.where("idNumber", "==", data.idNumber);
  if (data.phoneNumber) {
    query = query.where("phoneNumber", "==", data.phoneNumber);
  }

  const snapshot = await query.get();
  const firstDocId = snapshot.empty ? null : snapshot.docs[0].id;
  logger.debug("OnCountAdminsCall > details:", {
    count: snapshot.size,
    firstDocId,
  });

  return {
    count: snapshot.size,
    firstDocId: firstDocId,
    timestamp: Date.now(),
  };
});
