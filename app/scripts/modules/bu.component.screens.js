//-------------------------------------------------------------------
// bu: screens (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buScreens', [
  '$log', '$timeout',

  function($log, $timeout) {
    return function(scope, element, attrs) {
      $timeout(function() {
        $bu.fire('bu.screens', 'BU_EVENT_DOMREADY');
      });
    };
  }
]);
