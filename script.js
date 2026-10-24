
const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY";
const form = document.getElementById("weather-form");
const locationInput = document.getElementById("location-input");
const searchButton = document.getElementById("search-button");
const statusMessage = document.getElementById("status-message");
const errorMessage = document.getElementById("error-message");

const weatherCity = document.getElementById("weather-city");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherDescription = document.getElementById("weather-description");
const weatherIcon = document.getElementById("weather-icon");
const weatherFeelsLike = document.getElementById("weather-feels-like");
const weatherHumidity = document.getElementById("weather-humidity");
const weatherWind = document.getElementById("weather-wind");
const weatherClouds = document.getElementById("weather-clouds");
const weatherPressure = document.getElementById("weather-pressure");

const favoriteButton = document.getElementById("favorite-button");
const shareButton = document.getElementById("share-button");
const favoritesList = document.getElementById("favorites-list");
const favoritesCount = document.getElementById("favorites-count");

const DEFAULT_LOCATION = {
    name: "Khartoum",
    latitude: 15.5007,
    longitude: 32.5599
};

const FAVORITES_KEY = "weatherrMapFavorites";

let currentLocation = null;
let currentWeather = null;
let currentMarker = null;
let activeRequest = null;
let isLoading = false;

const map = L.map("map").setView(
    [DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude],
    6
);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}

function setStatus(message) {
    statusMessage.textContent = message;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}

function clearError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
}

function setLoading(loading) {
    isLoading = loading;
    searchButton.disabled = loading;
    searchButton.textContent = loading ? "Loading..." : "Get Weather";
}

async function geocodeLocation(query, signal) {
    const url = new URL("https://nominatim.openstreetmap.org/search");

    url.search = new URLSearchParams({
        q: query,
        format: "jsonv2",
        limit: "1",
        addressdetails: "1"
    }).toString();

    const response = await fetch(url, {
        headers: {
            Accept: "application/json"
        },
        signal
    });

    if (!response.ok) {
        throw new Error("City search is temporarily unavailable. Please try again.");
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
        throw new Error("City not found. Check the spelling and try again.");
    }

    const result = results[0];

    return {
        name: result.display_name,
        latitude: Number(result.lat),
        longitude: Number(result.lon)
    };
}

async function fetchCurrentWeather(location, signal) {
    if (
        !OPENWEATHER_API_KEY ||
        OPENWEATHER_API_KEY === "YOUR_OPENWEATHER_API_KEY"
    ) {
        throw new Error("Add your active OpenWeatherMap API key in script.js first.");
    }

    const url = new URL("https://api.openweathermap.org/data/2.5/weather");

    url.search = new URLSearchParams({
        lat: String(location.latitude),
        lon: String(location.longitude),
        appid: OPENWEATHER_API_KEY,
        units: "metric"
    }).toString();

    const response = await fetch(url, { signal });
    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("The weather API key is invalid or not active yet.");
        }

        if (response.status === 429) {
            throw new Error("Weather request limit reached. Please try again later.");
        }

        throw new Error(data.message || "Unable to retrieve weather information.");
    }

    return data;
}

function getShortLocationName(location) {
    const parts = location.name.split(",").map(part => part.trim());
    return parts[0] || location.name;
}

function buildPopupContent(location, weather) {
    const cityName = escapeHTML(getShortLocationName(location));
    const condition = escapeHTML(weather.weather[0].description);
    const iconCode = weather.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${encodeURIComponent(iconCode)}@2x.png`;

    const shareMessage = `Weather in ${getShortLocationName(location)}: ${Math.round(weather.main.temp)}°C, ${weather.weather[0].description}. Data from OpenWeatherMap.`;

    return `
        <div class="popup-weather">
            <h3>${cityName}</h3>
            <div class="popup-temperature">
                <img src="${iconUrl}" alt="${condition}">
                <span>${Math.round(weather.main.temp)}°C</span>
            </div>
            <div class="popup-condition">${condition}</div>
            <div class="popup-details">
                <span>Feels like: ${Math.round(weather.main.feels_like)}°C</span>
                <span>Humidity: ${weather.main.humidity}%</span>
                <span>Wind: ${weather.wind.speed} m/s</span>
                <span>Cloudiness: ${weather.clouds.all}%</span>
                <span>Pressure: ${weather.main.pressure} hPa</span>
            </div>
            <button
                type="button"
                class="popup-share"
                data-share-message="${escapeHTML(shareMessage)}"
            >Share Weather</button>
        </div>
    `;
}

function updateMap(location, weather) {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    currentMarker = L.marker([
        location.latitude,
        location.longitude
    ]).addTo(map);

    currentMarker.bindPopup(
        buildPopupContent(location, weather)
    );

    map.flyTo(
        [location.latitude, location.longitude],
        10,
        { duration: 1 }
    );

    currentMarker.openPopup();
}

function renderWeather(location, weather) {
    currentLocation = location;
    currentWeather = weather;

    weatherCity.textContent = getShortLocationName(location);
    weatherTemperature.textContent = `${Math.round(weather.main.temp)}°C`;

    weatherDescription.textContent = weather.weather[0].description;
    weatherFeelsLike.textContent = `${Math.round(weather.main.feels_like)}°C`;
    weatherHumidity.textContent = `${weather.main.humidity}%`;
    weatherWind.textContent = `${weather.wind.speed} m/s`;
    weatherClouds.textContent = `${weather.clouds.all}%`;
    weatherPressure.textContent = `${weather.main.pressure} hPa`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${encodeURIComponent(weather.weather[0].icon)}@2x.png`;

    weatherIcon.alt = weather.weather[0].description;
    weatherIcon.hidden = false;

    favoriteButton.disabled = false;
    shareButton.disabled = false;

    updateMap(location, weather);
    updateFavoriteButton();
}

