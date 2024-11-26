export interface ADDRESS {
  country: string;
  county: string;
  town: string;
  location: string;
  physicalAddress: string;
  geolocation: {
    longitude: number | null;
    latitude: number | null;
  };
}
