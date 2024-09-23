import { useEffect, useState } from 'react';
import '../styles/WeatherDashboard.css';
import { Line, Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  Chart,
} from 'chart.js';

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

import {
  fetchCoordsByName,
  fetchCoordsByZip,
  fetchThreeHourForecast,
  fetchCurrentWeather,
  fetchUVIndex,
} from '../api/weatherService';

const WeatherDashboard = () => {
  const [locationInput, setLocationInput] = useState('');
  const [locationList, setLocationList] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [dayWeatherData, setDayWeatherData] = useState([]);
  const [fiveDayForecast, setFiveDayForecast] = useState([]);
  const [uvIndex, setUvIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [weatherType, setWeatherType] = useState('home');
  const [middayForecast, setMiddayForecast] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  const resetData = () => {
    setDayWeatherData([]);
    setFiveDayForecast([]);
    setCurrentWeather(null);
    setUvIndex(null);
    setErrorMsg('');
    setLocationList([]);
    setWeatherType('home');
    setLocationInput('');
  };

  // Fetches teh options for locations based on the user input
  const getWeatherData = async () => {
    if (locationInput.trim() === '') return;
    setErrorMsg('');
    setLocationList([]);

    if (isNaN(locationInput)) {
      // City name search
      try {
        const results = await fetchCoordsByName(locationInput);
        if (results.length === 0) {
          setErrorMsg('No locations found.');
          return;
        } else if (results.length === 1) {
          const loc = results[0];
          setLocationList(results);
          await fetchWeather(loc);
        } else {
          setLocationList(results);
        }
      } catch (error) {
        console.error(error);
        setErrorMsg("Couldn't find the city. Please check the spelling.");
      }
    } else {
      // ZIP code search
      try {
        const results = await fetchCoordsByZip(locationInput);
        setLocationList([results]);
        const loc = results;
        await fetchWeather(loc);
      } catch (error) {
        console.error(error);
        setErrorMsg('Invalid ZIP code. Please try again.');
      }
    }
  };

  const fetchWeather = async (location) => {
    try {
      // Fetches different types of weather data
      const currentData = await fetchCurrentWeather(location.lat, location.lon);
      const forecastData = await fetchThreeHourForecast(
        location.lat,
        location.lon
      );
      const uvData = await fetchUVIndex(location.lat, location.lon);
      setSelectedLocation(location);
      setCurrentWeather(currentData);
      setUvIndex(uvData);
      setDayWeatherData(forecastData.list.slice(0, 8)); // Next 24 hours
      setFiveDayForecast(forecastData.list.slice(0, 40)); // Next 5 days
      setErrorMsg('');

      const currentWeatherType = currentData.weather[0].main.toLowerCase();
      setWeatherType(currentWeatherType);
    } catch (error) {
      console.error(error);
      setErrorMsg('Error fetching weather data.');
      setDayWeatherData([]);
      setFiveDayForecast([]);
      setCurrentWeather(null);
      setUvIndex(null);
    }
  };

  // Chart objects
  Chart.defaults.color = 'rgb(255, 255, 255)';
  const dayChart = {
    labels: dayWeatherData.map((item) =>
      new Date(item.dt * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    ),
    datasets: [
      {
        label: 'Temperature (°F)',
        data: dayWeatherData.map((item) => item.main.temp),
        borderColor: '#c12029',
        backgroundColor: 'rgb(193, 32, 41, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const humidityChart = {
    labels: dayWeatherData.map((item) =>
      new Date(item.dt * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    ),
    datasets: [
      {
        label: 'Humidity (%)',
        data: dayWeatherData.map((item) => item.main.humidity),
        borderColor: '#c12029',
        backgroundColor: 'rgb(193, 32, 41)',
        fill: true,
      },
    ],
  };

  const windChart = {
    labels: dayWeatherData.map((item) =>
      new Date(item.dt * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    ),
    datasets: [
      {
        label: 'Wind Speed (mph)',
        data: dayWeatherData.map((item) => item.wind.speed),
        borderColor: '#c12029',
        backgroundColor: 'rgb(193, 32, 41, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Extract one hour for each day
  useEffect(() => {
    setMiddayForecast(
      fiveDayForecast.filter((item) => {
        const date = new Date(item.dt * 1000);
        return date.getUTCHours() === 18;
      })
    );
  }, [fiveDayForecast]);

  return (
    <div className={`weather-app ${weatherType}`}>
      <header className="header">
        <img
          src="https://awesomeinc.org/static/c91728047cb3a40d4900ddd021304a80/6330c/ainc-15-Full-Color-Horizontal.png"
          alt=""
          onClick={resetData}
        />
        <h1>Awesome Weather</h1>
        <div className="spacer"></div>
      </header>
      <div className="input-container">
        <input
          type="text"
          className="location-input"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              getWeatherData(e.target.value);
            }
          }}
          placeholder="Enter city name or ZIP code"
        />
        <button className="fetch-button" onClick={getWeatherData}>
          Get Weather
        </button>
      </div>
      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {locationList.length > 1 && (
        <select
          className="location-select"
          onChange={(e) => fetchWeather(locationList[e.target.value])}
          defaultValue=""
        >
          <option value="" disabled>
            Choose a location
          </option>
          {locationList.map((loc, index) => (
            <option key={index} value={index}>
              {loc.name}
              {loc.state ? `, ${loc.state}` : ''}
            </option>
          ))}
        </select>
      )}

      {currentWeather && (
        <div className="weather-cards">
          <div className="card current-weather">
            {selectedLocation.state ? (
              <h2>
                {selectedLocation.name}, {selectedLocation.state}
              </h2>
            ) : (
              <h2>{selectedLocation.name}</h2>
            )}

            <div className="temp-icon-wrapper">
              <p className="temperature">
                {Math.round(currentWeather.main.temp)}°F
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                alt={currentWeather.weather[0].description}
              />
            </div>
            <p className="weather-description">
              {currentWeather.weather[0].description}
            </p>
          </div>

          <div className="card today-highlights">
            <h2>Today&apos;s Highlights</h2>
            <p>UV Index: {uvIndex}</p>
            <p>Wind Speed: {currentWeather.wind.speed} mph</p>
            <p>Humidity: {currentWeather.main.humidity}%</p>
            <div className="chart-container">
              <h3>Temperature Variation</h3>
              <Line
                data={dayChart}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
            <div className="chart-container">
              <h3>Wind Speed</h3>
              <Line
                data={windChart}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
            <div className="chart-container">
              <h3>Humidity Levels</h3>
              <Bar
                data={humidityChart}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="card forecast">
            <h2>5-Day Forecast</h2>
            {middayForecast && middayForecast.length > 0 && (
              <ul className="forecast-list">
                {middayForecast.map((item, index) => (
                  <li key={index}>
                    <p>
                      {new Date(item.dt * 1000).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p>
                      {new Date(item.dt * 1000).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                    />
                    <p>{Math.round(item.main.temp)}°F</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;
