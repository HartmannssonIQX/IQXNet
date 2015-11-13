angular.module('app')
.controller('ProvTimesheetCtrl', function ($scope, $routeParams, $q, FormSvc, ApiSvc, ApplicationSvc) {
  FormSvc.setOptions($scope)
  $scope.ProvTSID=$routeParams.id  
  
  $scope.fetchTimesheet=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheet?pTempProvTimesheetID='+$scope.ProvTSID, 
      dateFields:['weekenddate'],booleanFields:['theirrefrequired']})
    }
  
  $scope.fetchTimesheetShifts=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheetshifts?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheetShifts',multiRow:true,dateFields:['weekenddate','shiftdate'],timeFields:['timefrom','timeto'],
      booleanFields:['tick']})
    }
  
  $scope.fetchTimesheetTimes=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheettimes?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheetTimes',multiRow:true,dateFields:['weekstartdate','shiftdate'],timeFields:['timefrom'],
      booleanFields:['dayticked']})
    }
  
  $scope.fetchTimesheetRates=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheetrates?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheetRates',multiRow:true})
    }
  
  $scope.load=function() {
    $scope.theRecord={}
    $scope.shiftTimesheet=false
    $scope.timeTimesheet=false
    return $scope.fetchTimesheet()
    .then(function () {   
      if ($scope.theRecord.timesheettype=='S') {
        $scope.shiftTimesheet=true
        return $scope.fetchTimesheetShifts()
      } else if ($scope.theRecord.timesheettype=='T') {
        $scope.timeTimesheet=true
        return $scope.fetchTimesheetTimes()
        }
      })
    .then(function () {
      if ($scope.theRecord.completed==1) {
        $scope.calculatedTimesheet=true
        return $scope.fetchTimesheetRates()
        }
      })
    }
    
  $scope.editShift=function(sh) {
    sh.formError=''
    $scope.bEditing=true
    $scope.safeShift=angular.copy(sh)  // Make safe copy in case of cancel edits
    sh.bEditShift=true
  }
  
  $scope.copyShift=function(sh){
    var newSh=angular.copy(sh)
    if (newSh.tempshiftid.substr(0,5)!=='Copy_') {
      newSh.tempshiftid='Copy_'+newSh.tempshiftid
      }
    $scope.bCopyingShift=true
    $scope.timesheetShifts.push(newSh)  
    $scope.editShift(newSh)
  }
  
  $scope.saveableShift=function(sh) {
    return {ptempshiftid:sh.tempshiftid,
            pshiftdate:ApiSvc.DateToString(sh.shiftdate),
            ptimefrom:ApiSvc.TimeToString(sh.timefrom),
            ptimeto:ApiSvc.TimeToString(sh.timeto),
            pbreakminutes:sh.breakminutes
            }
  }
  
  $scope.saveShift=function(sh) {
    $scope.dateClose('shiftdate')
    if (sh.theForm.$invalid) {return sh.formError='There are invalid values'}
    var saveData=$scope.saveableShift(sh)
    if ((!$scope.bCopyingShift) && angular.equals(saveData,$scope.saveableShift($scope.safeShift))) {return $scope.unEditShift(sh)}
    sh.formError=''
    return $scope.exec('call/NetProvTimesheetShiftSet',saveData)
    .then(function() { 
      $scope.bEditing=false
      $scope.bCopyingShift=false
      sh.bEditShift=false
      $scope.calculatedTimesheet=false    
      })
    .then(function() {
      $scope.fetchTimesheetShifts()
      })
  }
  
  $scope.saveableTime=function(sh) {
    return {ptempshiftid:sh.tempshiftid,
            pplacementid_date:sh.placementid + '_' + ApiSvc.DateToString(sh.shiftdate),
            phours:sh.hours,
            ptimefrom:ApiSvc.TimeToString(sh.timefrom)
            }
  }
  $scope.saveTime=function(sh) {
    if (sh.theForm.$invalid) {return sh.formError='There are invalid values'}
    var saveData=$scope.saveableTime(sh)
    if (angular.equals(saveData,$scope.saveableTime($scope.safeShift))) {return $scope.unEditShift(sh)}
    sh.formError=''
    return $scope.exec('call/NetProvTimesheetTimeSet',saveData)
    .then(function() { 
      $scope.bEditing=false
      sh.bEditShift=false
      $scope.calculatedTimesheet=false    
      })
    .then(function() {
      $scope.fetchTimesheetTimes()
      })
  }
  
  $scope.uncompleteTimesheet=function() {
    $scope.calculatedTimesheet=false 
  }
  
  $scope.unEditShift=function(sh) {
    $scope.dateClose('shiftdate')
    sh.formError=''
    $scope.bEditing=false
    if ($scope.bCopyingShift) {
      $scope.timesheetShifts.pop()
    } else {
      angular.copy($scope.safeShift,sh)  // Replace the contents of sh with the safe copy
    }
    $scope.bCopyingShift=false
    sh.bEditShift=false
  }
  
  $scope.shiftLength=function(sh) {
    var start=moment().hours(sh.timefrom.getHours()).minutes(sh.timefrom.getMinutes())
    var end=moment().hours(sh.timeto.getHours()).minutes(sh.timeto.getMinutes())
    var len=end.diff(start,'hours',true)
    if (len<=0) {len=24.0+len}
    if (sh.breakminutes) {len=len-sh.breakminutes/60}
    return len
  }
    
  $scope.calcTimeTimesheet=function() {
    return $scope.exec('service/ProvNonShiftTSProcessRateScript',{id:$scope.ProvTSID})
    .then(function() {
      $scope.calculatedTimesheet=true
      return $scope.fetchTimesheetRates()
      })
    }
    
  $scope.calc=function() {
    $scope.timesheetRates=[]
    if ($scope.timeTimesheet) {return $scope.calcTimeTimesheet()}
    var aShifts=[]
    angular.forEach($scope.timesheetShifts, function(value) {
      if (value.tick) {aShifts.push(value.tempshiftid)}
      })
    return $scope.exec('call/NetProvTimesheetShiftsSelect',{pTempProvTimesheetID:$scope.ProvTSID,pShiftList:aShifts.join()})
    .then(function() { 
      return $scope.exec('service/ProvTSProcessRateScript',{id:$scope.ProvTSID})
      })
    .then(function() {
      $scope.calculatedTimesheet=true
      return $scope.fetchTimesheetRates()
      })
    }
    
    
// The initialisation code:    
  if ($scope.ProvTSID) {
    $scope.load()
  } else {
    $scope.formError='Timesheet ID not specified'
    }
    
})
