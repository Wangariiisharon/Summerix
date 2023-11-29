import React, { useEffect, useState } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

const MapContainer = ({ tripDetails, google }: any) => {
  const mapStyles = {
    width: '400px',
    height: '100px',
  };

  const defaultCenter = {
    lat: 0,
    lng: 0,
  };

  const initialLatLng = {
    lat: 0,
    lng: 0,
  };

  const [departureLatLng, setDepartureLatLng] = useState(initialLatLng);
  const [arrivalLatLng, setArrivalLatLng] = useState(initialLatLng);

  useEffect(() => {
    const fetchLatLng = async (
      location: string,
      setter: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>
    ) => {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setter({ lat: location.lat, lng: location.lng });
      }
    };

    if (tripDetails.drop_off_location && tripDetails.pick_up_location) {
      fetchLatLng(tripDetails.drop_off_location, setDepartureLatLng);
      fetchLatLng(tripDetails.pick_up_location, setArrivalLatLng);
    }
  }, [tripDetails.drop_off_location, tripDetails.pick_up_location]);

  return (
    <div style={mapStyles}>
      <Map
        google={google}
        zoom={8}
        style={{ width: '100%', height: '100%' }}
        initialCenter={defaultCenter}
        center={defaultCenter}
      />
      {tripDetails.drop_off_location && tripDetails.pick_up_location && (
        <>
          <Marker
            position={{
              lat: departureLatLng.lat,
              lng: departureLatLng.lng,
            }}
            label={tripDetails.drop_off_location}
          />
          <Marker
            position={{
              lat: arrivalLatLng.lat,
              lng: arrivalLatLng.lng,
            }}
            label={tripDetails.pick_up_location}
          />
        </>
      )}
    </div>
  );
};

export default GoogleApiWrapper({
  apiKey: 'AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE',
})(MapContainer);
