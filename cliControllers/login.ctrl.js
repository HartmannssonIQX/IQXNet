angular.module('app')
.controller('LoginCtrl', function ($scope, $location, $http, ApplicationSvc, ApiSvc) {
  $scope.login=function (username,password) {
    $scope.loginerr=''
    if (!username) {return ($scope.loginerr='Missing user name')}
    if (!password) {return ($scope.loginerr='Missing password')}
    $http.post('/api/auth/login', {username:username, password:password})  
      .then(function (res) {
        ApiSvc.CheckIQXResult(res.data)
        ApplicationSvc.setLoggedIn(res.data)
        var p=ApplicationSvc.postLoginRoute  // Navigate to wherever was last requested in the un-loggedin state (default=/)
        ApplicationSvc.postLoginRoute='/'   // Reset the default
        $location.path(p)
        })
      .catch(function (err) {
        if (angular.isObject(err) && err.status && err.status==401) {
          $scope.loginerr='Invalid user name or password'
        } else {
          $scope.loginerr=ApiSvc.ExtractError(err) 
        }
        })
    }
})
