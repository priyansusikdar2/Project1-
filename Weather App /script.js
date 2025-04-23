const apiKey = 'ff366336038b639379de62cfcd619a17';
let city = '';

function getWeather() {
    city = document.getElementById('city').value.trim();
    const selectedDate = document.getElementById('forecast-date').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(geoUrl)
        .then(response => {
            if (!response.ok) throw new Error('City not found');
            return response.json();
        })
        .then(data => {
            const { lat, lon } = data.coord;
            displayWeather(data);
            getHourlyForecast(lat, lon, selectedDate);
            getAirQuality(lat, lon);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Please try again.');
        });
}

function displayWeather(data) {
    const tempDiv = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    tempDiv.innerHTML = '';
    weatherInfoDiv.innerHTML = '';

    if (!data || data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>City not found. Please try again.</p>`;
        return;
    }

    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity; // <-- Added humidity
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    tempDiv.innerHTML = `<p>${temperature}°C</p>`;
    weatherInfoDiv.innerHTML = `
        <p>${cityName}</p>
        <p>${description}</p>
        <p>Humidity: ${humidity}% 💧</p>
    `;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
    weatherIcon.style.display = 'block';
}

function getHourlyForecast(lat, lon, selectedDate) {
    const hourlyUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(hourlyUrl)
        .then(response => {
            if (!response.ok) throw new Error('Hourly forecast data unavailable');
            return response.json();
        })
        .then(data => {
            displayHourlyForecast(data.list, selectedDate);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast:', error);
        });
}

function displayHourlyForecast(hourlyData, selectedDate) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    const forecastHeading = document.getElementById('forecast-heading');

    hourlyForecastDiv.innerHTML = '';

    if (!selectedDate) {
        forecastHeading.innerText = 'Select a date for forecast';
        return;
    }

    forecastHeading.innerText = `Hourly Forecast for ${selectedDate}`;

    const filteredData = hourlyData.filter(item => {
        const itemDate = new Date(item.dt * 1000).toISOString().split('T')[0];
        return itemDate === selectedDate;
    });

    if (filteredData.length === 0) {
        hourlyForecastDiv.innerHTML = '<p>No data available for this date.</p>';
        return;
    }

    filteredData.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

function getAirQuality(lat, lon) {
    const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(airQualityUrl)
        .then(response => {
            if (!response.ok) throw new Error('Air quality data unavailable');
            return response.json();
        })
        .then(data => {
            displayAirQuality(data.list[0].main.aqi);
        })
        .catch(error => {
            console.error('Error fetching air quality data:', error);
        });
}

function displayAirQuality(aqi) {
    const airQualityDiv = document.getElementById('air-quality');

    let airQualityText = '';
    switch (aqi) {
        case 1: airQualityText = 'Air Quality: Good 🌿'; break;
        case 2: airQualityText = 'Air Quality: Fair 😊'; break;
        case 3: airQualityText = 'Air Quality: Moderate 😐'; break;
        case 4: airQualityText = 'Air Quality: Poor 😷'; break;
        case 5: airQualityText = 'Air Quality: Very Poor 🏭'; break;
        default: airQualityText = 'Air Quality: Unknown';
    }

    airQualityDiv.innerHTML = `<p>${airQualityText}</p>`;
}

// Auto-refresh weather and AQI every 1 hour
setInterval(() => {
    if (city) {
        console.log('Updating weather & air quality data...');
        getWeather();
    }
}, 3600000); // 1 hour = 3600000 ms
