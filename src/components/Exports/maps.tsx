import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker} from '@react-google-maps/api';

interface MapComponentProps {
  dropOffLocationName: string;
  pickUpLocationName: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ dropOffLocationName, pickUpLocationName }) => {  
  console.log("dropOffLocationName",dropOffLocationName); 
  console.log("pickUpLocationName",pickUpLocationName);

  const [dropOffLocation, setDropOffLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickUpLocation, setPickUpLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Use environment variable for API Key
  const apiKey = process.env.MY_MAPS_API_KEY!;

  useEffect(() => {   
    const fetchCoordinates = async (locationName: string, setLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>) => {
      if (!locationName) return;
      
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setLocation({ lat, lng });          
        }
      } catch (error) {
        console.error('Failed to fetch location data:', error);
      }
    };

    fetchCoordinates(dropOffLocationName, setDropOffLocation);
    fetchCoordinates(pickUpLocationName, setPickUpLocation);
  }, [dropOffLocationName, pickUpLocationName]); 

  return (

       <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100px' }} // Adjust height for better visibility
        center={dropOffLocation ? dropOffLocation : { lat: -1.286389, lng: 36.817223 }} // Use dropOffLocation as center if available
        zoom={5} // Adjust zoom level for better visibility
      >    
        {pickUpLocation && (
          <Marker
            // position={pickUpLocation} 
            position={{ lat: pickUpLocation.lat, lng: pickUpLocation.lng }}

            title="Pick Up Location"
          />
        )}

        {dropOffLocation && (
          <Marker
            position={dropOffLocation}
            title="Drop Off Location"
          />
        )}
      </GoogleMap>
  );
};

export default MapComponent; 

