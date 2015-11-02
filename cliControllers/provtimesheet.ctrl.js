angular.module('app')
.controller('ProvTimesheetCtrl', function ($scope, $routeParams, $q, FormSvc, ApplicationSvc) {
  FormSvc.setOptions($scope)
  $scope.ProvTSID=$routeParams.id  
  
  $scope.fetchTimesheet=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheet?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheet',dateFields:['weekenddate']})
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
    $scope.timesheet={}
    $scope.shiftTimesheet=false
    $scope.timeTimesheet=false
    return $scope.fetchTimesheet()
    .then(function () {   
      if ($scope.timesheet.timesheettype=='S') {
        $scope.shiftTimesheet=true
        return $scope.fetchTimesheetShifts()
      } else if ($scope.timesheet.timesheettype=='T') {
        $scope.timeTimesheet=true
        return $scope.fetchTimesheetTimes()
        }
      })
    .then(function () {
      if ($scope.timesheet.completed==1) {
        $scope.completedTimesheet=true
        return $scope.fetchTimesheetRates()
        }
      })
    }
    
  $scope.editShift=function(sh) {
    $scope.bEditing=true
    $scope.safeShift=angular.copy(sh)  // Make safe copy in case of cancel edits
    sh.bEditShift=true
  }
  
  $scope.saveShift=function(sh) {
    // save code here
    $scope.bEditing=false
    sh.bEditShift=false
  }
  
  $scope.unEditShift=function(sh) {
    $scope.bEditing=false
    angular.copy($scope.safeShift,sh)  // Replace the contents of sh with the safe copy
    sh.bEditShift=false
  }
  
  $scope.shiftLength=function(sh) {
    var start=moment().hours(sh.timefrom.getHours()).minutes(sh.timefrom.getMinutes())
    var end=moment().hours(sh.timeto.getHours()).minutes(sh.timeto.getMinutes())
    var len=end.diff(start,'hours',true)
    if (len<=0) {len=24.0-len}
    if (sh.breakminutes) {len=len-sh.breakminutes/60}
    return len
  }
    
  $scope.calc=function() {
    $scope.timesheetRates=[]
    var aShifts=[]
    angular.forEach($scope.timesheetShifts, function(value) {
      if (value.tick) {aShifts.push(value.tempshiftid)}
      })
    return $scope.exec('call/NetProvTimesheetShiftsSelect',{pTempProvTimesheetID:$scope.ProvTSID,pShiftList:aShifts.join()})
    .then(function() { 
      return $scope.exec('service/ProvTSProcessRateScript',{id:$scope.ProvTSID})
      })
    .then(function() {
      $scope.completedTimesheet=true
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
