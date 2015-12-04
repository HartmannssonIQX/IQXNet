angular.module('app')
.controller('ProvTimesheetCtrl', function ($scope, $routeParams, $q, $location, $timeout, FormSvc, ApiSvc, ApplicationSvc, QuestionnaireSvc) {
  $scope.ProvTSID=$routeParams.id  
  FormSvc.setOptions($scope,{
      fetchAPI:'callresult/NetProvTimesheet?pTempProvTimesheetID='+$scope.ProvTSID, 
      saveAPI:'call/NetProvTimesheetSet',
      primaryKey:'tempprovtimesheetid',
      savePrefix:'p',
      dateFields:['weekenddate'],
      booleanFields:['theirrefrequired','completed'],
      doNotPreventNav:true,
      questionnaire:{
        tagTarget:'tags',
        id:$scope.ProvTSID,
        tagLocation:'T',
        displayGroup:($scope.userClass()=='CLIENT')?'CLITSCOMP':'CANDTSCOMP',
        postVar:'qanswers'
        }
      })
  
  $scope.fetchTimesheet=function() { // Fetch the timesheet header
    return $scope.fetch()  // The primary fetch using the scope options above
    }
  
  $scope.fetchTimesheetShifts=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheetshifts?pTempProvTimesheetID='+$scope.ProvTSID, 
                         fetchTarget:'timesheetShifts',
                         multiRow:true,
                         dateFields:['weekenddate','shiftdate'],
                         timeFields:['timefrom','timeto'],
                         booleanFields:['tick']
                         })
    }
  
  $scope.fetchTimesheetTimes=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheettimes?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheetTimes',multiRow:true,dateFields:['weekstartdate','shiftdate'],timeFields:['timefrom'],
      booleanFields:['dayticked']})
    }
  
  $scope.fetchTimesheetRates=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheetrates?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheetRates', multiRow:true, booleanFields:['IsExpenses','CanEdit','CanEditUnits'], numberFields:['Units','Rate']})
    }
  
  $scope.load=function() { // Load whole timesheet
    $scope.theRecord={}
    $scope.state={calculated:false, // The calculated timesheet lines/rates are available
                  completed:false, // Timesheet has been flagged as completed
                  showingDetails:true, // Display the shifts/time details
                  shiftTimesheet:false, // This is a shift timesheet
                  timeTimesheet:false, // This is a pseudo-shift timesheet
                  contractTimesheet:false, // This timesheet has neither shifts nor pseudo-shifts
                  editing:false, // A shift, time line or rate line is being edited
                  copying:false, // We are editing the copy of a line in question
                  allowedToAuthorise:($scope.userHasRight('AUTHORISETIMESHEETS')),
                  canEditTheirRef:($scope.userClass()=='CLIENT')
                  }
    return $scope.fetchTimesheet()
    .then(function () {   
      if ($scope.theRecord.timesheettype=='S') {
        $scope.state.shiftTimesheet=true
        return $scope.fetchTimesheetShifts()
      } else if ($scope.theRecord.timesheettype=='T') {
        $scope.state.timeTimesheet=true
        return $scope.fetchTimesheetTimes()
        }
      })
    .then(function () {
      if (!($scope.state.shiftTimesheet || $scope.state.timeTimesheet)) {$scope.state.contractTimesheet=true}
      if ($scope.theRecord.completed || $scope.state.contractTimesheet) {
        $scope.state.calculated=true
        $scope.state.completed=$scope.theRecord.completed
        $scope.state.showingDetails=!$scope.theRecord.completed
        return $scope.fetchTimesheetRates()
        }
      })
    .then(function () {
      if (!$scope.state.completed) {
        return $timeout($scope.setEditing,0,true,true)  // Wrap in timeout to ensure DOM is built and ready first
        }
      })
    }
    
  $scope.editShift=function(sh) { // Edit an individual shift or time
    sh.formError=''
    $scope.state.editing=true
    $scope.safeShift=angular.copy(sh)  // Make safe copy in case of cancel edits
    sh.editing=true
  }
  
  $scope.copyShift=function(sh){ // Duplicate a shift then edit the copy
    var newSh=angular.copy(sh)
    if (newSh.tempshiftid.substr(0,5)!=='Copy_') {
      newSh.tempshiftid='Copy_'+newSh.tempshiftid
      }
    $scope.state.copying=true
    $scope.timesheetShifts.push(newSh)  
    $scope.editShift(newSh)
  }
  
  $scope.saveableShift=function(sh) { // The post object for the NetProvTimesheetShiftSet api
    return {ptempshiftid:sh.tempshiftid,
            pshiftdate:ApiSvc.DateToString(sh.shiftdate),
            ptimefrom:ApiSvc.TimeToString(sh.timefrom),
            ptimeto:ApiSvc.TimeToString(sh.timeto),
            pbreakminutes:sh.breakminutes
            }
  }
  
  $scope.saveShift=function(sh) { // Save an edited shift
    $scope.dateClose('shiftdate')
    if (sh.theForm.$invalid) {return sh.formError='There are invalid values'}
    var saveData=$scope.saveableShift(sh)
    if ((!$scope.state.copying) && angular.equals(saveData,$scope.saveableShift($scope.safeShift))) {return $scope.unEditShift(sh)}
    sh.formError=''
    return $scope.exec('call/NetProvTimesheetShiftSet',saveData) // Do the save
    .then(function() { 
      $scope.state.editing=false
      $scope.state.copying=false
      sh.editing=false
      $scope.state.calculated=false    
      })
    .then(function() { // Refetch all the shifts
      $scope.fetchTimesheetShifts()
      })
  }
  
  $scope.saveableTime=function(sh) { // The post object for the NetProvTimesheetTimeSet api
    return {ptempshiftid:sh.tempshiftid,
            pplacementid_date:sh.placementid + '_' + ApiSvc.DateToString(sh.shiftdate),
            phours:sh.hours,
            ptimefrom:ApiSvc.TimeToString(sh.timefrom)
            }
  }
  
  $scope.saveTime=function(sh) { // Save an edited time line
    if (sh.theForm.$invalid) {return sh.formError='There are invalid values'}
    var saveData=$scope.saveableTime(sh)
    if (angular.equals(saveData,$scope.saveableTime($scope.safeShift))) {return $scope.unEditShift(sh)}
    sh.formError=''
    return $scope.exec('call/NetProvTimesheetTimeSet',saveData) // Do the save
    .then(function() { 
      $scope.state.editing=false
      sh.editing=false
      $scope.state.calculated=false    
      })
    .then(function() {
      $scope.fetchTimesheetTimes() // Re-fetch all the times
      })
  }
  
  $scope.unCalculateTimesheet=function() { // Indicate that re-calculation is required
    $scope.state.calculated=false 
  }
  
  $scope.showDetails=function() { // Switch on the times/shifts visibility
    $scope.state.showingDetails=true
  }
  
  $scope.unEditShift=function(sh) { // Cancel a shift or time edit
    $scope.dateClose('shiftdate')
    sh.formError=''
    $scope.state.editing=false
    if ($scope.state.copying) {
      $scope.timesheetShifts.pop()
    } else {
      angular.copy($scope.safeShift,sh)  // Replace the contents of sh with the safe copy
    }
    $scope.state.copying=false
    sh.editing=false
  }
  
  $scope.shiftLength=function(sh) { // Shift duration in hours
    var start=moment().hours(sh.timefrom.getHours()).minutes(sh.timefrom.getMinutes())
    var end=moment().hours(sh.timeto.getHours()).minutes(sh.timeto.getMinutes())
    var len=end.diff(start,'hours',true)
    if (len<=0) {len=24.0+len}  // Overnight
    if (sh.breakminutes) {len=len-sh.breakminutes/60}
    return len
  }
  
  $scope.saveableRate=function(rt) { // The post object for the NetProvTimesheetRateSet api
    return {pTempProvTimesheetLineID:rt.TempProvTimesheetLineID,
            pUnitDescription:rt.UnitDescription,
            pUnits:rt.Units,
            pRate:rt.Rate
            }
  }
  
  $scope.editRate=function(rt) {  // Edit a timesheet rate line
    rt.formError=''
    $scope.state.editing=true
    $scope.safeRate=angular.copy(rt)  // Make safe copy in case of cancel edits
    rt.editing=true
  }
    
  $scope.copyRate=function(rt) {  // Copy a timesheet rate line - expenses only - then edit the copy
    var newRt=angular.copy(rt)
    if (newRt.TempProvTimesheetLineID.substr(0,5)!=='Copy_') {
      newRt.TempProvTimesheetLineID='Copy_'+newRt.TempProvTimesheetLineID
      }
    $scope.state.copying=true
    $scope.timesheetRates.push(newRt)  
    $scope.editRate(newRt)
  }
    
  $scope.saveRate=function(rt) {  // Save an edit timesheet rate line
    if (rt.theForm.$invalid) {return rt.formError='There are invalid values'}
    var saveData=$scope.saveableRate(rt)
    if (angular.equals(saveData,$scope.saveableRate($scope.safeRate))) {return $scope.unEditRate(rt)}
    rt.formError=''
    return $scope.exec('call/NetProvTimesheetRateSet',saveData) // Do the save
    .then(function() { 
      $scope.state.editing=false
      $scope.state.copying=false
      rt.editing=false
      })
    .then(function() {
      $scope.fetchTimesheetRates() // Re-fetch all the rates
      })
  }
    
  $scope.unEditRate=function(rt) {  // Cancel the edit of a timesheet rate line
    rt.formError=''
    $scope.state.editing=false
    if ($scope.state.copying) {
      $scope.timesheetRates.pop()
    } else {
      angular.copy($scope.safeRate,rt)  // Replace the contents of rt with the safe copy
    }
    $scope.state.copying=false
    rt.editing=false
  }
    
  $scope.calcTimeTimesheet=function() { // Execute the rate script for a non-shift timesheet
    return $scope.exec('service/ProvNonShiftTSProcessRateScript',{id:$scope.ProvTSID})
    .then(function() {
      $scope.state.calculated=true
      return $scope.fetchTimesheetRates()
      })
    }
    
  $scope.calc=function() { // Execute the rate script on the selected data
    $scope.timesheetRates=[]
    if ($scope.state.timeTimesheet) {return $scope.calcTimeTimesheet()} // Re-direct to the non-shift procedure
    var aShifts=[]
    angular.forEach($scope.timesheetShifts, function(value) {
      if (value.tick) {aShifts.push(value.tempshiftid)}
      })
    return $scope.exec('call/NetProvTimesheetShiftsSelect',{pTempProvTimesheetID:$scope.ProvTSID,pShiftList:aShifts.join()})
    .then(function() { 
      return $scope.exec('service/ProvTSProcessRateScript',{id:$scope.ProvTSID})
      })
    .then(function() {
      $scope.state.calculated=true
      return $scope.fetchTimesheetRates()
      })
    }
      
  $scope.save=function() { // Save reference, questionnaire etc.
    return FormSvc.update($scope,true)
  }
    
  $scope.complete=function() { // Mark calculated timesheet as completed
    return $scope.save()
    .then(function() {
      return $scope.exec('call/NetProvTimesheetComplete',{pTempProvTimesheetID:$scope.ProvTSID})
    })
    .then(function() {
      $scope.state.completed=true
      $scope.setEditing(false)
    })
  }
  
  $scope.undo=function() { // Reverse complete() and return to edit mode
    $scope.formError=''
    return $scope.exec('call/NetProvTimesheetComplete',{pTempProvTimesheetID:$scope.ProvTSID,pInstruction:'REVERSE'})
    .then(function() {
      $scope.state.completed=false
      $scope.setEditing(true)
    })
  }
  
  $scope.authorise=function() { // Client authorisation of timesheet
    $scope.formError=''
    if (!$scope.state.allowedToAuthorise) {return $q.reject($scope.formError='Permission denied')}
    return $scope.save()
    .then(function() {
        return ApplicationSvc.messageDialog('Authorise Timesheet','In authorising this timesheet you are deemed to have read and accepted our terms of business. When this timesheet has been authorised you are deemed to have approved the resulting invoice and will not raise any objection in relation to our charges - are you sure?','Yes','No')
        })
    .then(function() {
      if ($scope.state.shiftTimesheet) {
        return $scope.exec('service/ProvTSComplete',{ID:$scope.ProvTSID})
      } else {
        return $scope.exec('service/ProvNonShiftTSComplete',{ID:$scope.ProvTSID})
      }
    })
    .then(function() { // Prov TS no longer exists - go back to list 
      $location.url('/provtimesheets')
    })
  }
    
// The initialisation code:    
  if ($scope.ProvTSID) {
    $scope.load()
  } else {
    $scope.formError='Timesheet ID not specified'
    }
    
})
