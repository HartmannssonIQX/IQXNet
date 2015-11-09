angular.module('app')

.constant('spinnerConfig', {
  step: 1,
  width: 50,
  readonlyInput: false,
  mousewheel: true,
  arrowkeys: true,
  showSpinners: true
})

.controller('SpinnerController', ['$scope', '$attrs', '$parse', 'spinnerConfig', function($scope, $attrs, $parse, spinnerConfig) {
  var ngModelCtrl = { $setViewValue: angular.noop, $setValidity: angular.noop } // nullModelCtrl for pre-initialisation callability
 
  this.init = function( ngModelCtrl_, inputs ) {  // Called by the link procedure - binds $render and the events
    ngModelCtrl = ngModelCtrl_;
    ngModelCtrl.$render = this.render;

    var inputEl = inputs.eq(0)
    
    // NB when setting these boolean attributes in html use 0 and 1. True and false are problematic (false leaves the attribute undefined and true is defined but with a value of empty string which $eval converts to undefined!)

    var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : spinnerConfig.mousewheel;
    if ( mousewheel ) {
      this.setupMousewheelEvents( inputEl );
    }

    var arrowkeys = angular.isDefined($attrs.arrowkeys) ? $scope.$parent.$eval($attrs.arrowkeys) : spinnerConfig.arrowkeys;
    if (arrowkeys) {
      this.setupArrowkeyEvents( inputEl );
    }

    $scope.required = angular.isDefined($attrs.required) ? $scope.$parent.$eval($attrs.required) : false;

    $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : spinnerConfig.readonlyInput;
    this.setupInputEvents( inputEl );
  };

  var step = spinnerConfig.step;
  var float = false;
  if ($attrs.step) {
    $scope.$parent.$watch($parse($attrs.step), function(value) {
      float = (String(value).indexOf('.')>=0)
      step = float ? parseFloat(value) : parseInt(value, 10)
    })
  }

  var min;
  $scope.$parent.$watch($parse($attrs.min), function(value) {
    min = isNaN(value) ? undefined : value;
  });

  var max;
  $scope.$parent.$watch($parse($attrs.max), function(value) {
    max = isNaN(value) ? undefined : value;
  });

  function getValue ( bCoerce ) {
    if (!bCoerce) {
      if ($scope.value==='' || $scope.value===null || $scope.value === undefined) {return null} // Valid unless field is required
      if (!String($scope.value).match(/^-?\d+(\.\d+)?$/)) {return Number.NaN} // Ultimately invalid but inevitable during keyboard input of negatives or floats
    }
    var v = float ? parseFloat( $scope.value ) : parseInt( $scope.value, 10 )
    if (bCoerce && !v) {v=0}
    return v
  }

  $scope.noIncrement = function() {
    return (getValue(true) + step) > max 
  }

  $scope.noDecrement = function() {
    return (getValue(true) - step) < min
  }

  // Respond on mousewheel spin
  this.setupMousewheelEvents = function( inputEl ) {
    var isScrollingUp = function(e) {
      if (e.originalEvent) {
        e = e.originalEvent;
      }
      //pick correct delta variable depending on event
      var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
      return (e.detail || delta > 0);
    };

    inputEl.bind('mousewheel wheel', function(e) {
      $scope.$apply( (isScrollingUp(e)) ? $scope.increment() : $scope.decrement() );
      e.preventDefault();
    });

  };

  // Respond on up/down arrowkeys
  this.setupArrowkeyEvents = function( inputEl ) {
    inputEl.bind('keydown', function(e) {
      if ( e.which === 38 ) { // up
        e.preventDefault();
        $scope.increment();
        $scope.$apply();
      }
      else if ( e.which === 40 ) { // down
        e.preventDefault();
        $scope.decrement();
        $scope.$apply();
      }
    });

  };

  function makeValid() {
    ngModelCtrl.$setValidity('required', true);
    ngModelCtrl.$setValidity('number', true);
    ngModelCtrl.$setValidity('max', true);
    ngModelCtrl.$setValidity('min', true);
    $scope.invalid=false
  }

  function makeInvalid(type) {
    makeValid()  // First clear errors in case the nature of the error has changed
    ngModelCtrl.$setValidity(type, false);
    $scope.invalid=true
  }

  this.setupInputEvents = function( inputEl ) {
    if ( $scope.readonlyInput ) {
      $scope.update = angular.noop;
      return;
    }

    var invalidate = function(type) {
      ngModelCtrl.$setViewValue( null );
      makeInvalid( type )  
    };

    $scope.update = function() {  // Called by ng-change
      var value = getValue();
      if (value === null) {
        if ($scope.required) {
          invalidate('required')
        } else {
          refresh(null)
        }
      } else if (isNaN(value)) {
        invalidate('number')
      } else if (value < min) {
        invalidate('min')
      } else if (value > max) {
        invalidate('max')
      } else {
        refresh(value);
      }
    };

  };

  this.render = function() {
    $scope.value = ngModelCtrl.$viewValue;
    if ($scope.value === '' || $scope.value === null || $scope.value === undefined) {
      $scope.value=null
      if ($scope.required) {
        makeInvalid('required')
      } else {
        makeValid()
      }
    } else if (isNaN($scope.value)) {
      makeInvalid('number')
    } else if ($scope.value < min) {
      makeInvalid('min')
    } else if ($scope.value > max) {
      makeInvalid('max')
    } else {
      makeValid()   
    }
  };

  // Call internally when we know that the model is valid.
  function refresh( value ) {
    makeValid()
    $scope.value=value
    ngModelCtrl.$setViewValue( value )
  }

  $scope.width = angular.isDefined($attrs.width) ?
    $scope.$parent.$eval($attrs.width) : spinnerConfig.width;
  
  $scope.showSpinners = angular.isDefined($attrs.showSpinners) ?
    $scope.$parent.$eval($attrs.showSpinners) : spinnerConfig.showSpinners;
  
  $scope.increment = function() {
    if (!$scope.noIncrement()) {
      var v=getValue(true)+step
      if (v < min) {v = min}
      refresh(v)
    }
  };
  $scope.decrement = function() {
    if (!$scope.noDecrement()) {
      var v=getValue(true)-step
      if (v > max) {v = max}
      refresh(v)
    }
  };
}])

.directive('spinner', function () {
  return {
    restrict: 'EA',
    require: ['spinner', '?^ngModel'],
    controller:'SpinnerController',
    replace: true,
    scope: {},
    templateUrl: 'views/spinner.html',
    link: function(scope, element, attrs, ctrls) {
      var spinnerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if ( ngModelCtrl ) {
        spinnerCtrl.init( ngModelCtrl, element.find('input') );
      }
    }
  };
});

