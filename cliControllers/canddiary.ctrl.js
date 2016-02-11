angular.module('app')

.config(function(calendarConfig) {
  calendarConfig.displayEventEndTimes = true
  })

.controller('CandDiaryCtrl', function ($scope, FormSvc) {
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
    
    
  $scope.eventClicked=function(evt) {alert('clicked')}
  $scope.eventEdited=function(evt) {alert('edit')}
  $scope.eventDeleted=function(evt) {alert('delete')}
    
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
                          deletable:(row.ActionType=='deleteable_shift' || row.ActionType=='cancelled_shift')})
      })
    })
    
})
