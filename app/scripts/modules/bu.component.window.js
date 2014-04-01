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

      function handleTap(e) {
        if (scope.state !== 'none') return;

        // angular.forEach(ctrl.panels, function(panel) {
        //   if (panel.state === 'active') {
        //     if (panel.options.position === 'left') {
        //       e.preventDefault();
        //       return ctrl.closePanel('left');
        //     } else if (panel.options.position === 'right') {
        //       e.preventDefault();
        //       return ctrl.closePanel('right');
        //     }
        //   }
        // });
      }

      scope.state   = 'enabled';
      // scope.slide   = slide;
      // scope.unslide = unslide;

      /* register */
      spec = angular.extend(scope, {
        options: scope.$eval(attrs.buWindow),
        element: element,
        attrs  : attrs,
      });
      ctrl.registerWindow(spec);

      /* touch events */
      Hammer(element[0]).on("tap", handleTap);
    }

    return {
      restrict   : 'A',
      require    : '^buScreen',
      controller : controller,
      link       : linker,
    };
  }
])
