angular.module('app')
.controller('ProvTimesheetsCtrl', function ($scope, $location, FormSvc) {
  FormSvc.setOptions($scope,{
      fetchAPI:'callresult/netprovtimesheets',
      dateFields:['weekenddate'],
      multiRow:true
      })
    
  $scope.expandTimesheet=function(tsid) {
    $location.url('/provtimesheet?id='+tsid)
    }
    
	$scope.fetch()
})
