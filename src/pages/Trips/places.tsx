// import { AnyARecord } from 'dns';
// import React from 'react';
// import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

// const PlacesAutoComplete = ({ value, onChange }:any) => {
//     const handleSelect = async (address:any) => {
//       try {
//         const results = await geocodeByAddress(address);
//         const formattedAddress = results[0].formatted_address;
//         console.log("Formatted Address:", formattedAddress);
//         onChange(formattedAddress);
//       } catch (error) {
//         console.error('Error fetching location', error);
//       }
//     };
  
//     return (
//       <PlacesAutocomplete value={value || ''} onChange={onChange} onSelect={handleSelect}>
//         {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
//           <div>
//             <input
//               className="form-input bg-grey w-48"
//               {...getInputProps({ placeholder: 'Type address' })}
//             />
//             <div>
//               {loading ? <div>Loading...</div> : null}
//               {Array.isArray(suggestions) && suggestions.length > 0 ? (
//                 suggestions.map((suggestion) => (
//                   <div {...getSuggestionItemProps(suggestion)}>
//                     {suggestion.description}
//                   </div>
//                 ))
//               ) : null}
//             </div>
//           </div>
//         )}
//       </PlacesAutocomplete>
//     );
//   }; 

//   export default PlacesAutoComplete; 
import React from 'react'

export default function places() {
  return (
    <div>places</div>
  )
}
