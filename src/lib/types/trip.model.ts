export interface Trip {
  docId: string;
  organisationId: string;
  client: string;
  company: string;
  distance: string;
  trip_status: string;
  vehicle: string;
  addedBy: string;
  requested_by: {
    id: string;
    name: string;
    phonenumber: string;
  };
  pick_up_location: string;
  drop_off_location: string;
  paid_amount: number;
  start_time: string;
  cargoSize: number;
  cargo_type: string;
  remaining_amount: number;
  
  fuel: number;
  interchange_documents: string;
  excess_weight_fee: string;
  mileage_fee: number;
  trip_id: string;
  end_time: string;
  cargo_quantity: string;
  t1_form: string;
  dealValue: number;
  timestamp: any;
}
