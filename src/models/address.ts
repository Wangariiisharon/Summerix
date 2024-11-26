export interface ADDRESS {
  country: string;
  location: string;
  cordinates?: {
    longitude: number | null;
    latitude: number | null;
  };
}
