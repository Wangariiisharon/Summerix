
export default async function handler(req, res) {
  const { origins, destinations } = req.query;

  if (!origins || !destinations) {
      return res.status(400).json({ error: 'Missing required query parameters: origins, destinations' });
  }

  const apiKey = "AIzaSyBioopUI9t6yPlf7hmJmCNXf4dfN-mPEjE";
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&key=${apiKey}`;

  try {
      const apiResponse = await fetch(url);
      const data = await apiResponse.json(); 
      console.log("Distance data", data);

      if (data.status === 'OK') {
          // Extract the distance from the first element in the rows array
          const distanceValue = data.rows[0].elements[0].distance.text;
          // Send the distance value in the response
          return res.status(200).json({ distance: distanceValue });
      } else {
          // Handle the case where the API does not return an 'OK' status
          console.error('Google Maps API response status:', data.status);
          return res.status(500).json({ error: 'Failed to fetch distance', details: data });
      }
  } catch (error) {
      console.error('Error fetching distance:', error);
      return res.status(500).json({ error: 'Failed to fetch distance', details: error });
  }
}

  
