const geminiApiKey = 'AIzaSyCTtOGj8XYnl8NkjNOqt2mxkZRDDajQLNk';
const apiKey = '07c4fc833f325d21777a7bff1522cf45';

const citySearch = document.getElementById('citySearch');
const searchIcon = document.querySelector('.search-icon');
const forecastTableBody=document.querySelector('#forecastTable tbody');

let lastCity = '';
let isCelsius = true;
let fiveDayForecast =null;


window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
            const data = await response.json();
            lastCity=data.name;
            getForecastData(lastCity);
        });
    } else {
     //   weatherDetails.innerHTML = '<p>Geolocation is not supported by this browser.</p>';
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
        getForecastData(city);
        lastCity = city;
    }
}

async function getForecastData(city) {
    try {
        // Show the spinner
        document.getElementById('loadingSpinner').style.display = 'block';

        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        
        // Hide the spinner once data is fetched
        document.getElementById('loadingSpinner').style.display = 'none';

        // Process and display the data
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
                entry.main.temp = (entry.main.temp * 9 / 5) + 32;
            });
        }
        if (fiveDayForecast.length > rowsPerPage) {
            document.querySelector('.pagination').style.display = 'flex';
        } else {
            document.querySelector('.pagination').style.display = 'none';
        }
    
        currentPage = 1;
        displayForecastData();

    } catch (error) {
        console.log(error.message);
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

document.getElementById('toggleTemp').addEventListener('change', (e) => {
    toggleTemperature(fiveDayForecast);
});

function toggleTemperature(forecastData) {

    if (isCelsius) {
        isCelsius = false;
        forecastData.forEach(entry => {
            entry.main.temp = (entry.main.temp * 9 / 5) + 32;
        });
    } else {
        isCelsius = true;
        forecastData.forEach(entry => {
            entry.main.temp = (entry.main.temp - 32) * 5 / 9;
        });
    }
    displayForecastData(fiveDayForecast)

}

let currentPage = 1;
const rowsPerPage = 10;

function displayForecastData() {
    document.getElementById('cityName').textContent = lastCity;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedForecast = fiveDayForecast.slice(startIndex, endIndex);

    forecastTableBody.innerHTML = '';

    paginatedForecast.forEach(day => {
        const row = `
            <tr>
                <td>${new Date(day.dt_txt).toLocaleDateString()}</td>
                <td>${day.main.temp.toFixed(1)}°${isCelsius ? 'C' : 'F'}</td>
                <td>${day.weather[0].description}</td>
            </tr>
        `;
        forecastTableBody.innerHTML += row;
    });

    updatePaginationButtons();
}

function updatePaginationButtons() {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(fiveDayForecast.length / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.add('pagination-btn');
        if (i === currentPage) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            currentPage = i;
            displayForecastData();
        });

        paginationContainer.appendChild(button);
    }
}



const filterSelect = document.getElementById('filterSelect');

function displayForecastData2(data) {
    forecastTableBody.innerHTML = '';

    if (!data || data.length === 0) {
        const noDataRow = `<tr><td colspan="3" style="text-align:center;">No data available to display.</td></tr>`;
        forecastTableBody.innerHTML = noDataRow;
        return;
    }


    data.forEach(day => {
        const row = `
            <tr>
                <td>${new Date(day.dt_txt).toLocaleDateString()}</td>
                <td>${day.main.temp.toFixed(1)}°${isCelsius ? 'C' : 'F'}</td>
                <td>${day.weather[0].description}</td>
            </tr>
        `;
        forecastTableBody.innerHTML += row;
    });
}

filterSelect.addEventListener('change', (e) => {
    const filterValue = e.target.value;

    if (filterValue === 'ascending') {
        const ascendingTemperatures = [...fiveDayForecast].sort((a, b) => a.main.temp - b.main.temp);
        displayForecastData2(ascendingTemperatures);
    } else if (filterValue === 'rainy') {
        const rainyDays = fiveDayForecast.filter(day => day.weather.some(condition => condition.main === 'Rain'));
        displayForecastData2(rainyDays);
    } else if (filterValue === 'highest') {
        const highestTempDay = fiveDayForecast.reduce((prev, curr) => (prev.main.temp > curr.main.temp) ? prev : curr);
        displayForecastData2([highestTempDay]);
    } else if (filterValue === 'descending') {
        const descendingTemperatures = [...fiveDayForecast].sort((a, b) => b.main.temp - a.main.temp);
        displayForecastData2(descendingTemperatures);
    } else {
        displayForecastData2(fiveDayForecast);
    }
});

async function getWeather(city) {
    try {

        document.getElementById('loadingSpinner').style.display = 'block';

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const currentData = await response.json();

        document.getElementById('loadingSpinner').style.display = 'none';

        let weatherMessage = '';
        if (currentData.cod === 200) {
            weatherMessage = `The current weather in ${city} is ${currentData.weather[0].description} with a temperature of ${currentData.main.temp}°C.<br><br>`;
        } else {
            return `Couldn't find current weather for ${city}.`;
        }

        if (fiveDayForecast && fiveDayForecast.length > 0) {
            let minTemp = Math.min(...fiveDayForecast.map(day => day.main.temp_min));
            let maxTemp = Math.max(...fiveDayForecast.map(day => day.main.temp_max));

            let forecastMessage = `<b>5-day Forecast:</b><br>`;
            fiveDayForecast.forEach(day => {
                const date = new Date(day.dt_txt).toLocaleDateString();
                const temp = day.main.temp.toFixed(1);
                const description = day.weather[0].description;

                forecastMessage += `• ${date}: ${description}, Temp: ${temp}°${isCelsius ? 'C' : 'F'}<br>`;
            });

            weatherMessage += forecastMessage;
            weatherMessage += `<br><b>Temperature Range:</b><br>Minimum: ${minTemp.toFixed(1)}°C<br>Maximum: ${maxTemp.toFixed(1)}°C`;
        } else {
            weatherMessage += "<br>Forecast data is currently unavailable.";
        }

        return weatherMessage;
    } catch (error) {
        document.getElementById('loadingSpinner').style.display = 'none';
        return 'Error fetching weather data.';
    }
}


async function handleChatInput() {
    const userInput = document.getElementById('chat-input').value.trim();
    const answerArea = document.getElementById('answer-area');

    if (!userInput) return;

    appendMessage(userInput, 'sent');

    document.getElementById('chat-input').value = '';

    let responseMessage = '';

    if (userInput.toLowerCase().includes('weather')) {
        responseMessage = await getWeather(lastCity);
    } else {
        responseMessage = await getGeminiResponse(userInput);
    }

    appendMessage(responseMessage, 'received');
    answerArea.scrollTop = answerArea.scrollHeight;
}

function appendMessage(message, type) {
    const answerArea = document.getElementById('answer-area');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.innerHTML = message;
    answerArea.appendChild(messageDiv);
}

document.getElementById('send-btn').addEventListener('click', async () => {
    await handleChatInput();
});

document.getElementById('chat-input').addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        await handleChatInput();
    }
});



async function getGeminiResponse(query) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    const body = {
        contents: [{
            parts: [{ text: query }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    return candidate.content.parts[0].text || 'No response text available.';
                } else {
                    return 'Response received, but no parts available.';
                }
            } else {
                return 'Response received, but no candidates available.';
            }
        } else {
            console.error('Gemini API error:', data);
            return `Error from Gemini: ${data.message || 'Unknown error'}`;
        }
    } catch (error) {
        console.error('Error fetching response from Gemini:', error);
        return 'Error fetching response from Gemini.';
    }
}
