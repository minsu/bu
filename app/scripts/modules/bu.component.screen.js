//-------------------------------------------------------------------
// bu: screen (directive)
//-------------------------------------------------------------------

angular.module('bu').directive('buScreen', [
  '$log', '$q', '$timeout',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $timeout, $settings, $bu, $state, $e) {

    function controller($scope, $element) {
      $scope.window = undefined;
      $scope.panels = [];

      function getPanel(position) {
        for(var i = 0;i < $scope.panels.length;i ++) {
          if ($scope.panels[i].options.position === position) {
            return $scope.panels[i];
          }
        }
        return undefined;
      }

      function openPanel(position, speed) {
        var panel = getPanel(position);
        var defer = $q.defer();
        var speed = angular.isDefined(speed)? speed : $settings.BU_SLIDE_SPEED;

        console.assert(panel);
        panel.getReadyActivate()
        .then(function() {
          var bucket = [];
          bucket.push($scope.window.slide(position, speed));
          bucket.push(panel.activate(speed));
          return $q.all(bucket);
        })
        .then(function() {
          panel.setActive();
          if ($scope.window.state !== 'both' &&
              position === 'left' && getPanel('right')) {
            getPanel('right').setInactive();
          }
          if ($scope.window.state !== 'both' &&
              position === 'right' && getPanel('left')) {
            getPanel('left').setInactive();
          }
          defer.resolve();
        });
        return defer.promise;
      }
      function closePanel(position, speed) {
        var panel = getPanel(position);
        var defer = $q.defer();
        var speed = angular.isDefined(speed)? speed : $settings.BU_SLIDE_SPEED;

        console.assert(panel);
        if ($scope.window.state === 'both') {
          $log.debug('[bu.screen] no need to close: ' + position);
          return $q.when(true);
        }

        if ($scope.window.state === 'left' ||
            $scope.window.state === 'right') {
          if (position === 'left' && getPanel('right')) {
            return openPanel('right', speed);
          }
          if (position === 'right' && getPanel('left')) {
            return openPanel('left', speed);
          }
          $log.debug('[bu.screen] no need to close: ' + position);
          return $q.when(true);
        }

        panel.getReadyDeactivate()
        .then(function() {
          var bucket = [];
          bucket.push($scope.window.unslide(position, speed));
          bucket.push(panel.deactivate(speed));
          return $q.all(bucket);
        })
        .then(function() {
          panel.setInactive();
          if (position === 'left' &&
              $scope.window.state === 'right') {
            getPanel($scope.window.state).setActive();
          }
          if (position === 'right' &&
              $scope.window.state === 'left') {
            getPanel($scope.window.state).setActive();
          }
          defer.resolve();
        });
        return defer.promise;
      }
      function togglePanel(position) {
        var panel = getPanel(position);
        console.assert(panel);
        if (panel.state === 'active') {
          return closePanel(position);
        } else if (panel.state === 'inactive') {
          return openPanel(position);
        } else {
          console.assert(false);
          $log.debug(panel.state);
        }
      }
      function register(spec) {
        if (angular.isDefined(spec.attrs.buWindow)) {
          $scope.window = spec;

          $log.debug('[bu.screen] window registered');
          $log.debug(spec);
        } else if (angular.isDefined(spec.attrs.buPanel)) {
          $scope.panels.push(spec);

          $log.debug('[bu.screen] panel registered');
          $log.debug(spec);
        } else {
          $console.assert(false);
        }
      }

      $scope.register = register;

      $scope.openPanel   = openPanel;
      $scope.closePanel  = closePanel;
      $scope.togglePanel = togglePanel;

      return $scope;
    }

    function linker(scope, element, attrs, ctrl) {
      function zindex() {
        switch(scope.state) {
        case 'active':
          return $state.ui.zindex.top;
        case 'ready':
          return $state.ui.zindex.middle;
        default:
          return $state.ui.zindex.base;
        }
      }

      // API Implementation //

      function getReadyDeactivate(direction) {
        var bucket = [];
        if (scope.window.state === 'full') {
          angular.forEach(scope.panels, function(panel) {
            if (panel.state === 'active') {
              bucket.push(closePanel(panel.options.position));
            }
          });
        }
        return $q.all(bucket);
      }
      function getReadyActivate(direction) {
        scope.state = 'ready';
        if (direction === 'right') {
          return $bu.x(element, (-1) * 0.25 * element.width(), 0);
        } else if (direction === 'left') {
          return $bu.x(element, 0.75 * element.width(), 0);
        } else {
          console.assert(false);
        }
      }
      function activate() {
        return $bu.x(element, 0);
      }
      function deactivate(direction) {
        if (direction === 'left') {
          return $bu.x(element, -1 * element.width());
        } else if (direction === 'right') {
          return $bu.x(element, element.width());
        } else {
          console.assert(false);
        }
      };

      function reposition() {
        if ($state.isLarge() &&
            angular.isDefined(scope.options.responsive)) {

          scope.window.state = scope.options.responsive;
          scope.window.reposition(scope.options.responsive);
          if (scope.options.responsive === 'both') {
            scope.openPanel('left',  0);
            scope.openPanel('right', 0);
          } else {
            scope.openPanel(scope.options.responsive, 0);
          }
        } else {

          scope.window.state = 'full';
          scope.window.reposition();
          if (scope.options.responsive === 'both') {
            scope.closePanel('left', 0);
            scope.closePanel('right', 0);
          } else if (angular.isDefined(scope.options.responsive)) {
            scope.closePanel(scope.options.responsive, 0);
          }
        }
      }

      scope.state              = undefined;
      scope.zindex             = zindex;
      scope.getReadyActivate   = getReadyActivate;
      scope.getReadyDeactivate = getReadyDeactivate;
      scope.activate           = activate;
      scope.deactivate         = deactivate;

      /* register */
      scope = angular.extend(scope, {
        options: scope.$eval(attrs.buScreen),
        element: element,
        attrs  : attrs,
      });
      $state.register(scope);


      /* responsive */
      reposition();
      $bu.wait('bu.screen', 'BU_EVENT_RESIZE', reposition);
    }

    return {
      restrict   : 'A',
      scope      : {},
      templateUrl: 'bu.component.screen.html',
      replace    : true,
      transclude : true,
      controller : controller,
      link       : linker,
    };
  }
]);
