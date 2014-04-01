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

      function registerWindow(spec) {
        if (angular.isDefined($scope.window)) {
          console.assert(false, 'only one window can be registered');
        }
        $log.debug('[bu.screen] registering a window');
        $scope.window = spec;
      }
      function registerPanel(spec) {
        if (!angular.isDefined(spec.position)) {
          console.assert(false, "a panel must have position value");
        }
        $log.debug('[bu.screen] registering a panel: ' + spec.position);
        $scope.panels.push(spec);
      }

      $scope.registerWindow = registerWindow;
      $scope.registerPanel  = registerPanel;


      return $scope;
    }

    function linker(scope, element, attrs, ctrl) {
      var spec;

      function getPanelConfig() {
        return angular.extend(DEFAULT_PANEL_CONFIG,
          scope.options.panels || {}
        )[$state.getSize()];
      }
      function closePanels() {
        var bucket = [];
        var config = getPanelConfig();

        if (config === 'none') {
          angular.forEach(scope.panels, function(panel) {
            if (panel.state === 'active') {
              bucket.push(closePanel(panel.position));
            }
          });
        }
        return $q.all(bucket);
      }


      //-------------------------------------------------------------
      // Activation/Deactivation
      //-------------------------------------------------------------
      function setState(state) {
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
      function getReadyDeactivate(direction) {
        return closePanels();
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
      //-------------------------------------------------------------

      //-------------------------------------------------------------
      // Panel operations
      //-------------------------------------------------------------
      function getPanel(position) {
        return _.find(scope.panels, {position: position});
      }
      function getPanelWidth(position) {
        var panel = getPanel(position);
        if (angular.isDefined(panel)) {
          return panel.element.width();
        } else {
          $log.error('[bu.screen] no matching panel found: ' + position);
          return 0;
        }
      }
      function openPanel(position, speed) {
        var offset;
        var panel = getPanel(position);
        var opposite = (position === 'left')? 'right' : 'left';
        var other = getPanel(opposite);
        var panelConfig = getPanelConfig();

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
        switch (panelConfig) {
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
              $bu.x(scope.window.element, offset),
              panel.activate(speed),
              other.deactivate(speed),
            ]);
          })
          .then(function() {
            panel.setState('active');
            other.setState('inactive');
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
              $bu.x(scope.window.element, offset),
              panel.activate(speed),
            ]);
          })
          .then(function() {
            panel.setState('active');
            $state.state.panel = true; /* closeable panel is active */
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
        var panelConfig = getPanelConfig();

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

        switch (panelConfig) {
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
              $bu.x(scope.window.element, offset),
              panel.deactivate(speed),
              other.activate(speed),
            ]);
          })
          .then(function() {
            other.setState('active');
            panel.setState('inactive');
            return $q.when(true);
          });
        case 'none':
          return panel.getReadyDeactivate()
          .then(function() {
            return $q.all([
              $bu.x(scope.window.element, 0),
              panel.deactivate(speed),
            ]);
          })
          .then(function() {
            panel.setState('inactive');
            $state.state.panel = false; /* no closeable panel */
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
      //-------------------------------------------------------------

      //-------------------------------------------------------------
      // Positioning
      //-------------------------------------------------------------
      function reposition() {
        var panelConfig = angular.extend(DEFAULT_PANEL_CONFIG,
          scope.options.panels || {}
        )[$state.getSize()];

        console.assert(angular.isString(panelConfig));
        switch (panelConfig) {
        case 'both':
          $log.debug(ctrl);
          console.assert(angular.isDefined(scope.getPanel('left')));
          console.assert(angular.isDefined(scope.getPanel('right')));
          getPanel('left').setState('enabled');
          getPanel('right').setState('enabled');

          scope.window.element.width(element.parent().width() -
            (getPanelWidth('left') + getPanelWidth('right')));
          return $q.all([
            $bu.x(getPanel('left').element, 0, 0),
            $bu.x(getPanel('right').element, element.parent().width() - getPanelWidth('right'), 0),
            $bu.x(scope.window.element, getPanelWidth('left'), 0),
          ]);
        case 'left':
          console.assert(angular.isDefined(scope.getPanel('left')));
          if (angular.isDefined(scope.getPanel('right'))) {
            getPanel('left').setState('active');
            getPanel('right').setState('inactive');
          } else {
            getPanel('left').setState('enabled');
          }
          scope.window.element.width(element.parent().width() - getPanelWidth('left'));
          return $q.all([
            $bu.x(getPanel('left').element, 0, 0),
            $bu.x(scope.window.element, getPanelWidth('left'), 0),
            ]);
        case 'right':
          if (angular.isDefined(getPanel('left'))) {
            getPanel('right').setState('active');
            getPanel('left').setState('inactive');
          } else {
            getPanel('right').setState('enabled');
          }
          scope.window.element.width(element.parent().width() - getPanelWidth('right'));
          return $q.all([
            $bu.x(getPanel('right').element, element.parent().width() - getPanelWidth('right'), 0),
            $bu.x(scope.window.element, 0, 0),
          ]);
        case 'none':
          angular.forEach(scope.panels, function(panel) {
            panel.setState('inactive');
          });
          scope.window.element.width(element.parent().width());
          return $bu.x(scope.window.element, 0, 0);
        default:
          console.assert(false);
        }
      }
      //-------------------------------------------------------------

      //-------------------------------------------------------------
      // Touch events
      //-------------------------------------------------------------
      function handleTap(e) {
        var x = e.gesture.startEvent.touches[0].x;
        var startX = 0, endX = 0;

        $log.debug('[bu.screen] tap');
        $log.debug(e);
        if (getPanelConfig() !== 'none') return;

        $log.debug('[bu.screen] checking');
        angular.forEach(scope.panels, function(panel) {
          if (panel.state === 'active') {
            if (panel.position === 'left') {
              startX = panel.element.width();
            } else if (panel.position === 'right') {
              endX = element.width() - panel.element.width();
            } else {
              console.assert(false);
            }
          }
        });
        $log.debug('[bu.screen] startX: ' + startX);
        $log.debug('[bu.screen] endX  : ' + endX);
        $log.debug('[bu.screen] x     : ' + x);

        console.assert(!(startX && endX));
        if ((startX && (x > startX)) ||
            (endX   && (x < endX))) {
          return closePanels();
        }
      }
      scope.state              = undefined;
      scope.setState           = setState;

      scope.getReadyActivate   = getReadyActivate;
      scope.getReadyDeactivate = getReadyDeactivate;
      scope.activate           = activate;
      scope.deactivate         = deactivate;

      scope.getPanel      = getPanel;
      scope.getPanelWidth = getPanelWidth;
      scope.openPanel     = openPanel;
      scope.closePanel    = closePanel;
      scope.togglePanel   = togglePanel;

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

      /* touch events */
      Hammer(element[0]).on("tap", handleTap);
    }

    return {
      restrict   : 'A',
      scope      : {},
      templateUrl: 'bu.container.html',
      require    : '^buScreens',
      replace    : true,
      transclude : true,
      controller : controller,
      link       : linker,
    };
  }
]);
