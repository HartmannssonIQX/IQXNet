angular.module('app')
.service('ApiSvc', function ($http, $filter, $q, ApplicationSvc) {
  var svc=this

  svc.StringToDate=function (sDate) {
     if (sDate) { // Looking for UK format with 4 digit year and any separator (may be prefixed by alpha day of week)
       var ar=sDate.match(/(\d+).(\d+).(\d{4})/)
       if (ar.length<4) {return null}
       return new Date(ar[3],ar[2]-1,ar[1])
       //return new Date(sDate.substr(10,4),sDate.substr(7,2)-1,sDate.substr(4,2))
     } else {
      return null
     }
    }
    
  svc.StringToTime=function (sTime) {
     if (sTime) {
       var ar=sTime.match(/^(\d{1,2})[:](\d{2})/)
       if (ar.length<3) {return null}
       var d=new Date()
       d.setHours(ar[1])
       d.setMinutes(ar[2])
       return d
     } else {
       return null
     }
    }
    
  svc.TimeToString=function(dTime) {
    return $filter('date')(dTime, 'HH:mm')  // HH for 24 hour
    }
    
  svc.DateToString=function(dDate) {
    return $filter('date')(dDate, 'dd/MM/yyyy')
    }
    
  svc.SafeJSONValue=function (val) {
     if (angular.isDate(val)) {
      return svc.DateToString(val)
     } else if (typeof val == 'boolean') {
      return (val ? 1 : 0)
     } else {
      return val
     }
    }
    
  svc.ValuesAreEqual=function (x,y) {
    if (angular.isDate(x) && angular.isDate(y)) {
      return (x.getTime() == y.getTime())
     } else {
      return (x === y)
     }
    }
    
  svc.IQXResultSucceeded=function (rowData) {
    var x={}    // Construct a successful IQXResult with the rowData supplied
    x.attrs={success:1}
    x.Row=rowData
    return $q.when({data:{IQXResult:x}})   // return as a fulfilled promise
    }
    
  svc.CheckIQXResult=function (data) {
    if (data.IQXResult == undefined) {throw 'IQXResult missing'}
    if (data.IQXResult.attrs.success == '0') {throw data.IQXResult.IQXFailure.attrs.message}
    }
    
  svc.ExtractError=function (err) {
    if (angular.isObject(err)) {
      return err.data || 'Web Server Unavailable'
    } else {
      return err
      }
    }
    
  function extendedFetchAPI(scope,options) {
    if (!(options.multiRow && options.sliceSize)) {return options.fetchAPI}
    var qry='pSliceSize='+options.sliceSize+'&pSlice='+(scope.currentPage-1)  // Slices start at 0
    if (options.fetchAPI.indexOf('?')>=0) {
      return options.fetchAPI+'&'+qry
    } else {
      return options.fetchAPI+'?'+qry
    }  
    }
     
  svc.fetch=function (scope,options) {
    var theResult, doFetch
    if (!options.fetchAPI) {return $q.reject(scope.formError='No fetchAPI in options')}
    if (!ApplicationSvc.isLoggedIn && !options.notLoggedIn) {return $q.reject(scope.formError='Not logged in')}
    if (angular.isString(options.fetchAPI)) {
      doFetch=$http.get('/api/'+extendedFetchAPI(scope,options))
    } else {
      doFetch=svc.IQXResultSucceeded(options.fetchAPI)
    }
    return doFetch  
      .then(function (res) {
        svc.CheckIQXResult(res.data)  // Checks the IQXResult construct and, if failed, throws exception with the message
        if (options.multiRow) {
          if (res.data.IQXResult.Row == undefined) {
            theResult=[]
          } else if (angular.isArray(res.data.IQXResult.Row)) {
            theResult=res.data.IQXResult.Row
          } else {  // Make single row into an array
            theResult=[res.data.IQXResult.Row]
          }  
          if (options.sliceSize && theResult.length<options.sliceSize) {
            // Make this the last page
            scope.totalItems=(scope.currentPage-(theResult.length===0 && scope.currentPage>1?1:0))*options.sliceSize  
            }
        } else {  // Single row expected
          if (res.data.IQXResult.Row == undefined) {
            theResult={}
          } else if (angular.isArray(res.data.IQXResult.Row)) {  // Extract first row or empty object if none
            theResult=(res.data.IQXResult.Row.length>0) ? res.data.IQXResult.Row[0] : {}
          } else {  
            theResult=res.data.IQXResult.Row
           }          
          }
        angular.forEach(options.dateFields, function (value) {
          if (options.multiRow) {
            angular.forEach(theResult, function (row) {
              if (row[value] != undefined) {
                row[value]=svc.StringToDate(row[value])
                }
              })
          } else if (theResult[value] != undefined) {
            theResult[value]=svc.StringToDate(theResult[value])
            }
          })
        angular.forEach(options.timeFields, function (value) {
          if (options.multiRow) {
            angular.forEach(theResult, function (row) {
              if (row[value] != undefined) {
                row[value]=svc.StringToTime(row[value])
                }
              })
          } else if (theResult[value] != undefined) {
            theResult[value]=svc.StringToTime(theResult[value])
            }
          })
        angular.forEach(options.booleanFields, function (value) {
          if (options.multiRow) {
            angular.forEach(theResult, function (row) {
              if (row[value] != undefined) {
                row[value]=(row[value] == 1)
                }
              })
          } else if (theResult[value] != undefined) {
            theResult[value]=(theResult[value] == 1)
            }
          })
        if (options.fetchTarget) {
          scope[options.fetchTarget]=theResult
        } else if (options.multiRow) {
          scope.theRecords=theResult
        } else {
          scope.theRecord=theResult
          }
        })
      .catch(function (err) {
        return $q.reject(scope.formError=svc.ExtractError(err))
        })
    }
    
  svc.exec=function(scope,api,postObject,notLoggedIn) {
    if (!(ApplicationSvc.isLoggedIn || notLoggedIn)) {return $q.reject(scope.formError='Not logged in')}
    var postvars={}
    angular.forEach(postObject, function (value,key) {
      postvars[key]=svc.SafeJSONValue(value)
      })
    return $http.post('/api/'+api,postvars)
      .then(function (res) {
        svc.CheckIQXResult(res.data)  // Checks the IQXResult construct and, if failed, throws exception with the message
        return res.data // Promise succeeds - we may want the IQXResult
        })
      .catch(function (err) {
        return $q.reject(scope.formError=svc.ExtractError(err))
        })
    }

})
