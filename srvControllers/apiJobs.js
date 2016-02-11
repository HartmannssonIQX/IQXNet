var router=require('express').Router()
var _ = require('lodash')
var config=require('../config')
var apiTools=require('./apiTools')
var fs = require('fs')
var path = require('path')
var chokidar = require('chokidar')

// The API for job searching

var webVacancies = {}
var webVacanciesValid = false
//var WebVacanciesFile = './data/WebVacancies.json'
var WebVacanciesFile = path.join(__dirname, '../data/WebVacancies.json')
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

chokidar.watch(WebVacanciesFile, {awaitWriteFinish:{stabilityThreshold:5000,pollInterval:1000}}).on('change', function(event, path) {
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
  var awrRole = srch.xpath_Q_VED_AWR
  var subject = srch.xpath_Q_VED_SUB
  
  var jobs=webVacancies.jobs

  if(jobType!=undefined)
    jobs=_.filter(jobs,function(job){
      var r = job.TempPerm == jobType
      var r = job.V_TempPerm == jobType
      return r
    })
  if(visionType!=undefined)
    jobs=_.filter(jobs,function(job){
      var r = job.VQ_V_TYP == visionType
      return r
    })
  if(department!=undefined)
    jobs=_.filter(jobs,function(job){
      var r = job.V_departmentid == department
      return r
    })
  if(awrRole!=undefined)
    jobs=_.filter(jobs,function(job){
      if(job.questions.length>0){
        var r = job.questions[0].value == awrRole
        return r
      }
    })
  if(subject!=undefined)
    jobs=_.filter(jobs,function(job){
      if(job.questions.length>0){
        var r = job.questions[0].value == subject
        return r
      }
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

