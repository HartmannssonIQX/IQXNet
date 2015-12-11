angular.module('app')
.controller('JobSearchCtrl', function ($scope, FormSvc, QuestionnaireSvc, ApplicationSvc, $location) {
  
    FormSvc.setOptions($scope,{
      fetchAPI:'jobs/searchFields', // No data fetch - initialise with empty record
      saveAPI:'',
      multiRow:true,
      notLoggedIn:true, // New candidate so obviously not yet logged in
      autoEdit:true, // Switch form straight to edit mode
      saveCleanFields:true, // All fields sent, whether or not dirty
      savePrefix:'p'
      })
     

    $scope.saveButtonCaption='Search'
    
    $scope.fetch()  // Initialise
   
})
