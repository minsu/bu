//-------------------------------------------------------------------
// service: bu.$service
//-------------------------------------------------------------------
angular.module('bu')
.factory('bu.$service', [
  '$log', '$rootScope', '$window', '$timeout', '$q',
  'bu.$settings', 'bu.$events',

  function($log, $rootScope, $window, $timeout, $q, $settings, $e) {

    var service = {}

    /* browser capabilities */
    var browser = {
      transitions : Modernizr.csstransitions,
      transforms  : Modernizr.csstransforms,
      transforms3d: Modernizr.csstransforms3d,
    };

    // EVENT PUB-SUB //
    function fire(sender, ev, data) {
      $console.assert(angular.isString(ev));
      $console.assert($e[ev]);

      $log.debug('[' + sender + '] >> ' + ev);
      if (data) {
        if (angular.isFunction(data)) {
          $log.debug('event data: function object');
        } else {
          $log.debug(data);
        }
      }
      $rootScope.$emit($e[ev], data);
    }
    function wait(waiter, ev, callback) {
      $console.assert(angular.isString(ev));
      $log.debug(ev)
      $console.assert($e[ev]);

      $log.debug('[' + waiter + '] waits on ' + ev);
      $rootScope.$on($e[ev], function(e, data) {
        $log.debug('[' + waiter + '] << ' + ev);
        callback(data);
      });
    }

    // ANIMATION - X //
    function x(element, x, speed) {
      var defer = $q.defer();
      var line;

      speed = angular.isDefined(speed)? speed:$settings.BU_SLIDE_SPEED;
      if (!browser.transitions ||
          !browser.transforms  ||
          !$settings.BU_ANIMATION) {

        element.css('left', x + 'px');
        defer.resolve();
      } else {
        /* animation */
        if (browser.transforms3d) {
          if ($settings.BU_FORCE_3D) {
            TweenMax.to(element, speed / 1000.0, {
              x: x, y: 0, z: 0.01, /* force 3D */
              onComplete: defer.resolve,
            });
          } else {
            TweenMax.to(element, speed / 1000.0, {
              css: {
                transform: "translate3d(" + x + "px, 0, 0)",
              },
              onComplete: defer.resolve,
            });
          }
        } else {
          TweenMax.to(element, speed / 1000.0, {
            css: { transform: "translateX(" + x + "px)" },
            onComplete: defer.resolve,
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
        $log.debug('[bu:preload] loaded: ' + src);
        defer.resolve({
          width : image.width,
          height: image.height,
        });
      }
      return defer.promise;
    };

    // API //
    service.wait     = wait;
    service.fire     = fire;
    service.x        = x;
    service.preload  = preload;

    return service;
  }
])
