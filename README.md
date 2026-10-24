# WeatherMap

WeatherMap is a web application that allows users to search for cities, view current weather information, and explore locations using an interactive map.

## Features

- Search for cities by name.
- Retrieve current weather information through a Cloudflare Worker.
- Display temperature, feels-like temperature, humidity, wind speed, cloudiness, and pressure.
- Display weather icons and descriptions.
- Update the map marker and open a weather details popup.
- Save and remove favorite cities using browser local storage.
- Share weather information using the browser sharing feature or clipboard when available.
- Display clear error messages for invalid cities and failed weather requests.
- Responsive layout for desktop and mobile screens.

## Technologies

- HTML5
- CSS3
- JavaScript
- Leaflet
- OpenStreetMap
- OpenWeatherMap API
- Cloudflare Workers
- GitHub Pages
- Nominatim geocoding service

## Project Structure

```text
weatherrMap/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Run Locally

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` using the Live Server extension.
4. Enter a city name and select **Get Weather**.

An internet connection is required for weather data, map tiles, and location search.

## Deployment

The application is deployed using GitHub Pages.

The weather requests are sent to a Cloudflare Worker endpoint configured in `script.js`. The Worker retrieves weather data from OpenWeatherMap and returns the response to the application.

## API Key and Security

- The OpenWeatherMap API key must be stored as a secret named `OPENWEATHER_API_KEY` in the Cloudflare Worker settings.
- Do not place the API key directly in `script.js`, `index.html`, or any other publicly accessible frontend file.
- Do not commit API keys or other secrets to GitHub.
- The frontend should use the configured Cloudflare Worker endpoint to request weather data.

## Data Sources

- Weather data: OpenWeatherMap, accessed through Cloudflare Workers.
- Map tiles: OpenStreetMap.
- Interactive map: Leaflet.
- Location search: Nominatim.

## Error Handling

The application displays messages when a city cannot be found or when a weather request fails. A working internet connection and a correctly configured Cloudflare Worker are required for weather data.

## Notes

- The weather service depends on the Cloudflare Worker being available and correctly configured.
- Never share the Cloudflare Worker secret or OpenWeatherMap API key publicly.
