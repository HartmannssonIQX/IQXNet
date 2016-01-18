angular.module('app')
.controller('CandDepartmentCtrl', function ($scope, $routeParams, FormSvc) {

  $scope.DeptID=$routeParams.departmentid  

  FormSvc.setOptions($scope,{
    fetchAPI:'callresult/NetCandidateRegistration?pDepartmentID='+$scope.DeptID,
    saveAPI:'call/NetCandidateDepartmentRegister',
    savePrefix:'p',
    booleanFields:['temp','perm'],
    primaryKey:'personid',
    saveCleanFields:true,
    questionnaire:{
      tagTarget:'tags',
      tagLocation:'A'+$scope.DeptID,
      postVar:'qanswers'
      }
    })
	$scope.fetch()
  })