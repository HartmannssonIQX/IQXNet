var express    = require('express')
var bodyParser = require('body-parser')
var https = require('https')
var http = require('http')
var fs = require('fs')
var config=require('./config')
var app = express()
var logger = require('./srvControllers/logger')

//Set up the routing middleware:
app.use(bodyParser.json())  // Parse JSON request body into req.body

app.use(require('./srvControllers/auth'))  // Decode the x-auth header. This is required here so as to display the username in the log

logger(app)  // Set up request logging - either console (default) or daily file in logs directory

// Route the requests to the controllers:
app.use(require('./srvControllers'))

var port=process.env.PORT || config.publicPort   // A separate server instance for automated testing can be ensured by setting env.PORT in the test harness
if (port) {
	var server = http.createServer(app).listen(port, function () {
		console.log('Server listening on %d', server.address().port)
		})
	}
	
var secureport=config.publicSecurePort
if (secureport && !process.env.PORT) {    // Don't start secure server if this is an automated test
	var options = {
		key: fs.readFileSync('./key.pem'),
		cert: fs.readFileSync('./cert.pem')
		}
	var secureserver = https.createServer(options, app).listen(secureport, function () {
		console.log('Secure server listening on %d', secureserver.address().port)
		})
	}
	

