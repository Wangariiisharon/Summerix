import { GeoPoint } from 'firebase/firestore';

export interface ADDRESS {
  country?: string;
  location: string;
  cordinates: GeoPoint;
}
