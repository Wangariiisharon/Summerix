import { logger, runWith } from "firebase-functions/v1";
import { CLIENT } from "../models/client";
import Constants from "../Constants";

export const OnClientCreated = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbClients}/{docId}`)
  .onCreate(async (snapshot, context) => {
    const client = snapshot.data() as CLIENT;
    client.docId = context.params.docId;
    logger.log("OnClientCreated > client:", client);

    try {
      // TODO: implement this
    } catch (error) {
      logger.error("OnClientCreated error:::", error);
    }
  });
