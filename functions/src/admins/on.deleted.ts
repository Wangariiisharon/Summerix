import { logger, runWith } from "firebase-functions/v1";
import { doRemoveAuthRoles } from "../services/admin.service";
import { getAuth } from "firebase-admin/auth";
import Constants from "../Constants";
import { ADMIN } from "../models/admin";

export const OnAdminDeleted = runWith({
  maxInstances: 10,
})
  .firestore.document(`/${Constants.fbAdmins}/{docId}`)
  .onDelete(async (snapshot, context) => {
    const admin = snapshot.data() as ADMIN;
    const docId = (admin.docId = context.params.docId);
    logger.log("OnAdminDeleted > admin:", admin);

    if (admin.roles || admin.rolesMap) {
      await doRemoveAuthRoles(docId);
      await getAuth().revokeRefreshTokens(docId);
    }
  });
