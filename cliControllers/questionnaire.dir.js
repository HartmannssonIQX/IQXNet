angular.module('app')

.directive('iqxQuestionnaire', function () {
    return {
      restrict: 'E',
      scope: {questions: '=', classes: '='},
      template: '<iqx-question ng-repeat="tag in questions" />'
      }
    })
    
.directive('iqxQuestion', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/question.html',
      controller: function($scope) {
        $scope.dateFormat='dd/MM/yyyy'  
        $scope.dateOptions={}  
        $scope.isEditing=false
        $scope.isSubmitted=false
        $scope.classes=$scope.classes || {label:'col-sm-4', data:'col-sm-8'} 
        },
      link: function(scope) {
        scope.$on('isEditing',function(event,bval) {scope.isEditing=bval})
        scope.$on('isSubmitted',function(event,bval) {scope.isSubmitted=bval})
        }
      }
    })      

