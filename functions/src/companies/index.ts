import { OnCompanyCreated } from './on.created';
import { OnCompanyDeleted } from './on.deleted';
import { OnCompanyUpdated } from './on.updated';

export const group = {
  onCreated: OnCompanyCreated,
  onDeleted: OnCompanyDeleted,
  onUpdated: OnCompanyUpdated,
};
