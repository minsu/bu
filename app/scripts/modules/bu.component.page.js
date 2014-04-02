//-------------------------------------------------------------------
// bu: page (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buPage', [
  '$log', '$q',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events', 'bu.$utility',

  function($log, $q, $settings, $bu, $state, $e, $utility) {

    var SPEC = {
      name    : 'buPage',
      options : [],
      defaults: {},
    };

    function linker(scope, element, attrs, ctrl) {
      var spec;

      function handleTouch(e, ctrl) {
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
          console.assert(false);
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
          return ctrl.nextPage();
        case 'swiperight':
          return ctrl.prevPage();
        default:
          console.assert(false);
        }
      }
      function handleTap(e) {
        var rect = element[0].getBoundingClientRect();
        var x = e.gesture.srcEvent.clientX - rect.left;
        var y = e.gesture.srcEvent.clientY - rect.top;

        $log.debug('[bu.page] tap');
        $log.debug(e);
        if ($state.state.panel) {
          /* not a page navigation */
          $log.debug('[bu.page] delegating tap event to outer');
          return;
        }

        e.stopPropagation(); // no propagation upward
        if (x < 0.4 * element.width() &&
            y > 0 && y < element.height()) {
          return ctrl.prevPage();
        } else if (x > 0.4 * element.width() &&
                   y > 0 && y < element.height()) {
          return ctrl.nextPage();
        }
      }

      scope.position = undefined;
      scope.state    = undefined;
      scope.options  = $utility.createOptionObject(SPEC, attrs);

      /* register */
      angular.extend(scope, {
        element: element,
        attrs  : attrs,
      });

      ctrl.registerPage(scope);

      /* touch event */
      Hammer(element[0], {drag_lock_to_axis: true}).on(
        "release dragleft dragright swipeleft swiperight",
        function(e) {
          return handleTouch(e, ctrl);
        }
      );
      Hammer(element[0]).on("tap", handleTap);
    }

    return {
      restrict   : 'A',
      scope      : $utility.createScopeObject(SPEC),
      require    : '^buPages',
      templateUrl: 'bu.container.html',
      replace    : true,
      transclude : true,
      link       : linker,
    };
  }
]);
