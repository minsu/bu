//-------------------------------------------------------------------
// bu: page (directive)
//-------------------------------------------------------------------

angular.module('bu').directive('buPages', [
  '$log', '$q', '$timeout',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $timeout, $settings, $bu, $state, $e) {
    function controller($scope, $element) {
      $scope.pages = [];
      function register(spec) {
        if ($scope.pages.length === 0) {
          spec.state = 'middle';
        } else if ($scope.pages.length === 1) {
          spec.state = 'left';
        } else if ($scope.pages.length === 2) {
          spec.state = 'right';
        } else {
          console.assert(false);
        }
        $log.debug('[bu.pages] registering a page: ' + spec.state);
        $scope.pages.push(spec);
      }
      $scope.register = register;
      return $scope;
    }
    function linker(scope, element, attrs) {
    }
    return {
      restrict   : 'A',
      scope      : {},
      controller : controller,
      link       : linker,
    };
  }
]);

angular.module('bu').directive('buPage', [
  '$log', '$q', '$timeout',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $timeout, $settings, $bu, $state, $e) {

    function linker(scope, element, attrs, ctrl) {

      function zindex() {
        switch(scope.state) {
        case 'middle':
          return $state.ui.zindex.top;
        case 'left' :
        case 'right':
          return $state.ui.zindex.middle;
        default:
          return $state.ui.zindex.base;
        }
      }
      function getReadyDeactivate(direction) {
        var bucket = [];
        if (scope.window.mode === 'full') {
          angular.forEach(scope.panels, function(panel) {
            if (panel.state === 'active') {
              bucket.push(closePanel(panel.position));
            }
          });
        }
        return $q.all(bucket);
      }
      function getReadyActivate(direction) {
        scope.state = 'ready';
        if (direction == 'right') {
          return $bu.x(element, (-1) * 0.25 * element.width(), 0);
        } else if (direction == 'left') {
          return $bu.x(element, 0.75 * element.width(), 0);
        } else {
          console.assert(false);
        }
      }
      function activate() {
        return $bu.x(element, 0);
      }
      function deactivate(direction) {
        if (direction == 'left') {
          return $bu.x(element, -1 * element.width());
        } else if (direction == 'right') {
          return $bu.x(element, element.width());
        } else {
          console.assert(false);
        }
      };

      function reposition() {}

      scope.state              = undefined;
      scope.zindex             = zindex;
      scope.getReadyActivate   = getReadyActivate;
      scope.getReadyDeactivate = getReadyDeactivate;
      scope.activate           = activate;
      scope.deactivate         = deactivate;

      /* register */
      scope = angular.extend(scope, {
        options: scope.$eval(attrs.buPage),
        element: element,
        attrs  : attrs,
      });

      /* optional controller */
      if (ctrl) {
        $log.debug('[bu.page] registering to pages')
        ctrl.register(scope);
      } else {
        $log.debug('[bu.page] no parent pages controller')
      }

      /* responsive */
      reposition();
      $bu.wait('bu.screen', 'BU_EVENT_RESIZE', reposition);
    }

    return {
      restrict   : 'A',
      scope      : {},
      require    : '?^buPages',
      templateUrl: 'bu.component.page.html',
      replace    : true,
      transclude : true,
      link       : linker,
    };
  }
]);
