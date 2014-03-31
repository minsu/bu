//-------------------------------------------------------------------
// bu: screen (directive)
//-------------------------------------------------------------------

angular.module('bu').directive('buScreen', [
  '$log', '$q', '$timeout',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events', 'bu.$keyboard',

  function($log, $q, $timeout, $settings, $bu, $state, $e, $keyboard) {
    var DEFAULT_PANEL_CONFIG = {
      small : 'none',
      medium: 'none',
      large : 'none',
    }

    function controller($scope, $element) {
      $scope.window = undefined;
      $scope.panels = [];

      function getPanel(position) {
        return _.find($scope.panels, {options:{position:position}});
      }
      function getPanelWidth(position) {
        var panel = getPanel(position);
        if (angular.isDefined(panel)) {
          return panel.options.width;
        } else {
          return 0;
        }
      }

      function openPanel(position, speed) {
        var offset;
        var panel = getPanel(position);
        var opposite = (position === 'left')? 'right' : 'left';
        var other = getPanel(opposite);

        // trivial cases //
        console.assert(position === 'left' || position === 'right');
        if (!angular.isDefined(panel)) {
          $log.debug('[bu.screen] no panel found: ' + position);
          return $q.when(true);
        }
        if (panel.state !== 'inactive') {
          $log.debug('[bu.screen] no need to open: ' + position + '(' + panel.state + ')');
          return $q.when(true);
        }

        // based on window.state //
        switch ($scope.window.state) {
        case 'both':
          console.assert(false); /* handled above as a trivial case */

        case 'left': case 'right':
          console.assert(angular.isDefined(opposite));
          console.assert(opposite.state === 'active');

          return $q.all([
            panel.getReadyActivate(),
            other.getReadyDeactivate(),
          ])
          .then(function() {
            if (position === 'left') {
              offset = getPanelWidth('left');
            } else if (position === 'right') {
              offset = 0;
            } else { console.assert(false); }

            return $q.all([
              $bu.x($scope.window.element, offset),
              panel.activate(speed),
              other.deactivate(speed),
            ]);
          })
          .then(function() {
            panel.state = 'active';
            other.state = 'inactive';
            return $q.when(true);
          });
        case 'none':
          if (other && other.state === 'active') {
            return closePanel(opposite, speed);
          }
          return panel.getReadyActivate()
          .then(function() {
            if (position === 'left') {
              offset = getPanelWidth('left');
            } else if (position === 'right') {
              offset = (-1) * getPanelWidth('right');
            }
            return $q.all([
              $bu.x($scope.window.element, offset),
              panel.activate(speed),
            ]);
          })
          .then(function() {
            panel.state = 'active';
            return $q.when(true);
          });
        default:
          console.assert(false);
        }
      }

      function closePanel(position, speed) {
        var offset;
        var panel = getPanel(position);
        var opposite = (position === 'left')? 'right' : 'left';
        var other = getPanel(opposite);

        // trivial cases //
        console.assert(position === 'left' || position === 'right');
        if (!angular.isDefined(panel)) {
          $log.debug('[bu.screen] no panel found: ' + position);
          return $q.when(true);
        }
        if (panel.state !== 'active') {
          $log.debug('[bu.screen] no need to close: ' + position + '(' + panel.state + ')');
          return $q.when(true);
        }

        // based on window.state //
        switch ($scope.window.state) {
        case 'both':
          console.assert(false); /* handled above as a trivial case */

        case 'left': case 'right':
          console.assert(angular.isDefined(opposite));
          console.assert(opposite.state === 'inactive');

          return $q.all([
            panel.getReadyDeactivate(),
            other.getReadyActivate(),
          ])
          .then(function() {
            if (position === 'left') {
              offset = 0;
            } else if (position === 'right') {
              offset = getPanelWidth('left');
            }
            return $q.all([
              $bu.x($scope.window.element, offset),
              panel.deactivate(speed),
              other.activate(speed),
            ]);
          })
          .then(function() {
            other.state = 'active';
            panel.state = 'inactive'
            return $q.when(true);
          });
        case 'none':
          return panel.getReadyDeactivate()
          .then(function() {
            return $q.all([
              $bu.x($scope.window.element, 0),
              panel.deactivate(speed),
            ]);
          })
          .then(function() {
            panel.state = 'inactive';
            return $q.when(true);
          });
        default:
          console.assert(false);
        }
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
      function registerWindow(spec) {
        if (angular.isDefined($scope.window)) {
          console.assert(false, 'only one window can be registered');
        }
        $log.debug('[bu.screen] registering a window');
        $scope.window = spec;
      }
      function registerPanel(spec) {
        if (!angular.isDefined(spec.options) ||
            !angular.isDefined(spec.options.position)) {
          console.assert(false, "a panel must have position value");
        }
        $log.debug('[bu.screen] registering a panel: ' + spec.options.position);
        $scope.panels.push(spec);
      }

      $scope.registerWindow = registerWindow;
      $scope.registerPanel  = registerPanel;

      $scope.getPanel      = getPanel;
      $scope.getPanelWidth = getPanelWidth;
      $scope.openPanel     = openPanel;
      $scope.closePanel    = closePanel;
      $scope.togglePanel   = togglePanel;

      return $scope;
    }

    function linker(scope, element, attrs, ctrl) {
      var spec;

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
        if (scope.window.state === 'none') {
          angular.forEach(scope.panels, function(panel) {
            if (panel.state === 'active') {
              bucket.push(scope.closePanel(panel.options.position));
            }
          });
        }
        return $q.all(bucket);
      }
      function getReadyActivate(direction) {
        if (direction === 'right') {
          return $bu.x(element, (-1) * 0.25 * element.width(), 0)
          .then(function() { return reposition(); });
        } else if (direction === 'left') {
          return $bu.x(element, 0.75 * element.width(), 0).
          then(function() { return reposition(); })
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
        var panelConfig = angular.extend(DEFAULT_PANEL_CONFIG,
          scope.options.panels || {}
        )[$state.getSize()];

        console.assert(angular.isString(panelConfig));
        scope.window.state = panelConfig;
        switch (panelConfig) {
        case 'both':
          $log.debug(ctrl);
          console.assert(angular.isDefined(scope.getPanel('left')));
          console.assert(angular.isDefined(scope.getPanel('right')));
          scope.getPanel('left').state  = 'enabled';
          scope.getPanel('right').state = 'enabled';

          scope.window.element.width(element.parent().width() -
            (scope.getPanelWidth('left') + scope.getPanelWidth('right')));
          return $q.all([
            $bu.x(scope.getPanel('left').element, 0, 0),
            $bu.x(scope.getPanel('right').element, element.parent().width() - scope.getPanelWidth('right'), 0),
            $bu.x(scope.window.element, scope.getPanelWidth('left'), 0),
          ]);
        case 'left':
          console.assert(angular.isDefined(scope.getPanel('left')));
          if (angular.isDefined(scope.getPanel('right'))) {
            scope.getPanel('left').state  = 'active';
            scope.getPanel('right').state = 'inactive';
          } else {
            scope.getPanel('left').state = 'enabled';
          }
          scope.window.element.width(element.parent().width() - scope.getPanelWidth('left'));
          return $q.all([
            $bu.x(scope.getPanel('left').element, 0, 0),
            $bu.x(scope.window.element, scope.getPanelWidth('left'), 0),
            ]);
        case 'right':
          if (angular.isDefined(scope.getPanel('left'))) {
            scope.getPanel('right').state = 'active';
            scope.getPanel('left').state  = 'inactive';
          } else {
            scope.getPanel('right').state = 'enabled';
          }
          scope.window.element.width(element.parent().width() - scope.getPanelWidth('right'));
          return $q.all([
            $bu.x(scope.getPanel('right').element, element.parent().width() - scope.getPanelWidth('right'), 0),
            $bu.x(scope.window.element, 0, 0),
          ]);
        case 'none':
          angular.forEach(scope.panels, function(panel) {
            panel.state = 'inactive';
          });
          scope.window.element.width(element.parent().width());
          return $bu.x(scope.window.element, 0, 0);
        default:
          console.assert(false);
        }
      }
      function setState(state) {
        // STATES {active, inactive, ready}
        switch (state) {
        case 'active':
          /* event subscription */
          if (angular.isDefined(scope.window.pages.keyboard)) {
            $keyboard.subscribe(scope.window.pages.keyboard);
          }
          break;
        case 'ready': break;
        case 'inactive':
          /* event unsubscription */
          if (angular.isDefined(scope.window.pages.keyboard)) {
            $keyboard.unsubscribe(scope.window.pages.keyboard);
          }
          break;
        }
        scope.state = state;
      }
      scope.state              = undefined;
      scope.setState           = setState;
      scope.zindex             = zindex;
      scope.getReadyActivate   = getReadyActivate;
      scope.getReadyDeactivate = getReadyDeactivate;
      scope.activate           = activate;
      scope.deactivate         = deactivate;

      /* register */
      spec = angular.extend(scope, {
        options: scope.$eval(attrs.buScreen),
        element: element,
        attrs  : attrs,
      });
      ctrl.registerScreen(spec);

      /* reposition */
      reposition();
      $bu.wait('bu.screen', 'BU_EVENT_UI:RESIZE', reposition);
    }

    return {
      restrict   : 'A',
      scope      : {},
      templateUrl: 'bu.component.screen.html',
      require    : '^buScreens',
      replace    : true,
      transclude : true,
      controller : controller,
      link       : linker,
    };
  }
]);
