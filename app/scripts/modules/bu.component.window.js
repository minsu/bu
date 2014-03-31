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

      function slide(position, speed) {
        var speed = angular.isDefined(speed)? speed : $settings.BU_SLIDE_SPEED;

        if (scope.state === 'both') {
          $log.debug('[bu.window] no need to slide: ' + position);
          return $q.when(true);
        }

        switch (position) {
        case 'left':
          return $bu.x(element, scope.options.offset, speed);
        case 'right':
          if (scope.state === 'full') {
            return $bu.x(element, -1 * scope.options.offset, speed);
          } else if (scope.state === 'left' ||
                     scope.state === 'right') {
            return $bu.x(element, 0, speed);
          } else {
            console.assert(false);
            break;
          }
        default:
          console.assert(false);
        }
      }
      function unslide(position, speed) {
        var speed = angular.isDefined(speed)? speed : $settings.BU_SLIDE_SPEED;

        if (scope.state === 'both') {
          $log.debug('[bu.window] no need to unslide: ' + position);
          return $q.when(true);
        }
        switch (position) {
        case 'left':
          if (scope.state === 'full' ||
              scope.state === 'right') {
            return $bu.x(element, 0, speed);
          } else {
            $log.debug('[bu.window] no need to unslide: ' + position);
            return $q.when(true);
          }
        case 'right':
          if (scope.state === 'full') {
            return $bu.x(element, 0, speed);
          } else if (scope.state === 'left') {
            return $bu.x(element, scope.options.offset, speed);
          } else {
            $log.debug('[bu.window] no need to unslide: ' + position);
            return $q.when(true);
          }
        default:
          console.assert(false);
        }
      }
      function handleTap(e) {
        if (scope.state !== 'none') return;

        angular.forEach(ctrl.panels, function(panel) {
          if (panel.state === 'active') {
            if (panel.options.position === 'left') {
              e.preventDefault();
              return ctrl.closePanel('left');
            } else if (panel.options.position === 'right') {
              e.preventDefault();
              return ctrl.closePanel('right');
            }
          }
        });
      }

      // WINDOW STATE
      // both  : left & right opened (permanent)
      // left  : left  opened by default (one panel open all the time)
      // right : right opened by default (one panel open all the time)
      // none  : none  opened by default
      scope.state = undefined; // {'full', 'left', 'right', 'both'}
      scope.slide      = slide;
      scope.unslide    = unslide;

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
      replace    : true,
      scope      : true,
      templateUrl: 'bu.component.window.html',
      transclude : true,
      require    : '^buScreen',
      controller : controller,
      link       : linker,
    };
  }
])
