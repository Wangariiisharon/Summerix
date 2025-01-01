export interface Company {
  name: string;
  description: string;
  email: string;
  phoneNumber: string;
  country: string;
  timezone: string;
  currency: string;
}

export interface CompanyWithMetadata extends Company {
  createdBy: {
    authId: string;
    email: string;
  };
  updatedBy: {
    authId: string;
    email: string;
  };
  dateCreated: any; // Firebase Timestamp
  lastUpdated: any; // Firebase Timestamp
}
