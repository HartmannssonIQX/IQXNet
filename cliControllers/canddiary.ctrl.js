angular.module('app')

.config(function(calendarConfig) {
  calendarConfig.displayEventEndTimes = true
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
    
  function extractType(tp) {
    if (tp == 'Holiday' || tp == 'Unavailable') {return 'important'}
    if (tp == 'Available') {return 'success'}
    if (tp == 'Cancelled') {return 'special'}
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
    $scope.myCaption='Hello kitty'
    FormSvc.modalForm($scope,'x123',{xName:'Sidney James',xAge:123}) 
    .then(function(dat) {
      console.log(dat)
    })
  }
  
  $scope.eventEdited=function(evt) {
    FormSvc.modalChoose('Choices',['First','Second','Third'])
    .then(function(c){
      console.log(c)
    })
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
                          type:extractType(row.DiaryClass),
                          startsAt:extractDateTime(row.DateFrom,row.TimeFrom || '00:00'),
                          endsAt:extractDateTime(row.DateTo,row.TimeTo || '23:59'),
                          editable:(row.ActionType=='deleteable_shift' || row.ActionType=='confirmable_shift'),
                          deletable:(row.ActionType=='deleteable_shift' || row.ActionType=='cancelled_shift'),
                          DiaryID:row.DiaryID,
                          ActionType:row.ActionType,
                          DiaryClass:row.DiaryClass,
                          DiaryStatus:row.DiaryStatus
                          })
      })
    })
    
})
