"use strict";
/* Load the HTTP library */
var http = require("http");
let port = 8081;

/* Create an HTTP server to handle responses */
http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello Hackaton");
  response.end();
}).listen(process.env.PORT, process.env.IP);

