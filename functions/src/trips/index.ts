import { OnTripCreated } from './on.created';
import { OnTripDeleted } from './on.deleted';
import { OnTripUpdated } from './on.updated';

export const group = {
  onCreated: OnTripCreated,
  onDeleted: OnTripDeleted,
  onUpdated: OnTripUpdated,
};
