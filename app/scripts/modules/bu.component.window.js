//-------------------------------------------------------------------
// bu: window (directive)
//-------------------------------------------------------------------

// - page is defined by (id, caption) where id is used to
//   specify which page in JavaScript, caption is for the
//   user. page navigation is done by touch swiping.
// - page dimension can be specified in 'style' attribute
//   active page and ready page are shown in layered style
//   so that if the user tries to move the page, then underlaid
//   page can be shown underneath.
angular.module('bu').directive('buPage', [
  '$log', '$q',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $settings, $bu, $state, $e) {
    function controller($scope, $element) {

    }
    function linker(scope, element, attrs) {

    }
    return {
      restrict  : 'A',
      controller: controller,
      link      : linker,
    };
  }
]);

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
        if (scope.mode === 'full') {
          scope.element.width(fullwidth);
        } else if (scope.mode === 'left' || scope.mode === 'right') {
          scope.element.width(fullwidth - scope.panelWidth);
        } else if (scope.mode === 'both') {
          scope.element.width(fullwidth - 2 * scope.panelWidth);
        }

        /* x */
        if (scope.mode === 'full') {
          return $bu.x(scope.element, 0, 0);
        } else if (scope.mode === 'left' || scope.mode === 'both') {
          return $bu.x(scope.element, scope.panelWidth, 0);
        }
      }

      function slide(position, speed) {
        var speed = angular.isDefined(speed)? speed : $settings.BU_SLIDE_SPEED;

        if (scope.mode === 'both') {
          $log.debug('[bu.window] no need to slide: ' + position);
          return $q.when(true);
        }

        switch (position) {
        case 'left':
          return $bu.x(element, scope.panelWidth, speed);
        case 'right':
          if (scope.mode === 'full') {
            return $bu.x(element, -1 * scope.panelWidth, speed);
          } else if (scope.mode === 'left' || scope.mode == 'right') {
            return $bu.x(element, 0, speed);
          } else {
            console.assert(false);
          }
        default:
          console.assert(false);
        }
      }
      function unslide(position, speed) {
        var speed = angular.isDefined(speed)? speed : $settings.BU_SLIDE_SPEED;

        if (scope.mode === 'both') {
          $log.debug('[bu.window] no need to unslide: ' + position);
          return $q.when(true);
        }
        switch (position) {
        case 'left':
          if (scope.mode === 'full' || scope.mode === 'right') {
            return $bu.x(element, 0, speed);
          } else {
            $log.debug('[bu.window] no need to unslide: ' + position);
            return $q.when(true);
          }
        case 'right':
          if (scope.mode === 'full') {
            return $bu.x(element, 0, speed);
          } else if (scope.mode === 'left') {
            return $bu.x(element, scope.panelWidth, speed);
          } else {
            $log.debug('[bu.window] no need to unslide: ' + position);
            return $q.when(true);
          }
        default:
          console.assert(false);
        }
      }
      function setMode(mode) {
        scope.mode = mode;
        return reposition();
      }

      scope.mode = 'full'; // {'full', 'left', 'right', 'both'}
      scope.zindex  = function() { return $state.ui.zindex.top; }
      scope.slide   = slide;
      scope.unslide = unslide;
      scope.setMode = setMode;

      /* register */
      scope = angular.extend(scope, scope.$eval(attrs.buWindow));
      scope = angular.extend(scope, {
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
