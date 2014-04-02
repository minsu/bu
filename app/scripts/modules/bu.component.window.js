//-------------------------------------------------------------------
// bu: window (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buWindow', [
  '$log', '$q',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $settings, $bu, $state, $e) {

    function controller($scope, $element) {

      function registerPages(spec) {
        $log.debug('[bu.window] registering a pages');
        $scope.pages = spec;
      }

      // API //
      $scope.registerPages = registerPages;
      return $scope;
    }

    function linker(scope, element, attrs, ctrl) {
      var spec;

      /* register */
      spec = angular.extend(scope, {
        options: scope.$eval(attrs.buWindow),
        element: element,
        attrs  : attrs,
      });
      ctrl.registerWindow(spec);
    }

    return {
      restrict   : 'A',
      require    : '^buScreen',
      controller : controller,
      link       : linker,
    };
  }
])
