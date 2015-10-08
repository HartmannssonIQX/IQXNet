angular.module('app')
.controller('ServerStatsCtrl', function ($scope, FormSvc) {
  FormSvc.setOptions($scope,{
      fetchAPI:'stats',
      multiRow:true
      })
    
	$scope.fetch()

  })
