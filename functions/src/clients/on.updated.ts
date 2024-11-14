import { logger, runWith } from "firebase-functions/v1";
import { CLIENT } from "../models/client";
import Constants from "../Constants";

export const OnClientUpdated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbClients}/{docId}`)
  .onUpdate(async (snapshot, context) => {
    const prevClient = snapshot.before.data() as CLIENT;
    const client = snapshot.after.data() as CLIENT;
    client.docId = context.params.docId;
    logger.log("OnClientUpdated > details:", { client, prevClient });

    try {
      // TODO: implement this
    } catch (error) {
      logger.error("OnClientUpdated error:::", error);
    }
  });
