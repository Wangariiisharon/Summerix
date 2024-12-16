import { OnAccountCreated } from './on.created';
import { OnAccountDeleted } from './on.deleted';
import { OnAccountUpdated } from './on.updated';

export const group = {
  onCreated: OnAccountCreated,
  onDeleted: OnAccountDeleted,
  onUpdated: OnAccountUpdated,
};
