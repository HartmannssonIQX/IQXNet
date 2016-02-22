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
      var pVacancyId = job[4].value
      console.dir(ApplicationSvc)
      console.dir(ApplicationSvc.currentUser)
      //var pPersonId
      console.log(pVacancyId)
      //$scope.exec('jobs/apply',pVacancyId)
//      var saveData = {}
      var saveData = {pPersonID:null,pVacancyId:pVacancyId}
//      var saveData = ["Saab", "Volvo"]
      
      console.log('foo')
      return $scope.exec('call/NetShortlistCandidate',saveData)
      
    }

    $scope.saveButtonCaption='Search'
    
    $scope.update=function() {
      var postData={}
      console.dir(ApplicationSvc)
      console.dir(ApplicationSvc.currentUser)
      console.dir(ApplicationSvc.currentUser.UserName)
      angular.forEach($scope.theRecords, function(val) {
        postData[val.name]=val.value
        //console.log(val.value)
      })
      $scope.exec('jobs/searchJobs',postData)
      .then(function(jobs) {
        //console.log(jobs)
        $scope.theResults=jobs.IQXResult.Row
        $scope.showResults=($scope.theResults.length>0)
      })
      return postData
    }
		$scope.criteria={}
    $scope.fetch()  // Initialise
   
})
