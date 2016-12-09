
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
      html = '<p>'+weather.city+'</p>';
      html += '<p>'+weather.temp+'&deg;C</p>';  
       
      html += '<p>'+weather.currently+'</p>';
      html += '<i class="material-icons prefix">'+returnWeatherIcon(weather.currently)+'</i>'; 
      
      $("#weather").html(html);
    },
    error: function(error) {
      $("#weather").html('<p>'+error+'</p>');
    }
  });
}

function returnWeatherIcon(desc){

    var checkFair = /(fair|hot|sunny)/i;
    var checkClouds = /cloudy/i;
    var checkRain = /(rain|drizzle|shower|thunder)/i;
    var checkFog = /(haze|foggy|smoky|fog)/i;
 
    if(checkFair.test(desc))
        return "wb sunny"
    if(checkClouds.test(desc))
        return "cloud"
    if(checkRain.test(desc))
        return "grain"
    if(checkFog.test(desc))
        return "cloud"
}
