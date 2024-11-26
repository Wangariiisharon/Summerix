import { OnVehicleCreated } from './on.created';
import { OnVehicleDeleted } from './on.deleted';
import { OnVehicleUpdated } from './on.updated';

export const group = {
  onCreated: OnVehicleCreated,
  onDeleted: OnVehicleDeleted,
  onUpdated: OnVehicleUpdated,
};
