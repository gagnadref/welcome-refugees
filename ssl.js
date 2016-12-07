var fs = require('fs');
var http = require('http');
var https = require('https');

var privateKey  = fs.readFileSync(__dirname + '/ssl/key.pem', 'utf8');
var certificate = fs.readFileSync(__dirname + '/ssl/cert.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };

var express = require('express');
var app = express();

// your express configuration here
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

app.get('/test', function(req, res) {
	fs.readFile(__dirname + '/test.html',
	  function (err, data) {
	    if (err) {
	      res.writeHead(500);
	      return res.end('Error loading');
	    }

	    res.writeHead(200, {"Content-Type": "text/html"});
	    res.end(data);
  	});
});

httpServer.listen(8080);
httpsServer.listen(8443);
