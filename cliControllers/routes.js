angular.module('app').config(function($routeProvider) {
  $routeProvider
  .when('/',{controller:'HomeCtrl',templateUrl:'/views/home.html'}) 
  .when('/login',{controller:'LoginCtrl',templateUrl:'/views/login.html'})
  .when('/changepassword',{controller:'ChangePasswordCtrl',templateUrl:'/views/changepassword.html'})
  .when('/resetpassword',{controller:'ResetPasswordCtrl',templateUrl:'/views/resetpassword.html'})
  .when('/canddetails',{controller:'CandidateCtrl',templateUrl:'/views/canddetails.html'})
  .when('/candregister',{controller:'CandRegCtrl',templateUrl:'/views/candregister.html'})
  .when('/provtimesheets',{controller:'ProvTimesheetsCtrl',templateUrl:'/views/provtimesheets.html'})
  .when('/provtimesheet',{controller:'ProvTimesheetCtrl',templateUrl:'/views/provtimesheet.html'})
  .when('/timesheets',{controller:'TimesheetsCtrl',templateUrl:'/views/timesheets.html'})
  .when('/timesheet',{controller:'TimesheetCtrl',templateUrl:'/views/timesheet.html'})
  .when('/canddiary',{controller:'CandDiaryCtrl',templateUrl:'/views/canddiary.html'})
  .when('/apiprocs',{controller:'APIprocsCtrl',templateUrl:'/views/apiProcs.html'})
  .when('/canddocuments',{controller:'CandDocsCtrl',templateUrl:'/views/canddocuments.html'})
  .when('/jobsearch',{controller:'JobSearchCtrl',templateUrl:'/views/jobsearch.html'})
  .when('/test',{controller:'TestCtrl',templateUrl:'/views/test.html'})
  .when('/webReference',{controller:'webReferenceCtrl',templateUrl:'/views/webReference.html'})
  .when('/serverstats',{controller:'ServerStatsCtrl',templateUrl:'/views/serverStats.html'})
  .when('/canddepartments',{controller:'CandDepartmentsCtrl',templateUrl:'/views/canddepartments.html'})
  .when('/canddepartment',{controller:'CandDepartmentCtrl',templateUrl:'/views/canddepartment.html'})
  .when('/help',{controller:'HelpCtrl',templateUrl:'/views/help.html'})
  })
  .run( function($rootScope, $location, ApplicationSvc) {
    // Register listener to watch route changes
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      if ( next.originalPath == '/candregister' || next.originalPath == '/webReference') {
        ApplicationSvc.setLoggedOut()
        return
      }
      if ( !ApplicationSvc.isLoggedIn ) {
        // Not logged in so ensure that we go to /login or /resetpassword
        if ( !(next.originalPath == '/login' || next.originalPath == '/resetpassword') ) {
          ApplicationSvc.postLoginRoute=next.originalPath  // Remember where they requested to go so we can still go there after they log in 
          $location.path( "/login" );  // Redirect
          }
      } else if (ApplicationSvc.forceChangePassword()) {
        if ( next.originalPath != '/changepassword' ) {
          ApplicationSvc.postLoginRoute=next.originalPath  // Remember where they requested to go so we can still go there after they change password 
          $location.path( "/changepassword" );  // Redirect
          }
      }        
      })
    $rootScope.$on('$locationChangeStart', function(event) {
      if ( ApplicationSvc.isEditing && ApplicationSvc.preventNavIfEditing ) {
        event.preventDefault()
        ApplicationSvc.showMessage('Attention','Please first Save or Cancel your edits')
        }
      })
  })
