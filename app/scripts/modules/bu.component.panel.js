//-------------------------------------------------------------------
// directive: panel
//-------------------------------------------------------------------
angular.module('bu').directive('buPanel', [
  '$log', '$q', 'bu.$settings', 'bu.$service', 'bu.$state',

  function($log, $q, $settings, $bu, $state) {

    function linker(scope, element, attrs, ctrl) {
      var spec;

      function setState(state) {
        $log.debug('[bu.panel] panel state change: ' + scope.state + ' >> ' + state);
        scope.state = state;
      }
      function getReadyActivate() {
        scope.state = 'ready';
        switch (scope.position) {
        case 'left':
          return $bu.x(element,
            (-1) * 0.5 * element.width(), 0);
        case 'right':
          return $bu.x(element,
            element.parent().width() - 0.5 * element.width(), 0);
        default:
          console.assert(false);
        }
      }
      function getReadyDeactivate() {
        return $q.when(true);
      };
      function activate(speed) {
        if (!angular.isDefined(speed)) {
          speed = $settings.BU_SLIDE_SPEED;
        }
        switch(scope.position) {
        case 'left':
          return $bu.x(element, 0, speed);
        case 'right':
          return $bu.x(element,
            element.parent().width() - element.width(), speed);
        default:
          console.assert(false);
        }
      }
      function deactivate(speed) {
        if (!angular.isDefined(speed)) {
          speed = $settings.BU_SLIDE_SPEED;
        }
        switch(scope.position) {
        case 'left':
          return $bu.x(element,
            (-1) * 0.5 * element.width(), speed);
        case 'right':
          return $bu.x(element,
            element.parent().width() - 0.5 * element.width(), speed);
        default:
          console.assert(false);
        }
      }

      // PANEL STATE
      // enabled  : not toggleable & shown
      // disabled : not toggleable & not shown
      // active   : toggleable & shown
      // inactive : toggleable & not show
      scope.state     = undefined;
      scope.position  = attrs.buPanel;
      scope.setState  = setState;
      scope.getReadyActivate   = getReadyActivate;
      scope.getReadyDeactivate = getReadyDeactivate;
      scope.activate           = activate;
      scope.deactivate         = deactivate;

      /* register */
      spec = angular.extend(scope, {
        options: scope.$eval(attrs.buPanel),
        element: element,
        attrs  : attrs,
      });
      ctrl.registerPanel(spec);
    }

    return {
      restrict   : 'A',
      scope      : {},
      templateUrl: 'bu.container.html',
      replace    : true,
      transclude : true,
      require    : '^buScreen',
      link       : linker,
    };
  }
])
