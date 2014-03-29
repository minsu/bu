//-------------------------------------------------------------------
// bu: screens (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buScreens', [
  '$log', '$timeout', 'bu.$service',

  function($log, $timeout, $bu) {
    return function(scope, element, attrs) {
      $timeout(function() {
        $bu.fire('bu.screens', 'BU_EVENT_DOMREADY');
      });
    };
  }
]);
