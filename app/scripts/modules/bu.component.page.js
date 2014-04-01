//-------------------------------------------------------------------
// bu: page (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buPage', [
  '$log', '$q',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $settings, $bu, $state, $e) {

    function linker(scope, element, attrs, ctrl) {
      var spec;

      function handleTap(e) {
        var x = e.gesture.startEvent.touches[0].x;

        $log.debug('[bu.page] tap');
        $log.debug(e);
        if ($state.state.panel) {
          $log.debug('[bu.page] delegating tap event to outer');
          return;
        }

        if (x < 0.25 * element.width()) {
          e.gesture.stopDetect();
          return ctrl.prevPage();
        } else if (x > 0.75 * element.width()) {
          e.gesture.stopDetect();
          return ctrl.nextPage();
        }
      }
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
            if ((e.gesture.direction === 'right') &&
                (!ctrl.isFirstPage())) {
              return ctrl.activate('left');
            } else if ((e.gesture.direction === 'left') &&
                (!ctrl.isLastPage())) {
              return ctrl.activate('right');
            }
          }
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
          if (angular.isDefined(ctrl.getPage(direction))) {
            page = ctrl.getPage(direction);
            bucket.push($bu.x(page.element, to, speed));
          }
          return $q.all(bucket);
        case 'swipeleft' :
          e.gesture.stopDetect();
          return ctrl.nextPage();
        case 'swiperight':
          e.gesture.stopDetect();
          return ctrl.prevPage();
        default:
          console.assert(false);
        }
      }

      scope.position = undefined;
      scope.state    = undefined;

      /* touch event */
      Hammer(element[0], {drag_lock_to_axis: true}).on(
        "release dragleft dragright swipeleft swiperight",
        handleTouch
      );
      Hammer(element[0]).on("tap", handleTap);

      /* register */
      spec = angular.extend(scope, {
        options: scope.$eval(attrs.buPage),
        element: element,
        attrs  : attrs,
      });
      ctrl.registerPage(spec);
    }

    return {
      restrict   : 'A',
      scope      : {},
      require    : '^buPages',
      templateUrl: 'bu.component.page.html',
      replace    : true,
      transclude : true,
      link       : linker,
    };
  }
]);
