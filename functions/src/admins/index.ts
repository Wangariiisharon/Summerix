import { OnAdminDeleted } from "./on.deleted";
import { OnAdminUpdated } from "./on.updated";
import { OnAdminCreated } from "./on.created";
import { OnCountAdminsCall } from "./on.call";

export const group = {
  onCreated: OnAdminCreated,
  onUpdated: OnAdminUpdated,
  onDeleted: OnAdminDeleted,
  onCountCall: OnCountAdminsCall,
};
