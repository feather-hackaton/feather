
$(document).ready(function() {
  navigator.geolocation.getCurrentPosition(function(position) {
  loadWeather(position.coords.latitude+','+position.coords.longitude);
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
    },
    error: function(error) {
      $("#weather").html('<p id="weatherinfo">'+error+'</p>');
    }
  });
}

function returnWeatherIcon(desc){

    var checkFair = /(fair|hot|sunny)/i;
    var checkClouds = /cloudy/i;
    var checkRain = /(rain|drizzle|shower|thunder)/i;
    var checkFog = /(haze|foggy|smoky|fog)/i;

    if(checkFair.test(desc))
        //document.body.style.backgroundImage="url(../pictures/Sunny.jpg)";
        return "wb sunny"
    if(checkClouds.test(desc))
        document.body.style.backgroundImage="url('../pictures/Cloudy.jpg')";
        return "cloud"
    if(checkRain.test(desc))
        //document.body.style.backgroundImage="url(../pictures/Rainy.jpg)";
        return "grain"
    if(checkFog.test(desc))
        //document.body.style.backgroundImage="url(../pictures/Cloudy.jpg)";
        return "cloud"
}
