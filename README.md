# WeatherChatApp

WeatherChatApp is a responsive weather dashboard that provides real-time weather information and a 5-day forecast using the OpenWeather API. It includes interactive charts for visualizing forecast data and a chatbot for answering weather-related queries. The dashboard supports geolocation to automatically display the weather of the user's current location.

## Live Demo

You can access the live version of WeatherChatApp at: [https://abdullah12-dev.github.io/WeatherChatApp/](https://abdullah12-dev.github.io/WeatherChatApp/)

## Features

- **Current Weather Information**: Displays real-time weather data for any searched city.
- **5-Day Weather Forecast**: Shows forecasted temperature, weather conditions, and more for the next 5 days.
- **Interactive Charts**: Utilizes Chart.js to display:
  - Vertical Bar Chart for temperature forecast.
  - Doughnut Chart for weather condition distribution.
  - Line Chart for temperature changes over time.
- **Chatbot Integration**: A chatbot that responds to questions.
- **Unit Conversion**: Toggle between Celsius and Fahrenheit for temperature display.
- **Geolocation Support**: Detects the user's location automatically and shows weather data for the current location.
- **Responsive Design**: Fully responsive design that works on both desktop and mobile devices.

### Weather Data Filters

- View temperatures in ascending or descending order.
- Filter days with rain or specific weather conditions.
- Display the day with the highest or lowest temperature.

## Technologies Used

- **HTML5**: Structure of the web pages.
- **CSS3**: Custom styling for the weather app.
- **JavaScript (ES6)**: For fetching API data, updating the UI, and handling interactivity.

## Additional Notes

- The project uses the free tier of the OpenWeather API, which may have a rate limit (e.g., 60 requests/minute). Be mindful of this when testing.
- The geolocation feature requires the browser’s permission to access location and will only work over secure HTTPS connections.
- Interactive charts are built using Chart.js, with animations such as delays for bar and doughnut charts and drop animation for line charts.
