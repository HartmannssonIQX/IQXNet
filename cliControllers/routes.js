angular.module('app').config(function($routeProvider) {
	$routeProvider
	.when('/',{controller:'HomeCtrl',templateUrl:'/views/home.html'})	
	.when('/login',{controller:'LoginCtrl',templateUrl:'/views/login.html'})
	.when('/canddetails',{controller:'CandidateCtrl',templateUrl:'/views/canddetails.html'})
	.when('/candregister',{controller:'CandRegCtrl',templateUrl:'/views/candregister.html'})
	.when('/candprovtimesheets',{controller:'CandProvTSCtrl',templateUrl:'/views/candprovtimesheets.html'})
	.when('/provtimesheet',{controller:'ProvTSCtrl',templateUrl:'/views/provtimesheet.html'})
	.when('/canddiary',{controller:'CandDiaryCtrl',templateUrl:'/views/canddiary.html'})
	.when('/apiprocs',{controller:'APIprocsCtrl',templateUrl:'/views/apiProcs.html'})
	.when('/canddocuments',{controller:'CandDocsCtrl',templateUrl:'/views/canddocuments.html'})
	})
  .run( function($rootScope, $location, ApplicationSvc) {
    // Register listener to watch route changes
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      if ( next.originalPath == '/candregister' ) {
        ApplicationSvc.setLoggedOut()
        return
      }
      if ( !ApplicationSvc.isLoggedIn ) {
        // Not logged in so ensure that we go to /login
        if ( next.originalPath != '/login' ) {
		      ApplicationSvc.postLoginRoute=next.originalPath  // Remember where they requested to go so we can still go there after they log in 
          $location.path( "/login" );  // Redirect
          }
        }         
      })
    $rootScope.$on('$locationChangeStart', function(event) {
      if ( ApplicationSvc.isEditing && !ApplicationSvc.autoEdit ) {
        event.preventDefault()
        alert('Please first save or cancel your edits')
        }
      })
	})
