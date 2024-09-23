import axios from 'axios';
const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

// API calls to openweathermap.org

export const fetchWeatherByCoords = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: { lat, lon, appid: apiKey },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data by coordinates:', error);
    throw new Error('Failed to fetch weather data.');
  }
};

export const fetchCoordsByZip = async (zipCode) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/zip`,
      {
        params: { zip: zipCode, appid: apiKey },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching coordinates by zip code:', error);
    throw new Error('Invalid zip code or location.');
  }
};

export const fetchCoordsByName = async (cityName) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct`,
      {
        params: { q: cityName, limit: 5, appid: apiKey },
      }
    );
    if (response.data && response.data.length > 0) {
      console.log(response.data);
      return response.data;
    } else {
      throw new Error('No location found with the given city name.');
    }
  } catch (error) {
    console.error('Error fetching coordinates by city name:', error);
    throw new Error('Invalid city name or location.');
  }
};

export const fetchCurrentWeather = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: 'imperial',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather data:', error);
    throw new Error('Failed to fetch current weather data.');
  }
};

export const fetchUVIndex = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/uvi`,
      {
        params: {
          lat,
          lon,
          appid: apiKey,
        },
      }
    );
    return response.data.value;
  } catch (error) {
    console.error('Error fetching UV Index data:', error);
    throw new Error('Failed to fetch UV Index data.');
  }
};

export const fetchThreeHourForecast = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: 'imperial',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching 3-hour forecast data:', error);
    throw new Error('Failed to fetch 3-hour forecast data.');
  }
};
