import axios from 'axios';
const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

export const fetchWeatherByCoords = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat,
          lon,
          appid: apiKey,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch weather data.');
  }
};

export const fetchCoordsByZip = async (zipCode) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/zip`,
      {
        params: {
          zip: zipCode,
          appid: apiKey,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Invalid zip code or location.');
  }
};

export const fetchCoordsByName = async (cityName) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct`,
      {
        params: {
          q: cityName,
          limit: 1,
          appid: apiKey,
        },
      }
    );
    return response.data[0]; // The first result of the city search
  } catch (err) {
    console.error(err);
    throw new Error('Invalid city name or location.');
  }
};
