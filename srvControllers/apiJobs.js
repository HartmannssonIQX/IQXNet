var router=require('express').Router()
var _ = require('lodash')
var config=require('../config')
var apiTools=require('./apiTools')
var fs = require('fs')
var path = require('path')
var chokidar = require('chokidar')
var Q = require('q')

// The API for job searching

var webVacancies = {}
var webVacanciesValid = false
//var WebVacanciesFile = './data/WebVacancies.json'
var WebVacanciesFile = path.join(__dirname, '../data/WebVacancies.json')
function loadWebVacancies() {
  console.log('Updating web vacancies from ' + WebVacanciesFile)
  fs.exists('data', function(exists){
    if(!exists){
      fs.mkdir('data')
      fs.writeFile('data/WebVacancies.json', '{}')
    }
    else{
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
  })
}

chokidar.watch(WebVacanciesFile, {awaitWriteFinish:{stabilityThreshold:5000,pollInterval:1000}}).on('change', function(event, path) {
  loadWebVacancies()
  })

router.get('/searchFields',function (req,res,next) {
	if (webVacanciesValid){
		res.send(apiTools.IQXSuccess(webVacancies.searchFields))
	} else {
		res.send(apiTools.IQXFailure('No valid web vacancies'))
	}
})

function getAppliedJobs(req,res){  // Returns a PROMISE

  if(req.headers.iqxauthuser!=undefined){
    return ['XX18BNBH301120150002','XX0Q77VS180520120004','XX0S5FVS260920120000']
  }else{
    return []
  }
  
}

router.post('/searchJobs',function (req,res) {
  var alreadyApplied =  getAppliedJobs(req,res)

  var srchJobs=_.filter(webVacancies.jobs,function(job) {
    return _.every(req.body,function (xValue,xKey) {
      if (!xKey.match(/^Q/)) {
        return (job[xKey]==xValue)
      } else {
        return _.find(job.questions,{tagid:xKey.substring(2),value:xValue})
      }
      })
    })

    //feedback for applied (popup perhaps)
  // Add VacancyID
  var resJobs=[]
  _.forEach(srchJobs,function(job){
    var resJob=[]
    _.forEach(job,function(val,key){
      if (key.match(/^[TX]/)) {
        resJob.push({caption:key.substring(2).replace('_', ' '),
                     value:val,
                     type:key.substring(0,1)})
      }
      else if(key =='V_vacancyID' /* && isLoggedIn*/) {
        resJob.push({caption:'Applied',
                     vacancyID:key,
                     value:val,
                     type:'K',
                     applied:alreadyApplied.indexOf(val)!=-1})
      }
      })
    resJobs.push(resJob)
    })
	res.send(apiTools.IQXSuccess(resJobs))
  
})


router.post('/apply',function (req,res) {
   
    console.log('/apply')
})


loadWebVacancies()

module.exports=router

