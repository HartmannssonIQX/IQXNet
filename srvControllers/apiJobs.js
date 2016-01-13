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

router.get('/searchFields',function (req,res,next) {   //what is next there for?
	if (webVacanciesValid){
		res.send(apiTools.IQXSuccess(webVacancies.searchFields))
	} else {
		res.send(apiTools.IQXFailure('No valid web vacancies'))
	}
})

router.post('/searchJobs',function (req,res) {
  var srch = req.body
  var jobType = srch.xpath_tempperm
  var department = srch.xpath_departmentid
  var visionType = srch.xpath_Q_V_TYP
  
  var jobs=webVacancies.jobs  

  if(jobType!=undefined)
    jobs=_.filter(jobs,function(job){
      var r = job.TempPerm == jobType
      return r
    })
  if(visionType!=undefined)
    jobs=_.filter(jobs,function(job){
      var r = job.VQ_V_TYP == visionType
      return r
    })
  if(department!=undefined)
    jobs=_.filter(jobs,function(job){
      var r = job.departmentID == department
      return r
    })
    
  //Hint: use a _.every inside your _.filter to iterate the req.body params
    /*
    _.forEach(jobs, function(value, key){
      console.log(key)
      console.log(value.vacancyID)
    })
    */
    
  console.log(jobs.length)
	res.send(apiTools.IQXSuccess(jobs))
})
loadWebVacancies()

module.exports=router

