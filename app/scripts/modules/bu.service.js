//-------------------------------------------------------------------
// service: bu.$service
//-------------------------------------------------------------------
angular.module('bu')
.factory('bu.$service', [
  '$log', '$rootScope', '$window', '$timeout', '$q',
  'bu.$settings', 'bu.$events', 'bu.$state',

  function($log, $rootScope, $window, $timeout, $q, $settings, $e, $state) {

    var service = {}
    var browser = $state.browser;

    // EVENT send/receive //
    function fire(sender, ev, data) {
      $console.assert(angular.isString(ev));
      $console.assert($e[ev]); /* sanity check */

      $log.debug('[' + sender + '] >> ' + ev);
      $rootScope.$emit($e[ev], data);
    }
    function wait(waiter, ev, callback, onetime) {
      $console.assert(angular.isString(ev));
      $console.assert($e[ev]); /* sanity check */

      $log.debug('[' + waiter + '] waits on ' + ev);
      var unsubscribe = $rootScope.$on($e[ev], function(e, data) {
        $log.debug('[' + waiter + '] << ' + ev);
        if (onetime) unsubscribe();
        callback(data);
      });
    }

    // ANIMATION - SCALE //
    function scale(element, scale, speed) {
      var defer = $q.defer();
      if (!browser.transforms) {
        defer.resolve();
      }
      TweenMax(element, speed / 1000.0, {
        scaleX: scale, scaleY: scale,
        onComplete: function() {
          defer.resolve();
        }
      });
      return defer.promise;
    }

    // ANIMATION - X //
    function x(element, x, speed) {
      var defer = $q.defer();
      var line;

      if (!angular.isDefined(speed)) speed = $settings.BU_SLIDE_SPEED;
      if (!browser.transitions ||
          !browser.transforms  ||
          !$settings.BU_ANIMATION) {
        element.css('left', x + 'px');
        defer.resolve();
      } else {
        if (browser.transforms3d) {
          /* 3D acceleration */
          if ($settings.BU_FORCE_3D) {
            TweenMax.to(element, speed / 1000.0, {
              x: x, y: 0, z: 0.01, /* force 3D */

              // (NOTE)
              // if z is set to 0.01, clickable element
              // becomes unclickable so that it is necessary
              // to restore the z value to 0 at the end.
              onComplete: function() {
                TweenMax.to(element, 0, {
                  x: x, y: 0, z:0,
                  onComplete: function() {
                    defer.resolve();
                  }
                });
              },
            });
          } else {
            TweenMax.to(element, speed / 1000.0, {
              css: {
                transform: "translate3d(" + x + "px, 0, 0)",
              },
              onComplete: function() {
                defer.resolve();
              }
            });
          }
        } else {
          /* 2D acceleration */
          TweenMax.to(element, speed / 1000.0, {
            css: { transform: "translateX(" + x + "px)" },
            onComplete: function() {
              if (x === 0) {element[0].style.transform = '';}
              defer.resolve();
            }
          });
        }
      }
      return defer.promise;
    }

    // UTILITY //
    function preload(src) {
      var defer = $q.defer();
      var image = new Image();

      image.src = src;
      image.onload = function() {
        $log.debug('[bu.$service:preload] ' + src + ' (width: ' + image.width + ', height: ' + image.height + ')');
        defer.resolve({ width : image.width, height: image.height });
      };
      return defer.promise;
    };

    // API //
    service.wait     = wait;
    service.fire     = fire;
    service.x        = x;
    service.preload  = preload;

    // events //
    angular.element($window).bind('resize', _.throttle(function(e) {
      $state.ui.width  = angular.element($window).width();
      $state.ui.height = angular.element($window).height();

      $rootScope.$apply(function() {
        /* force dirty checks */
        fire('bu.$service', 'BU_EVENT_UI:RESIZE');
      });
    }, 1000, {leading: false, trailing: true}));

    return service;
  }
])
