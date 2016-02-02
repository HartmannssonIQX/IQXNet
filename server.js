var express    = require('express')
var bodyParser = require('body-parser')
var logger     = require('morgan')
var https = require('https')
var http = require('http')
var fs = require('fs')
var config=require('./config')
var app = express()
var FileStreamRotator = require('file-stream-rotator')
var moment = require('moment')

//Set up the routing middleware:
app.use(bodyParser.json())  // Parse JSON request body into req.body

app.use(require('./srvControllers/auth'))  // Decode the x-auth header. This is required here so as to display the username in the log

var logFormat=':method :url | :req[iqxauthuser] | :status | :response-time ms | :res[content-length] bytes'
if (config.logToFile) {
  var logDir=__dirname+'/logs'
  try {
    fs.mkdirSync(logDir)
  } catch(err) {}
  logger.token('time', function(){ return moment().format('HH:mm:ss') })
  logFormat=':time '+logFormat
  var dailyLogStream = FileStreamRotator.getStream({
    filename: logDir + '/%DATE%.log',
    frequency: 'daily',
    verbose: false,
    date_format: 'YYYY-MM-DD'
    })
  app.use(logger(logFormat,{stream: dailyLogStream}))
} else {  // Just show on console
  app.use(logger(logFormat))
}

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
	

