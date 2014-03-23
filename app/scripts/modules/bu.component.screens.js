//-------------------------------------------------------------------
// bu: screens (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buScreens', [
  '$log', '$timeout', 'bu.$service', 'bu.$state',

  function($log, $timeout, $bu, $state) {

    function linker(scope, element, attrs) {
      $timeout(function() {
        $bu.fire('bu.screens', 'BU_EVENT_DOMREADY');
      });
    }
    return {
      restrict: 'A',
      link    : linker,
    };
  }
]);
