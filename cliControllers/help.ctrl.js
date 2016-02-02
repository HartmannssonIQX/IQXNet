angular.module('app')
.controller('HelpCtrl', function ($scope, $location, $routeParams, $q, FormSvc, ApplicationSvc) {
    
    FormSvc.setOptions($scope)
    $scope.MyData = ""
    $scope.results = []
    $scope.helpDocsJson = {}
    $scope.procs = {}
    $scope.JsonProcs = ""

    $scope.findValue = function(enteredValue) {
        // Empty the List for a new submit  
        // console.clear()
        // $scope.results.length = 0
        $scope.searchHelp(enteredValue)
    }

    $scope.searchHelp = function(searchTerm) {
        angular.forEach($scope.results, function(value, key) {
            angular.forEach(value, function (v, k){
                if (!value.name.toLowerCase().indexOf(searchTerm.toLowerCase())) {
                    console.log(value.name)
                }
            })

            // if (!key.toLowerCase().indexOf(searchTerm.toLowerCase())) {

            //     $scope.results.push({
            //         Proccess_Name: key, 
            //         Parameters: $scope.procs[key]["paramNames"][0],
            //         Param_Types: $scope.procs[key]["paramType"][0],
            //         paramIO: $scope.procs[key]["paramIO"][0],
            //         paramDefault: $scope.procs[key]["paramDefault"][0]
            //     })
            // }
        })
    }  

    $scope.fetchHelpProcs=function() {
        return $scope.fetch({
            fetchAPI:'callresult_/NetDefineProcs', 
            multiRow:true,
            fetchTarget:'helpProcs',
            notLoggedIn:true
        })
    }

    $scope.fetchHelpProcs() // fetch help

    .then(function() {
        angular.forEach($scope.helpProcs, function(buildObject, key) {
          var paramNames = buildObject.paramName.split(',')
          var paramIO = buildObject.paramIO.split(',')
          var paramDefault = buildObject.paramDefault.split(',')
          var paramType = buildObject.paramType.split(',')
          var ar = []
          angular.forEach(paramNames, function(p,ix) {
            if (angular.uppercase(p)!='PWEBUSERID') {
                ar.push({
                    name:p,
                    output:(paramIO[ix]==1)?true:false,
                    type:paramType[ix],
                    default:paramDefault[ix]
                })
            }
          }) 
          $scope.results.push({name:buildObject.proccessName,params:ar})   
        })
    })
});