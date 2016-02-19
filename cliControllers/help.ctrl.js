angular.module('app')
.controller('HelpCtrl', function ($scope, $location, $routeParams, $q, FormSvc, ApplicationSvc) {
    
    FormSvc.setOptions($scope)
    $scope.MyData = ""
    $scope.results = []
    $scope.helpDocsJson = {}
    $scope.procs = {}
    $scope.JsonProcs = ""

    $scope.findValue = function(enteredValue) {
        $scope.fetchHelpProcs(enteredValue)
        .then(function() {
            $scope.pushResults()
        })
    }

    $scope.fetchHelpProcs=function(searchTerm) {
        $scope.results.length = 0
        searchTerm = searchTerm || '';
        return $scope.fetch({
            fetchAPI:'callresult_/NetDefineProcs?pSearchTerm='+searchTerm, 
            multiRow:true,
            fetchTarget:'helpProcs',
            notLoggedIn:true
        })
    }

    $scope.pushResults=function(){
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
          $scope.results.push({name:buildObject.proccessName,Doc:buildObject.Doc,params:ar})   
        })
    }

    $scope.fetchHelpProcs() // fetch help
    .then(function() {
        $scope.pushResults()
    })
});