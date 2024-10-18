const apiKey = '07c4fc833f325d21777a7bff1522cf45';
const citySearch = document.getElementById('citySearch');
const searchIcon = document.querySelector('.search-icon');
const weatherWidget = document.getElementById('weatherWidget');
const weatherDetails = document.getElementById('weatherDetails');

let lastCity = '';
let isCelsius = true;

let weatherdata = null;
let fiveDayForecast = null;

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            getWeatherDataByCoords(latitude, longitude);
        });
    } else {
        weatherDetails.innerHTML = '<p>Geolocation is not supported by this browser.</p>';
    }
});

citySearch.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchCity();
    }
});

searchIcon.addEventListener('click', searchCity);

function searchCity() {
    const city = citySearch.value.trim();
    if (city !== lastCity && city !== '') {
        getWeatherData(city);
        getForecastData(city);
        lastCity = city;
    }
}

function getWeatherDataByCoords(latitude, longitude) {
    document.getElementById('loadingSpinner').style.display = 'block';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const cityName = data.name;
            weatherdata = data;
            getForecastData(cityName);
            displayWeatherData(data);
        } else {
            weatherDetails.innerHTML = '<p>Error: Unable to retrieve weather data.</p>';
        }
        document.getElementById('loadingSpinner').style.display = 'none';
    };
    xhr.onerror = function () {
        weatherDetails.innerHTML = '<p>Error: Network Error.</p>';
        document.getElementById('loadingSpinner').style.display = 'none';
    };
    xhr.send();
}

function getWeatherData(city) {
    document.getElementById('loadingSpinner').style.display = 'block';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (!isCelsius) {
                data.main.temp = (data.main.temp * 9 / 5) + 32;
            }
            weatherdata = data;
            displayWeatherData(data);
        } else {
            weatherDetails.innerHTML = '<p>Error: City not found</p>';
        }
        document.getElementById('loadingSpinner').style.display = 'none';
    };
    xhr.onerror = function () {
        weatherDetails.innerHTML = '<p>Error: Network Error.</p>';
        document.getElementById('loadingSpinner').style.display = 'none';
    };
    xhr.send();
}

function getForecastData(city) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const days = {};
            fiveDayForecast = [];

            data.list.forEach(entry => {
                const date = entry.dt_txt.split(' ')[0];
                if (!days[date] && entry.dt_txt.includes("12:00:00")) {
                    days[date] = true;
                    fiveDayForecast.push(entry);
                }
            });

            if (!isCelsius) {
                fiveDayForecast.forEach(entry => {
                    entry.main.temp = (entry.main.temp * 9 / 5) + 32; // Convert to Fahrenheit
                });
            }
            generateCharts(fiveDayForecast);
        } else {
            console.log('Error: City not found');
        }
    };
    xhr.onerror = function () {
        console.log('Error: Network Error');
    };
    xhr.send();
}

function displayWeatherData(data) {
    const { main, weather, name, wind } = data;

    const displayedTemp = isCelsius ? `${main.temp.toFixed(1)}°C` : `${main.temp.toFixed(1)}°F`;

    weatherDetails.innerHTML = `
        <h3>${name}</h3>
        <p>Temperature: <span id="temp">${displayedTemp}</span></p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
        <p>Weather: ${weather[0].description}</p>
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}.png" alt="${weather[0].description}">
    `;

    updateWidgetBackground(weather[0].main);
}

document.getElementById('toggleTemp').addEventListener('change', (e) => {
    toggleTemperature(weatherdata, fiveDayForecast);
});

function toggleTemperature(data, forecastData) {

    let currentTemp = data.main.temp;

    if (isCelsius) {
        const fahrenheit = (currentTemp * 9 / 5) + 32;
        data.main.temp = fahrenheit;
        isCelsius = false;
        forecastData.forEach(entry => {
            entry.main.temp = (entry.main.temp * 9 / 5) + 32;
        });
    } else {
        const celsius = (currentTemp - 32) * 5 / 9;
        data.main.temp = celsius;
        isCelsius = true;

        forecastData.forEach(entry => {
            entry.main.temp = (entry.main.temp - 32) * 5 / 9;
        });
    }

    displayWeatherData(data);
    generateCharts(forecastData);
}

function updateWidgetBackground(condition) {
    weatherWidget.classList.remove('cloudy', 'sunny', 'rainy');
    if (condition.toLowerCase().includes('cloud')) {
        weatherWidget.style.backgroundColor = '#d3d3d3';
    } else if (condition.toLowerCase().includes('sun')) {
        weatherWidget.style.backgroundColor = '#f1c40f';
    } else if (condition.toLowerCase().includes('rain')) {
        weatherWidget.style.backgroundColor = '#3498db'; 
    } else {
        weatherWidget.style.backgroundColor = '#ffffff';
    }
}

let barChartInstance = null;
let doughnutChartInstance = null;
let lineChartInstance = null;

function generateCharts(data) {
    if (barChartInstance) {
        barChartInstance.destroy();
    }
    if (doughnutChartInstance) {
        doughnutChartInstance.destroy();
    }
    if (lineChartInstance) {
        lineChartInstance.destroy();
    }

    const labels = data.slice(0, 5).map(day => new Date(day.dt_txt).toLocaleDateString());
    let temps = data.slice(0, 5).map(day => day.main.temp);


    barChartInstance = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (' + (isCelsius ? '°C' : '°F') + ')',
                data: temps,
                backgroundColor: ['rgba(255, 203, 71, 0.5)', 'rgba(61, 90, 241, 0.5)', 'rgba(235, 87, 87, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)'],
                borderColor: ['rgba(255, 203, 71, 1)', 'rgba(61, 90, 241, 1)', 'rgba(235, 87, 87, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 2
            }]
        },
        options: {
            animations: {
                y: {
                    type: 'number',
                    duration: 1000,
                    delay: (context) => {
                        if (context.active) {
                            return context.dataIndex * 100;
                        }
                        return 0;
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: Math.min(...temps) - 5,
                    max: Math.max(...temps) + 5,
                    ticks: {
                        stepSize: 2
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });

    const conditions = data.slice(0, 5).map(day => day.weather[0].main);
    const conditionCount = {};
    conditions.forEach(cond => conditionCount[cond] = (conditionCount[cond] || 0) + 1);
    
    doughnutChartInstance = new Chart(document.getElementById('doughnutChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCount),
            datasets: [{
                data: Object.values(conditionCount),
                backgroundColor: ['#ffcb47', '#4a90e2', '#d3d3d3']
            }]
        },
        options: {
            animations: {
                doughnut: {
                    animateScale: true,
                    animateRotate: true
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    lineChartInstance = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (' + (isCelsius ? '°C' : '°F') + ')',
                data: temps,
                borderColor: 'rgba(61, 90, 241, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            animations: {
                tension: {
                    duration: 1000,
                    easing: 'easeOutBounce',
                    from: 1,
                    to: 0,
                    loop: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: Math.min(...temps) - 5,
                    max: Math.max(...temps) + 5,
                    ticks: {
                        stepSize: 2
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}