async function searchWeather(query) {
    if (isLoading) {
        if (activeRequest) {
            activeRequest.abort();
        }
    }

    if (activeRequest) {
        activeRequest.abort();
    }

    const controller = new AbortController();
    activeRequest = controller;

    clearError();
    setStatus("Searching for the city and retrieving weather...");
    setLoading(true);

    try {
        const location = await geocodeLocation(
            query,
            controller.signal
        );

        const weather = await fetchCurrentWeather(
            location,
            controller.signal
        );

        if (activeRequest !== controller) {
            return;
        }

        renderWeather(location, weather);
        locationInput.value = getShortLocationName(location);
        setStatus("Weather loaded successfully.");
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        showError(error.message || "Something went wrong. Please try again.");
        setStatus("");
    } finally {
        if (activeRequest === controller) {
            activeRequest = null;
            setLoading(false);
        }
    }
}

function getFavorites() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
        showError("Unable to save favorites in this browser.");
    }
}

function isFavorite(location) {
    if (!location) {
        return false;
    }

    return getFavorites().some(favorite =>
        favorite.latitude === location.latitude &&
        favorite.longitude === location.longitude
    );
}

function updateFavoriteButton() {
    if (!currentLocation) {
        favoriteButton.textContent = "♡";
        favoriteButton.setAttribute("aria-label", "Add city to favorites");
        return;
    }

    const saved = isFavorite(currentLocation);

    favoriteButton.textContent = saved ? "♥" : "♡";
    favoriteButton.setAttribute(
        "aria-label",
        saved ? "Remove city from favorites" : "Add city to favorites"
    );
}

function renderFavorites() {
    const favorites = getFavorites();

    favoritesCount.textContent =
        `${favorites.length} ${favorites.length === 1 ? "city" : "cities"}`;

    favoritesList.replaceChildren();

    if (favorites.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "Your favorite cities will appear here.";
        favoritesList.appendChild(emptyMessage);
        return;
    }

    favorites.forEach(favorite => {
        const item = document.createElement("div");
        item.className = "favorite-item";

        const cityButton = document.createElement("button");
        cityButton.type = "button";
        cityButton.className = "favorite-city";
        cityButton.textContent = favorite.name;
        cityButton.addEventListener("click", () => {
            searchWeather(favorite.name);
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-favorite";
        removeButton.textContent = "Remove";
        removeButton.setAttribute(
            "aria-label",
            `Remove ${favorite.name} from favorites`
        );

        removeButton.addEventListener("click", () => {
            const updated = getFavorites().filter(saved =>
                !(
                    saved.latitude === favorite.latitude &&
                    saved.longitude === favorite.longitude
                )
            );

            saveFavorites(updated);
            renderFavorites();
            updateFavoriteButton();
        });

        item.append(cityButton, removeButton);
        favoritesList.appendChild(item);
    });
}

favoriteButton.addEventListener("click", () => {
    if (!currentLocation) {
        return;
    }

    const favorites = getFavorites();

    if (isFavorite(currentLocation)) {
        const updated = favorites.filter(favorite =>
            !(
                favorite.latitude === currentLocation.latitude &&
                favorite.longitude === currentLocation.longitude
            )
        );

        saveFavorites(updated);
    } else {
        favorites.push({
            name: getShortLocationName(currentLocation),
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
        });

        saveFavorites(favorites);
    }

    renderFavorites();
    updateFavoriteButton();
});

async function shareWeather(message) {
    try {
        if (navigator.share) {
            await navigator.share({
                title: "WeatherMap",
                text: message
            });

            setStatus("Weather shared successfully.");
            return;
        }

        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(message);
            setStatus("Weather information copied to clipboard.");
            return;
        }

        window.prompt("Copy this weather information:", message);
    } catch (error) {
        if (error.name !== "AbortError") {
            showError("Unable to share weather information.");
        }
    }
}

shareButton.addEventListener("click", () => {
    if (!currentLocation || !currentWeather) {
        return;
    }

    const message =
        `Weather in ${getShortLocationName(currentLocation)}: ` +
        `${Math.round(currentWeather.main.temp)}°C, ` +
        `${currentWeather.weather[0].description}. ` +
        `Humidity: ${currentWeather.main.humidity}%. ` +
        `Wind: ${currentWeather.wind.speed} m/s.`;

    shareWeather(message);
});

map.on("popupopen", event => {
    const popupElement = event.popup.getElement();

    if (!popupElement) {
        return;
    }

    const popupShareButton = popupElement.querySelector(".popup-share");

    if (popupShareButton) {
        popupShareButton.addEventListener("click", () => {
            shareWeather(popupShareButton.dataset.shareMessage || "");
        });
    }
});

form.addEventListener("submit", event => {
    event.preventDefault();

    const query = locationInput.value.trim();

    if (!query) {
        showError("Please enter a city name.");
        return;
    }

    searchWeather(query);
});

renderFavorites();
