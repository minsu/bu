//-------------------------------------------------------------------
// bu: page (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buPage', [
  '$log', '$q',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $settings, $bu, $state, $e) {

    function linker(scope, element, attrs, ctrl) {
      function handleTouch(e) {
        var offset;
        if (scope.state !== 'active') return $log.debug('pass');
        e.gesture.preventDefault(); // disable browser scrolling

        switch (e.type) {
        case 'dragright' :
        case 'dragleft'  :
          offset = e.gesture.deltaX;

          if (offset > 0) {
            if (ctrl.isFirstPage()) {
              return $bu.x(element, offset * 0.5, 0);
            } else {
              ctrl.getPage('left').state = 'ready';
              ctrl.getPage('right').state = 'inactive';

              return $q.all([
                $bu.x(element, offset, 0),
                $bu.x(ctrl.getPage('left').element,
                  (-1) * 0.5 * element.width() + offset * 0.5, 0),
              ]);
            }
          } else {
            if (ctrl.isLastPage()) {
              return $bu.x(element, offset * 0.5, 0);
            } else {
              ctrl.getPage('right').state = 'ready';
              ctrl.getPage('left').state = 'inactive';

              return $q.all([
                $bu.x(element, offset, 0),
                $bu.x(ctrl.getPage('right').element,
                  0.5 * element.width() + offset * 0.5, 0),
              ]);
            }
          }
          break;

        case 'release'   :
          offset = e.gesture.deltaX;
          if (Math.abs(offset) > element.width() * 0.25) {
            if (e.gesture.direction === 'right') {
              return ctrl.flip('left');
            } else if (e.gesture.direction === 'left') {
              return ctrl.flip('right');
            } else { console.assert(false); }
          } else {
            var direction, to, speed;
            var bucket = [];

            if (offset > 0) {
              direction = 'left';
              to = (-1) * 0.5 * element.width();
            } else {
              direction = 'right';
              to = element.width() * 0.5;
            }
            speed = Math.abs(offset) / element.width() * $settings.BU_SLIDE_SPEED;
            bucket.push($bu.x(element, 0, speed));
            bucket.push($bu.x(ctrl.getPage(direction).element, to, speed));
            return $q.all(bucket);
          }
          break;

        case 'swipeleft' :
          e.gesture.stopDetect();
          return ctrl.nextPage();
          break;
        case 'swiperight':
          e.gesture.stopDetect();
          return ctrl.prevPage();
          break;
        default:
          console.assert(false);
        }
      }

      scope.position = undefined;
      scope.state    = undefined;

      /* touch event */
      if (ctrl) {
        Hammer(element[0], {drag_lock_to_axis: true}).on(
          "release dragleft dragright swipeleft swiperight",
          handleTouch
        );
      }

      /* register */
      if (ctrl) {
        $log.debug('[bu.page] registering to pages')
        scope = angular.extend(scope, {
          options: scope.$eval(attrs.buPage),
          element: element,
          attrs  : attrs,
        });
        ctrl.register(scope);
      } else {
        $log.debug('[bu.page] no parent pages controller')
      }
    }

    return {
      restrict   : 'A',
      scope      : {},
      require    : '?^buPages',
      templateUrl: 'bu.component.page.html',
      replace    : true,
      transclude : true,
      link       : linker,
    };
  }
]);
