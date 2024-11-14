import { logger, runWith } from "firebase-functions/v1";
import { CLIENT } from "../models/client";
import Constants from "../Constants";

export const OnClientDeleted = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbClients}/{docId}`)
  .onDelete(async (snapshot, context) => {
    const client = snapshot.data() as CLIENT;
    client.docId = context.params.docId;
    logger.log("OnClientDeleted > client:", client);

    try {
      // TODO: implement this
    } catch (error) {
      logger.error("OnClientDeleted error:", error);
    }
  });
