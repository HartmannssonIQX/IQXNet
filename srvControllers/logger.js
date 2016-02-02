var morgan = require('morgan')
var fs = require('fs')
var path = require('path')
var config=require('../config')
var FileStreamRotator = require('file-stream-rotator')
var moment = require('moment')

module.exports=function (app) {

  var logFormat=':method :url | :req[iqxauthuser] | :status | :response-time ms | :res[content-length] bytes'
  if (config.logToFile) {
    var logDir=path.join(__dirname, '../logs')
    try {
      fs.mkdirSync(logDir)
    } catch(err) {}
    morgan.token('time', function(){ return moment().format('HH:mm:ss') })
    logFormat=':time '+logFormat
    var dailyLogStream = FileStreamRotator.getStream({
      filename: logDir + '/%DATE%.log',
      frequency: 'daily',
      verbose: false,
      date_format: 'YYYY-MM-DD'
      })
    app.use(morgan(logFormat,{stream: dailyLogStream}))
  } else {  // Just show on console
    app.use(morgan(logFormat))
  }

}