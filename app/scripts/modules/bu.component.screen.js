//-------------------------------------------------------------------
// bu: screen (directive)

// if responsive attribute is 'left', left sidebar can show up all the
// time if isLarge() is true, if two sidebars are attached, left sidebar
// will show up
//-------------------------------------------------------------------
angular.module('bu').directive('buScreen', [
  '$log', '$q', '$timeout',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $timeout, $settings, $bu, $state, $e) {

    function controller($scope, $element) {
      $scope.state  = undefined;
      $scope.window = undefined;
      $scope.panels = [];

      function zindex() {
        switch($scope.state) {
        case 'inactive':
          return $state.ui.zindex.bottom;
        case 'active':
          return $state.ui.zindex.top;
        case 'ready':
          return $state.ui.zindex.middle;
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
      $scope.zindex   = zindex;
      return $scope;
    }

    function linker(scope, element, attrs, ctrl) {

      function getPanel(position) {
        for(var i = 0;i < scope.panels.length;i ++) {
          if (scope.panels[i].position == position) {
            return scope.panels[i];
          }
        }
        return undefined;
      }

      // API Implementation //
      function setActive() {
        /*
         * MSK hack
         * - allow user input on higher z-index element.
         * - once transformed(translate3d), z-index does not
         *   not work but the moved screen gets higher priority.
         */
        element.css(Modernizr.prefixed('transform'), 'none');
        scope.state = 'active';
      };
      function setInactive() {
        scope.state = 'inactive';
      };

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

      function openPanel(position, speed) {
        var panel = getPanel(position);
        var defer = $q.defer();
        var speed = angular.isDefined(speed)? speed : $settings.BU_SLIDE_SPEED;

        console.assert(panel);
        panel.getReadyActivate()
        .then(function() {
          var bucket = [];
          bucket.push(scope.window.slide(position, speed));
          bucket.push(panel.activate(speed));
          return $q.all(bucket);
        })
        .then(function() {
          panel.setActive();
          if (scope.window.mode !== 'both' &&
              position === 'left' && getPanel('right')) {
            getPanel('right').setInactive();
          }
          if (scope.window.mode !== 'both' &&
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
        if (scope.window.mode === 'both') {
          $log.debug('[bu.screen] no need to close: ' + position);
          return $q.when(true);
        }

        /* responsive case */
        if (scope.window.mode === position) {
          if (position == 'left' && getPanel('right')) {
            return openPanel('right', speed);
          }
          if (position == 'right' && getPanel('left')) {
            return openPanel('left', speed);
          }
          $log.debug('[bu.screen] no need to close: ' + position);
          return $q.when(true);
        }

        panel.getReadyDeactivate()
        .then(function() {
          var bucket = [];
          bucket.push(scope.window.unslide(position, speed));
          bucket.push(panel.deactivate(speed));
          return $q.all(bucket);
        })
        .then(function() {
          panel.setInactive();
          if (position === 'left' && scope.window.mode === 'right') {
            getPanel(scope.window.mode).setActive();
          }
          if (position === 'right' && scope.window.mode === 'left') {
            getPanel(scope.window.mode).setActive();
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
        }
      }
      function reposition() {
        if ($state.isLarge() &&
            angular.isDefined(scope.responsive)) {

          scope.window.setMode(scope.responsive);
          if (scope.responsive === 'both') {
            openPanel('left',  0);
            openPanel('right', 0);
          } else {
            openPanel(scope.responsive, 0);
          }
        } else {
          scope.window.setMode('full');
          if (scope.responsive === 'both') {
            closePanel('left', 0);
            closePanel('right', 0);
          } else if (angular.isDefined(scope.responsive)) {
            closePanel(scope.responsive, 0);
          }
        }
      }

      scope.setActive          = setActive;
      scope.setInactive        = setInactive;

      scope.getReadyActivate   = getReadyActivate;
      scope.getReadyDeactivate = getReadyDeactivate;

      scope.activate           = activate;
      scope.deactivate         = deactivate;

      scope.openPanel          = openPanel;
      scope.closePanel         = closePanel;
      scope.togglePanel        = togglePanel;

      /* register */
      scope = angular.extend(scope, scope.$eval(attrs.buScreen));
      scope = angular.extend(scope, {
        element: element,
        attrs  : attrs,
      });
      $state.registerScreen(scope);


      /* responsive */
      $timeout(reposition);
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
