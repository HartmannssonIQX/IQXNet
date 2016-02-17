angular.module('app')
.config(['$compileProvider' , function ($compileProvider)
{
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto):/)
}])
.controller('JobSearchCtrl', function ($scope, FormSvc, QuestionnaireSvc, ApplicationSvc, $location) {
  
    FormSvc.setOptions($scope,{
      fetchAPI:'jobs/searchFields', // No data fetch - initialise with empty record
      saveAPI:'',
      multiRow:true,
      notLoggedIn:true, // New candidate so obviously not yet logged in
      autoEdit:true, // Switch form straight to edit mode
      doNotPreventNav:true, // Stop edit mode from blocking switch to other views
      saveCleanFields:true, // All fields sent, whether or not dirty
      savePrefix:'p',
      showResults:false,
      theResults:{},
      numberOfResults:0      // why is showResults undefined even though it is set to 0?
      })
        
    $scope.applyRole=function(job) {
      var ref = job[4].value
      console.log(ref)
/*      sh.formError=''
      $scope.state.editing=true
      $scope.safeShift=angular.copy(sh)  // Make safe copy in case of cancel edits
      sh.editing=true*/
    }

    $scope.saveButtonCaption='Search'
    
    $scope.update=function() {
      var postData={}
      angular.forEach($scope.theRecords, function(val) {
        postData[val.name]=val.value
        //console.log(val.value)
      })
      $scope.exec('jobs/searchJobs',postData)
      .then(function(jobs) {
        //console.log(jobs)
        $scope.theResults=jobs.IQXResult.Row
        $scope.numberOfResults=$scope.theResults.length
        $scope.showResults=($scope.numberOfResults>0)
      })
      return postData
    }
		$scope.criteria={}
    $scope.fetch()  // Initialise
   
})
