const axios = require('axios');

module.exports = class Weather {

  static async getWeatherForecast(place) {
    try {
      const rawData = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURI(place)}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`);
      return Weather._transformWeatherData(place, rawData.data);
    } catch (e) {
      throw new Error(`Weather: Failed to retrieve data in "getWeatherForecast" method.\n ${e} `);
    }
  }

  static _transformWeatherData(place, weatherData) {
    try {
      const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
      const fullDays = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      const today = new Date();
      const forecast = {};
      today.setHours(0);
      today.setMinutes(0);
      Array.isArray(weatherData.list) && weatherData.list.forEach(e => {
        const currentDate = new Date(e.dt * 1000);
        currentDate.setHours(0);
        currentDate.setMinutes(0);
        const forecastKey = currentDate.toISOString();
        const mainWeather = Array.isArray(e.weather) ? e.weather[0] : {};
        const weather = (forecast[forecastKey]) ? Weather._getPrioritizedWeather(mainWeather.main, forecast[forecastKey]) : mainWeather.main;
        const forecastDay = currentDate.getDay();
        !forecast[forecastKey] && (forecast[forecastKey] = {
          weather,
          temp: {
            current: parseInt(e.main.temp),
            max: parseInt(e.main.temp_max),
            min: parseInt(e.main.temp_min),
          },
          day: days[forecastDay],
          icon: `http://openweathermap.org/img/wn/${mainWeather.icon}@2x.png`,
        });

        (forecast[forecastKey].weather !== weather) && (forecast[forecastKey].weather = weather);
        (forecast[forecastKey].temp.max < parseInt(e.main.temp_max)) && (forecast[forecastKey].temp.max = parseInt(e.main.temp_max));
        (forecast[forecastKey].temp.min > parseInt(e.main.temp_min)) && (forecast[forecastKey].temp.min = parseInt(e.main.temp_min));
      });

      return {
        place,
        day: fullDays[today.getDay()],
        ...Object.values(forecast)[0],
        forecast: Object.values(forecast).slice(1),
      };
    } catch (e) {
      throw new Error(`Weather: Failed to transform data in "_transformWeatherData" method. \n ${e}`);
    }

  }

  static _getPrioritizedWeather(currentCondition = 'Clear', nextCondition) {
    const weatherCategories = ['Clear', 'Clouds', 'Atmosphere', 'Drizzle', 'Rain', 'Thunderstorm', 'Snow'];
    return (nextCondition && currentCondition && weatherCategories.indexOf(nextCondition) > weatherCategories.indexOf(currentCondition)) ? nextCondition : currentCondition;
  }

}

