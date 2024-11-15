import { OnClientCreated } from "./on.created";
import { OnClientDeleted } from "./on.deleted";
import { OnClientUpdated } from "./on.updated";

export const group = {
  onCreated: OnClientCreated,
  onDeleted: OnClientDeleted,
  onUpdated: OnClientUpdated,
};
