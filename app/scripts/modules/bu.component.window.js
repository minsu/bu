//-------------------------------------------------------------------
// bu: window (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buWindow', [
  '$log', '$q',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $settings, $bu, $state, $e) {

    function linker(scope, element, attrs, ctrl) {

      function reposition() {
        var fullwidth;

        /* width */
        fullwidth = scope.element.parent().width();
        if (scope.state === 'full') {
          scope.element.width(fullwidth);
        } else if (scope.state === 'left' ||
                   scope.state === 'right') {
          scope.element.width(fullwidth - scope.options.offset);
        } else if (scope.state === 'both') {
          scope.element.width(fullwidth - 2 * scope.options.offset);
        }

        /* x */
        if (scope.state === 'full') {
          return $bu.x(scope.element, 0, 0);
        } else if (scope.state === 'left' ||
                   scope.state === 'both') {
          return $bu.x(scope.element, scope.options.offset, 0);
        }
      }

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

      scope.state      = undefined; // {'full', 'left', 'right', 'both'}
      scope.zindex     = function() { return $state.ui.zindex.top; }
      scope.slide      = slide;
      scope.unslide    = unslide;
      scope.reposition = reposition;

      /* register */
      scope = angular.extend(scope, {
        options: scope.$eval(attrs.buWindow),
        element: element,
        attrs  : attrs,
      });
      ctrl.register(scope);
    }

    return {
      restrict   : 'A',
      replace    : true,
      templateUrl: 'bu.component.window.html',
      transclude : true,
      require    : '^buScreen',
      link       : linker,
    };
  }
])
