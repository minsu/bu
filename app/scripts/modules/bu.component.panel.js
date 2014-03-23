//-------------------------------------------------------------------
// directive: panel
//-------------------------------------------------------------------
angular.module('bu').directive('buPanel', [
  '$log', '$q', 'bu.$settings', 'bu.$service', 'bu.$state',

  function($log, $q, $settings, $bu, $state) {

    function controller($scope, $element) {
      function zindex() {
        switch($scope.state) {
        case 'inactive':
          return $state.ui.zindex.base;
        case 'active':
        case 'ready':
          return $state.ui.zindex.bottom;
        default:
          console.assert(false);
        }
      }

      $scope.zindex = zindex;
      $scope.state = 'inactive';
      return $scope;
    }

    function linker(scope, element, attrs, ctrl) {
      function setActive() {
        scope.state = 'active';
      }
      function setInactive() {
        scope.state = 'inactive';
      }
      function getReadyActivate() {
        scope.state = 'ready';
        switch (scope.position) {
        case 'left':
          return $bu.x(element, (-1) * 0.5 * element.width(), 0);
        case 'right':
          return $bu.x(element, $state.ui.width - 0.5 * element.width(), 0);
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
          return $bu.x(element, $state.ui.width - element.width(), speed);
        default:
          console.assert(false);
        }
      }
      function deactivate() {
        switch(scope.position) {
        case 'left':
          return $bu.x(element, (-1) * 0.5 * element.width());
        case 'right':
          return $bu.x(element, $state.ui.width - 0.5 * element.width());
        default:
          console.assert(false);
        }
      }

      scope.setActive          = setActive;
      scope.setInactive        = setInactive;
      scope.getReadyActivate   = getReadyActivate;
      scope.getReadyDeactivate = getReadyDeactivate;
      scope.activate           = activate;
      scope.deactivate         = deactivate;

      /* register */
      scope = angular.extend(scope, scope.$eval(attrs.buPanel));
      scope = angular.extend(scope, {
        element: element,
        attrs  : attrs,
      });
      ctrl.register(scope);
    }

    return {
      restrict   : 'A',
      scope      : {},
      templateUrl: 'bu.component.panel.html',
      replace    : true,
      transclude : true,
      require    : '^buScreen',
      controller : controller,
      link       : linker,
    };
  }
])
