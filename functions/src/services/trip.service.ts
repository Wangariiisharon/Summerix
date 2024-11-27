import axios from 'axios';
import { ADDRESS } from '../models/address';

export const getTripDistance = async (from: ADDRESS, to: ADDRESS) => {
  const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
    params: {
      key: `${process.env.GOOGLE_API_KEY}`,
      origins: `${from.cordinates.latitude},${from.cordinates.longitude}`,
      destinations: `${to.cordinates.latitude},${to.cordinates.longitude}`,
    },
  });
  console.debug('getTripDistance > response:', response.data);

  return response.data;
};
