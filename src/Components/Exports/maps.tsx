
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';

interface MapComponentProps {
  dropOffLocationName: string;
  pickUpLocationName: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ dropOffLocationName, pickUpLocationName }) => {
  const [dropOffLocation, setDropOffLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickUpLocation, setPickUpLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {   
    const fetchCoordinates = async () => {
      if (dropOffLocationName) {
        const dropOffResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(dropOffLocationName)}&key=AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE`
        );
        const dropOffData = await dropOffResponse.json();
        if (dropOffData.results && dropOffData.results.length > 0) {
          const { lat, lng } = dropOffData.results[0].geometry.location;
          setDropOffLocation({ lat, lng }); 
          console.log("dropOffLocation :",dropOffLocation);
          
        }
      }

      if (pickUpLocationName) {
        const pickUpResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pickUpLocationName)}&key=AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE`
        );
        const pickUpData = await pickUpResponse.json();
        if (pickUpData.results && pickUpData.results.length > 0) {
          const { lat, lng } = pickUpData.results[0].geometry.location;
          setPickUpLocation({ lat, lng });
          console.log("pickUpLocation :",pickUpLocation);

        }
      }
    };

    fetchCoordinates();
  }, [dropOffLocationName, pickUpLocationName]);

  // Define your Google Maps API key
  const apiKey = 'AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE';

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100px' }}
        center={{ lat: -1.286389, lng: 36.817223 }}
        zoom={6}
      >
        {/* Marker for drop off location */}
        {dropOffLocation && (
          <Marker
            position={dropOffLocation}
            title="Drop Off Location"
          />
        )}

        {/* Marker for pick up location */}
        {pickUpLocation && (
          <Marker
            position={pickUpLocation}
            title="Pick Up Location"
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
