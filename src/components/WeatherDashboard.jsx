import { useState } from 'react';
import {
  fetchWeatherByCoords,
  fetchCoordsByZip,
  fetchCoordsByName,
} from '../api/weatherService';

const WeatherApp = () => {
  const [location, setLocation] = useState('');
  const [data, setData] = useState({});
  const [error, setError] = useState('');

  const handleLocationInput = (event) => {
    setLocation(event.target.value);
  };

  const getLocationAndWeather = async () => {
    if (!location) return;

    try {
      let weatherData;
      if (isNaN(location)) {
        const coords = await fetchCoordsByName(location);
        weatherData = await fetchWeatherByCoords(coords.lat, coords.lon);
      } else {
        const coords = await fetchCoordsByZip(location);
        weatherData = await fetchWeatherByCoords(coords.lat, coords.lon);
      }
      setData(weatherData);
      setError('');
    } catch (error) {
      console.error(error);
      setError('Unable to access weather data for your location.');
      setData({});
    }
  };

  const fetchCurrentLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const weatherData = await fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        );
        setData(weatherData);
        setError('');
      } catch (error) {
        console.error(error);
        setError('Unable to access weather data for your location.');
        setData({});
      }
    });
  };

  return (
    <div>
      <h1>Weather Finder</h1>
      <input
        type="text"
        value={location}
        onChange={handleLocationInput}
        placeholder="Enter city name or zip code"
      />
      <button onClick={getLocationAndWeather}>Get Weather</button>
      <button onClick={fetchCurrentLocationWeather}>
        Use Current Location
      </button>
      {error && <p className="error-message">{error}</p>}
      {data.main && (
        <div>
          <p>
            Temperature: {(((data.main.temp - 273.15) * 9) / 5 + 32).toFixed(2)}
            °F
          </p>
          <p>Weather: {data.weather[0].description}</p>
          <p>Humidity: {data.main.humidity}%</p>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
