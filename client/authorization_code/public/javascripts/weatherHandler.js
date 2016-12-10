$(document).ready(function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    return loadWeather(position.coords.latitude + ',' + position.coords.longitude);
  });
});


function loadWeather(location, woeid) {
  $.simpleWeather({
    location: location,
    woeid: woeid,
    unit: 'c',
    success: function(weather) {
      console.log("Väder: " + weather.city + " | " + weather.temp + "C")
      html = '<p id="weatherinfo">'+weather.city+'</p>';
      html += '<p id="weatherinfo">'+weather.temp+'&deg;C</p>';

      html += '<p id="weatherinfo">'+weather.currently+'</p>';
      html += '<i id="weatherinfo" class="material-icons prefix">'+returnWeatherIcon(weather.currently)+'</i>';

      $("#weather").html(html);
      currentWeather = weather.currently;
      return weather.currently;
    },
    error: function(error) {
      $("#weather").html('<p id="weatherinfo">'+error+'</p>');
    }
  });
}

function returnWeatherIcon(desc){

    var checkFair = /fair|hot|sunny/i;
    var checkClouds = /cloudy/i;
    var checkRain = /rain|drizzle|shower|thunder/i;
    var checkFog = /haze|foggy|smoky|fog/i;

    if(checkClouds.test(desc)){
        document.body.style.backgroundImage="url('../Pictures/Cloudy.jpg')";
        return "cloud"
    }
    if(checkFair.test(desc)){
        document.body.style.backgroundImage="url('../Pictures/Sunny.jpg')";
        return "wb sunny"
    }
    if(checkRain.test(desc)){
        document.body.style.backgroundImage="url('../Pictures/Rainy.jpg')";
        return "grain"
    }
    if(checkFog.test(desc)){
        document.body.style.backgroundImage="url('../Pictures/Cloudy.jpg')";
        return "cloud"
    }
}