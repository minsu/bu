//-------------------------------------------------------------------
// bu: screens (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buScreens', [
  '$log', '$timeout', 'bu.$service', 'bu.$state',

  function($log, $timeout, $bu, $state) {

    function distribute(scope, element, attrs) {
      var height = 0, value;

      // angular.forEach(element.children(), function(child) {
      //   var elem = angular.element(child);
      //   if (!elem.is('[bu-screen]') &&
      //        elem.css('position') !== 'absolute') {
      //     height = height + Math.ceil(elem.outerHeight(true));
      //   }
      // });

      // value = element.height() - height;
      // angular.forEach(element.children(), function(child) {
      //   var elem = angular.element(child);
      //   if (elem.is('[bu-screen]')) {
      //     elem.height(value);
      //   }
      // });
    }

    function linker(scope, element, attrs) {
      $timeout(function() {
        $bu.fire('bu.screens', 'BU_EVENT_DOMREADY');
      });
      scope.$watch(function() {
        return element.height();
      }, function(value) {
        $log.debug('[bu.screens] new screen height: ' + value);
        distribute(scope, element, attrs);
      });
    }
    return {
      restrict: 'A',
      link    : linker,
    };
  }
]);
