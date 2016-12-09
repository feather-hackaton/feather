"use strict";

var clientId = '570f9e14b7554b93a44d0eebbe819a58';
var clientSecret = 'b32fc738eeee408d906cf084d20359c9';


   function Secret() {}

   Secret.prototype.getClientId = function() {
       return clientId;
   };

   Secret.prototype.getClientSecret = function() {
       return clientSecret;
   };

exports.Secret = Secret;
