'use client';

import { Autocomplete, useLoadScript, type LoadScriptProps } from '@react-google-maps/api';
import { GeoPoint } from 'firebase/firestore';
import { ErrorMessage, Field } from 'formik';
import { useState } from 'react';

const libraries: LoadScriptProps['libraries'] = ['places'];

type Props = {
  locationValue: string;
  setFieldValue: Function;
  address: string;
};

export default function TripAddressInput({ address, locationValue, setFieldValue }: Props) {
  // eslint-disable-next-line no-undef
  const [autoComplete, setAutoComplete] = useState<google.maps.places.Autocomplete>();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    libraries: libraries,
  });

  return (
    <>
      {isLoaded && (
        <Autocomplete
          fields={['geometry.location', 'formatted_address']}
          onLoad={(autocomplete) => setAutoComplete(autocomplete)}
          onPlaceChanged={() => {
            const place = autoComplete?.getPlace();
            // console.debug('onPlaceChanged > place:', place);
            setFieldValue(`${address}.location`, place?.formatted_address);

            if (place?.geometry?.location) {
              const coordinates = new GeoPoint(
                place.geometry.location.lat(),
                place.geometry.location.lng(),
              );
              setFieldValue(`${address}.cordinates`, coordinates);
            }
          }}
        >
          <>
            <Field name={`${address}.location`}>
              {() => <input defaultValue={locationValue} className="form-input" />}
            </Field>
            <ErrorMessage name={`${address}.location`} component="span" className="form-error" />
          </>
        </Autocomplete>
      )}
    </>
  );
}
