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
   
  var srchJobs=_.filter(webVacancies.jobs,function(job) {
    return _.every(req.body,function (xValue,xKey) {
      if (!xKey.match(/^Q/)) {
        return (job[xKey]==xValue)
      } else {
        return _.find(job.questions,{tagid:xKey.substring(2),value:xValue})
      }
      })
    })
  var resJobs=[]
  _.forEach(srchJobs,function(job){
    var resJob=[]
    _.forEach(job,function(val,key){
      if (key.match(/^[TX]/)) {
        resJob.push({caption:key.substring(2).replace('_', ' '),
                     value:val,
                     type:key.substring(0,1)})
      }
      })
    resJobs.push(resJob)
    })
	res.send(apiTools.IQXSuccess(resJobs))
  
//  console.log(srch)
})


loadWebVacancies()

module.exports=router

