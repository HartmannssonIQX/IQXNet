angular.module('app')
.controller('CandDepartmentsCtrl', function ($scope, $location, FormSvc) {
  FormSvc.setOptions($scope,{
    fetchAPI:'callresult/NetCandidateRegistrations',
    multiRow:true
    })
    
  $scope.expandDepartment = function(deptID) {
    $location.url('/canddepartment?departmentid='+deptID)
  }
    
	$scope.fetch()    
})

