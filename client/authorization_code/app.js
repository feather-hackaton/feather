/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
var axios = require('axios');
const fetch = require('isomorphic-fetch');
var Secret = require('../../DAL/secret.js').Secret;
var secret = new Secret();
var port = 3001;

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

    /**
     * After auth and you are logged in.
     */
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };


        var id1;
        
        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          id1 = response.body['id']
        console.log("hadad: " + id1);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/signed_in#' +
        querystring.stringify({
          id: id1
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

app.get('/signed_in', function (req, res) {
  console.log("res: "+ res);
  console.log("req: "+ req)
  var id = res.body['id'];

  console.log("detta är id :" + id);

  if (id != null) {
    console.log("Detta är inte null");
    createPlaylist(id, "feather", access_token, function (playlist) {

      console.log('created playlist', playlist);
      console.log("Vädret är :");
      /*addTracksToPlaylist(id, playlist, function (r) {
        console.log('tracks added.');
       
      });*/
    });
  }

});

// SKAPA SPELLISTA
function createPlaylist(username, name, token, callback) {
    console.log('createPlaylist', username, "feather");
    var url = 'https://api.spotify.com/v1/users/' + username +
      '/playlists';

    console.log(token)

    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Feather-Feel the weather',
        public: 'true'
      }),
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(json => callback(json))
      .catch(err => console.log(err))
  }

// LÄGG TILL LÅTAR I SPELLISTA
function addTracksToPlaylist(username, playlist, tracks, callback) {
    console.log('addTracksToPlaylist', username, playlist, tracks);
    var url = 'https://api.spotify.com/v1/users/' + username +
      '/playlists/' + playlist +
      '/tracks';

    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Feather-Feel the weather',
        public: 'true'
      }),
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.log(err))
  }


/*$.ajax(url, {
  method: 'POST',
  data: JSON.stringify(tracks),
  dataType: 'text',
  headers: {
    'Authorization': 'Bearer ' + g_access_token,
    'Content-Type': 'application/json'
  },
  success: function (r) {
    console.log('add track response', r);
    callback(r.id);
  },
  error: function (r) {
    callback(null);
  }
});*/
    

app.listen(3000);
console.log('Listening on port' + port);
app.listen(port);
