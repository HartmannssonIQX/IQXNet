angular.module('app')

.config(function(calendarConfig) {
  calendarConfig.displayEventEndTimes = true
  calendarConfig.allDateFormats.angular.date.weekDay = 'EEE'  // Default 'EEEE' appears as Mon... on phone view
  calendarConfig.i18nStrings.timeLabel = ''   // Default 'Time' appears as Ti... on phones - get rid
  calendarConfig.i18nStrings.eventsLabel = '' // Default 'Events', meaningless - get rid
  calendarConfig.i18nStrings.weekNumber = ''  // Displays a moving week number on the month display - get rid
  })

.controller('CandDiaryCtrl', function ($scope, FormSvc, ApplicationSvc) {
    FormSvc.setOptions($scope,{
      fetchAPI:'callresult/netcandidatediary',
      multiRow:true
      })
      
  function extractDateTime(dt,tm) {
    if (dt.indexOf(' ') == 3) {dt=dt.substr(4)}
    return moment(dt+' '+tm,'DD/MM/YYYY HH:mm').toDate()
    }
    
  function extractType(row) {
    if (row.ActionType == 'confirmable_shift') {return 'info'}
    if (row.DiaryClass == 'Holiday' || row.DiaryClass == 'Unavailable') {return 'important'}
    if (row.DiaryClass == 'Available') {return 'success'}
    if (row.DiaryClass == 'Cancelled') {return 'special'}
    return 'inverse'
    }
    
  function extractTitle(row) {
    var rv=row.DiaryClass
    if (row.DiaryClass=='Working') {rv=rv+' at '+row.Description}
    if (row.DiaryStatus=='Provisional') {rv='Provisionally '+rv}
    return rv
  }
    
  $scope.deleteEvent=function(id) {
    angular.forEach($scope.events, function(event,ix) {
      if (event.DiaryID==id) (delete $scope.events[ix])
    })
  }
    
  $scope.eventClicked=function(evt) {
//    FormSvc.modalInfo($scope,'x456',{x:"An X",y:"A Y"},'sm')
    if (evt.ActionType=='confirmable_shift') {
      var theChoice=-1
      var desc='<p class="textcentre">'+evt.Description+'</p>'
      var times='<p class="textcentre">'+moment(evt.startsAt).format('HH:mm')+' to '+moment(evt.endsAt).format('HH:mm')+'</p>'
      FormSvc.modalChoose('Provisional Shift',desc+times,[{description:"I'm available",type:"success"},
                                                          {description:"I'm NOT available",type:"danger"},
                                                          "I don't yet know"])
      .then(function(choice) {
        theChoice=choice
        if (theChoice==1) {   // Not available is irreversible - allow escape
          return ApplicationSvc.queryMessage('Please confirm','Reject shift?')
          }  // Other cases simply return yield a fulfilled promise of undefined value which continues the chain
        })
      .then(function() {
        var action
        switch (theChoice) {
          case 0: 
            action='F' // Confirm
            break
          case 1: 
            action='C' // Cancel
            break
        }
        if (action) {return $scope.exec('call/NetCandidateDiaryAdd',{pState:action,IDCode:evt.DiaryID.substring(6)})}
      })
      .then(function() {
        switch (theChoice) {
          case 0: 
            evt.ActionType=''
            evt.type='inverse'
            evt.DiaryStatus=''
            evt.title='Working at '+evt.Description
            break
          case 1: 
            $scope.deleteEvent(evt.DiaryID)
            break
        }
        })
      .catch(function (err) {
        if (err) {ApplicationSvc.showMessage('Error',err,true)}
        })
    }
  }
  
  $scope.eventEdited=function(evt) {
    if (evt.ActionType=='deleteable_shift') {
      var sItem=evt.DiaryClass
      if (sItem=='Available') {sItem='Availability'}
      if (sItem=='Unavailable') {sItem='Unavailability'}
      $scope.xCaption=sItem
      var data={xDate:evt.startsAt,xTimeFrom:evt.startsAt,xTimeTo:evt.endsAt,xAllDay:evt.AllDay}
      FormSvc.modalForm($scope,'diaryAvailEdit',data,'md')
      .then(function(data) {
        var pdatefrom=moment(data.xDate).format('DD/MM/YYYY')
        var ptimefrom=moment(data.xTimeFrom).format('HH:mm')
        var ptimeto = moment(data.xTimeTo).format('HH:mm')
        if (data.xAllDay) {
          ptimefrom=''
          ptimeto=''
          }
        //return $scope.exec('call/NetCandidateDiaryAdd',{IDCode:evt.DiaryID.substring(6),pdatefrom:pdatefrom,ptimefrom:ptimefrom,ptimeto:ptimeto})
        })
      .then(function() {
        $scope.deleteEvent(evt.DiaryID)
        })
      .catch(function (err) {
        if (err) {ApplicationSvc.showMessage('Error',err,true)}
        })
    }
  }
  
  $scope.eventDeleted=function(evt) {
    if (evt.ActionType=='deleteable_shift') {
      var sItem=evt.DiaryClass
      if (sItem=='Available') {sItem='Availability'}
      if (sItem=='Unavailable') {sItem='Unavailability'}
      ApplicationSvc.queryMessage('Delete '+sItem,'Delete '+sItem+' on '+moment(evt.startsAt).format('DD/MM/YYYY')+' ?')
      .then(function() {
        return $scope.exec('call/NetCandidateDiaryAdd',{pState:'D',IDCode:evt.DiaryID.substring(6)})
        })
      .then(function() {
        $scope.deleteEvent(evt.DiaryID)
        })
      .catch(function (err) {
        if (err) {ApplicationSvc.showMessage('Error',err,true)}
        })
      }
  }
    
  $scope.events=[]
  $scope.cellIsOpen=true
  $scope.calendarDate=new Date() // today
  $scope.calendarView='month' 

   
  $scope.fetch()
  .then(function() {
    $scope.events=[]
    angular.forEach($scope.theRecords,function(row) {
      $scope.events.push({title:extractTitle(row),
                          type:extractType(row),
                          startsAt:extractDateTime(row.DateFrom,row.TimeFrom || '00:00'),
                          endsAt:extractDateTime(row.DateTo,row.TimeTo || '23:59'),
                          editable:(row.ActionType=='deleteable_shift'),
                          deletable:(row.ActionType=='deleteable_shift'),
                          DiaryID:row.DiaryID,         // Shift_tempshiftid or Employment_employmentid
                          ActionType:row.ActionType,   // deleteable_shift, confirmable_shift, cancelled_shift
                          DiaryClass:row.DiaryClass,   // Holiday, Available, Unavailable, Cancelled, Working
                          DiaryStatus:row.DiaryStatus, // Provisional or blank
                          Description:row.Description, // company.name if Working
                          AllDay:(row.TimeFrom?false:true)
                          })
      })
    $scope.theRecords=[] // Free the memory
    })
    
})
