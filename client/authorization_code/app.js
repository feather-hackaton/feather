/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
const fetch = require('isomorphic-fetch');
var Weather = require('./public/javascripts/Weather.js').Weather;
var Secret = require('../../DAL/secret.js').Secret;
var weather = new Weather();
var secret = new Secret();

var port = 3000;

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = secret.getClientId(); // Your client id
var client_secret = secret.getClientSecret(); // Your secret
var redirect_uri = secret.getRedirectUri(); // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
  .use(cookieParser());

app.get('/login', function (req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private playlist-read-private playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };



        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {

          var userId = response.body['id'];

          if (userId != null) {
            createPlaylist(userId, "Feather-Feel the weather", access_token, function (playlist) {
              console.log('created playlist', playlist);
              addTracksToPlaylist(userId, playlist, access_token, function (r) {
                console.log('tracks added.');
              });
            });
          }
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

// SKAPA SPELLISTA
function createPlaylist(username, playlistName, token, callback) { 
  var url = 'https://api.spotify.com/v1/users/' + username + '/playlists/';
  
  fetch(url, { //Get all of the current users playlists. Could be moved to a function of its own to reduce clutter..
    method: 'GET',
    body: JSON.stringify({
      user_id: username,
      public: 'true'
    }),
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    }
  })
    .then(res => res.json())
  .then(json => {if(json.items[0].name != "Feather-Feel the weather"){ //Check if a feather list already exists after fetching. If none exists, create one.
    fetch(url, { //Posts to the users Spotify, adding a playlist called "Feather-Feel the weather"
      method: 'POST',
      body: JSON.stringify({
        name: playlistName,
        public: 'true'
      }),
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
    })  
      .then(json => callback(playlistName)) //DET ÄR INTE NAMNET SOM SKA VIDARE, DET ÄR ID PÅ SPELLISTA
      .catch(err => console.log(err))
  }else{
    console.log("Feather list already exists. Fix this some day..") //since a featherlist already exists, we instead currently do not run the applicaiton.
  }})                                                               //Future work is to remove the feather list and replace it with a new one.
}
// Add tracks to playlist
function addTracksToPlaylist(userId, playlistName, token, callback) {
  console.log('addTracksToPlaylist', userId, playlistName);
  var url = 'https://api.spotify.com/v1/users/'+userId+'/playlists'
  var playlistID = null;
  fetch(url, { //Fetch the users playlists
    method: 'GET',
    body: JSON.stringify({
      user_id: userId,
      public: 'true'
    }),
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    }
  })
    .then(res => res.json())
    .then(json => {for (var index = 0; index < json.items.length; index++) { //loop all of the users playlists.
      var element = json.items[index]; //current place
      if(element.name === "Feather-Feel the weather") //when we encounter a playlist with the feather name
      {
        playlistID = element.id; // take the ID of the playlist, this is used to add songs later.
      } 
    }
  })
    console.log(playlistID) //not logging for some reason
    .catch(err => console.log(err))
}    

console.log('Listening on port' + port);
app.listen(port);
