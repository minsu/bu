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
      transitions: Modernizr.csstransitions,
      transforms : Modernizr.csstransforms,
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

      $log.debug('[bu:x] x: ' + x + ' ,speed: ' + speed);

      if (!angular.isDefined(speed)) speed = $settings.BU_SLIDE_SPEED;
      if (!browser.transitions ||
          !browser.transforms  ||
          !$settings.BU_ANIMATION) {
        /* no animation */
        element.css('left', x + 'px');
        defer.resolve();
      } else {
        /* animation */
        if ($settings.BU_FORCE_3D) {
          TweenMax.to(element, speed / 1000.0, {
            x: x, y: 0, z: 0.01, /* force 3D */
            onComplete: function() {
              $log.debug('[bu:x] done');
              defer.resolve();
            }
          });
        } else {
          TweenMax.to(element, speed / 1000.0, {
            css: {transform: "translateX(" + x + "px)"},
            onComplete: function() {
              $log.debug('[bu:x] done');
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
