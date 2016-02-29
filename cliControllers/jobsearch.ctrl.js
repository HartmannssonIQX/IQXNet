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
      theResults:{}
      })

    $scope.applyRole=function(job) {
      var pVacancyId = job[4].value       //BMH is this safe?
      console.dir(ApplicationSvc)
      console.dir(ApplicationSvc.currentUser)
      var saveData = {pPersonID:'XX510413290920080203',pRefCode:pVacancyId} //BMH nomenclature!
      
      return $scope.exec('call/NetCandidateAddToShortlist',saveData)      
    }

    $scope.saveButtonCaption='Search'
    
    $scope.update=function() {
      var postData={}
      console.dir(ApplicationSvc)
      console.dir(ApplicationSvc.currentUser)
      console.dir(ApplicationSvc.currentUser.UserName)
      angular.forEach($scope.theRecords, function(val) {
      postData[val.name]=val.value
      })
      $scope.exec('jobs/searchJobs',postData)    //use fetch
      .then(function(jobs) {
        $scope.theResults=jobs.IQXResult.Row
        $scope.showResults=($scope.theResults.length>0)
      })
      return postData
    }
		$scope.criteria={}
    $scope.fetch()  // Initialise
   
})
