var router=require('express').Router()
var _ = require('lodash')
var config=require('../config')
var apiTools=require('./apiTools')
var fs = require('fs')
var chokidar = require('chokidar')

// The API for job searching

var webVacancies = {}
var webVacanciesValid = false
var WebVacanciesFile = './data/WebVacancies.json'

function loadWebVacancies() {
  console.log('Updating web vacancies from ' + WebVacanciesFile)
  fs.readFile(WebVacanciesFile, function (err, data) {
		if (err) {return console.log(err)}
		webVacanciesValid=false
		try {
			webVacancies=JSON.parse(data) 
			webVacanciesValid=true
		} catch(err) {
			console.log('Error parsing '+WebVacanciesFile+' '+err)
		}
	})
	
}

chokidar.watch(WebVacanciesFile, {awaitWriteFinish:true}).on('change', function(event, path) {
  loadWebVacancies()
  })

router.get('/searchFields',function (req,res,next) {
	if (webVacanciesValid){
		res.send(apiTools.IQXSuccess(webVacancies.searchFields))
	} else {
		res.send(apiTools.IQXFailure('No valid web vacancies'))
	}
})

loadWebVacancies()

module.exports=router

