
# WeatherMap

WeatherMap is a web application that allows users to search for cities, view current weather information, and explore locations using an interactive map.

## Features

- Search for cities by name.
- Retrieve current weather information from OpenWeatherMap.
- Display temperature, feels-like temperature, humidity, wind speed, cloudiness, and pressure.
- Display weather icons and descriptions.
- Update the map marker and open a weather details popup.
- Save and remove favorite cities using local storage.
- Share weather information using the browser sharing feature or clipboard when available.
- Display clear error messages for invalid cities and weather API failures.
- Responsive layout for desktop and mobile screens.

## Technologies

- HTML5
- CSS3
- JavaScript
- Leaflet
- OpenStreetMap
- OpenWeatherMap API
- Nominatim geocoding service

## Project Structure

```text
weatherrMap/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Setup

1. Open the project folder in Visual Studio Code.
2. Obtain an API key from OpenWeatherMap.
3. Open `script.js`.
4. Replace `YOUR_OPENWEATHER_API_KEY` with your active API key.
5. Install the Live Server extension in Visual Studio Code if it is not installed.
6. Open `index.html` using Live Server.
7. Enter a city name and select Get Weather.

## Error Handling

The application displays messages when a city cannot be found, the API key is invalid, the request limit is reached, or a weather request fails.

## Data Sources

- Weather data: OpenWeatherMap.
- Map tiles: OpenStreetMap.
- City geocoding: Nominatim.

## Notes

An internet connection is required to retrieve weather data, search for locations, and load map tiles. The API key should not be committed to a public repository.
