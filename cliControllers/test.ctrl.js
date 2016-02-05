angular.module('app')
.controller('TestCtrl', function ($scope, $location, FormSvc, ApiSvc) {
  FormSvc.setOptions($scope)
  $scope.reset()  // If not doing an initial form fetch then reset will setEditing(false) etc etc
  
  $scope.doTest=function(tp) {
    $scope.testResult={working:'working..'}
    ApiSvc.fetch($scope,{fetchAPI:'maint/stress'+tp,fetchTarget:'testResult',doNotPreventNav:true})
    }
    

  })
