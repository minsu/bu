//-------------------------------------------------------------------
// bu: screen (directive)
//-------------------------------------------------------------------

angular.module('bu').directive('buScreen', [
  '$log', '$q', '$timeout',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events', 'bu.$keyboard', 'bu.$factory', 'bu.$utility',

  function($log, $q, $timeout, $settings,
    $bu, $state, $e, $keyboard, $factory, $utility) {

    var SPEC = {
      name    : 'buScreen',
      options : ['small', 'medium', 'large'],
      defaults: {
        small : 'none',
        medium: 'none',
        large : 'none',
      },
    };

    function controller($scope, $element) {
      $scope.pages  = undefined;
      $scope.panels = [];

      function registerPages(spec) {
        if (angular.isDefined($scope.pages)) {
          console.assert(false, 'only one pages can be registered');
        }
        $log.debug('[bu.screen] registering a pages');
        $scope.pages = spec;
      }
      function registerPanel(spec) {
        if (!angular.isDefined(spec.position)) {
          console.assert(false, "a panel must have position value");
        }
        $log.debug('[bu.screen] registering a panel: ' + spec.position);
        $scope.panels.push(spec);
      }

      $scope.registerPages = registerPages;
      $scope.registerPanel = registerPanel;

      return $scope;
    }

    function linker(scope, element, attrs, ctrl) {
      var panelUnregister;

      function setState(state) {
        var panelControl;

        switch (state) {
        case 'active':
          /* event subscription */
          if (angular.isDefined(scope.pages.keyboard)) {
            $keyboard.subscribe(scope.pages.keyboard);
          }

          /* panel control */
          if (scope.panels.length > 0) {
            var panelControl = $factory.PanelControl();

            panelControl.init(
              scope.pages, scope.panels, scope.options);

            scope.panelControl= panelControl;
            scope.openPanel   = panelControl.open;
            scope.closePanel  = panelControl.close;
            scope.togglePanel = panelControl.toggle;

            panelControl.reset();

            /* events */
            panelUnregister = $bu.wait('bu.screen', 'BU_EVENT_UI:RESIZE', panelControl.reset);
            Hammer(element[0]).on("tap", handleTap);
          }
          break;
        case 'ready': break;
        case 'inactive':
          /* event unsubscription */
          if (angular.isDefined(scope.pages.keyboard)) {
            $keyboard.unsubscribe(scope.pages.keyboard);
          }
          if (scope.panels.length > 0) {
            if (angular.isDefined(panelUnregister)) panelUnregister();
            Hammer(element[0]).off("tap")
          }
          break;
        }
        scope.state = state;
      }
      function getReadyDeactivate(direction) {
        if (angular.isDefined(scope.panelControl)) {
          return scope.panelControl.revert();
        } else {
          return $q.when(true);
        }
      }
      function getReadyActivate(direction) {
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
      function handleTap(e) {
        var x = e.gesture.startEvent.touches[0].x;
        var startX = 0, endX = 0;

        $log.debug('[bu.screen] tap');
        $log.debug(e);

        if (!angular.isDefined(scope.panelControl)) return;

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
          return scope.panelControl.revert();
        }
      }
      scope.state   = undefined;
      scope.name    = attrs.buScreen;
      scope.options = $utility.createOptionObject(SPEC, attrs);
      $log.debug(scope.options);

      scope.setState           = setState;
      scope.getReadyActivate   = getReadyActivate;
      scope.getReadyDeactivate = getReadyDeactivate;
      scope.activate           = activate;
      scope.deactivate         = deactivate;

      /* register */
      angular.extend(scope, {
        element: element,
        attrs  : attrs,
      });
      ctrl.registerScreen(scope);
    }

    return {
      restrict   : 'A',
      scope      : $utility.createScopeObject(SPEC),
      templateUrl: 'bu.container.html',
      require    : '^buScreens',
      replace    : true,
      transclude : true,
      link       : linker,
      controller : controller,
    };
  }
]);
