angular.module('app')
.controller('TimesheetsCtrl', function ($scope, $location, FormSvc) {
  FormSvc.setOptions($scope,{
      fetchAPI:'callresult/nettimesheets',
      dateFields:['weekenddate'],
      multiRow:true
      })
    
  $scope.expandTimesheet=function(tsid) {
    $location.url('/timesheet?id='+tsid)
    }
    
	$scope.fetch()

  })
