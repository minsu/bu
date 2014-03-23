//-------------------------------------------------------------------
// service: bu.$state
//-------------------------------------------------------------------
// - provides access to all UI directives
// - provides debugging utilities for UI directives
// - provides top-level interface
// - global event handlers responding to window resize
//-------------------------------------------------------------------
angular.module('bu').factory('bu.$state',  [
  '$log', '$q', '$window', 'bu.$settings', 'bu.$service',

  function($log, $q, $window, $settings, $bu) {
    var service = {};

    service.screens = {};
    service.ui = {
      width  : 0,
      height : 0,
      loading: false, /* ajax loading */

      zindex : {
        flash : 100,  /* temporary escalation */
        top   : 30,   /* top layer */
        middle: 20,   /* middle layer (active) */
        bottom: 10,   /* bottom layer */
        base  : 0,    /* base zindex */
      },
    };

    // API //
    function isLarge() {
      return (service.ui.width > $settings.BU_WIDTH_MEDIUM);
    }
    function isSmall() {
      return (service.ui.width <= $settings.BU_WIDTH_SMALL);
    }
    function isMedium() {
      return ((service.ui.width > $settings.BU_WIDTH_SMALL) &&
              (service.ui.width <= $settings.BU_WIDTH_MEDIUM));
    }

    function getScreen(name) {
      return service.screens[name];
    }
    function getActiveScreen() {
      var result = undefined;
      angular.forEach(service.screens, function(value) {
        if (value.state === 'active') result = value;
      });
      return result;
    }
    function registerScreen(spec) {
      service.screens[spec.name] = spec;

      $log.debug('[bu.$state] screen registered: ' + spec.name);
      $log.debug(spec);
    }
    function activateScreen(name, direction) {
      var defer = $q.defer();
      var from  = getActiveScreen();
      var to    = getScreen(name);

      /* sanity checks */
      $log.debug(name)
      $console.assert(to);
      direction = angular.isDefined(direction)? direction : $settings.BU_SLIDE_DIRECTION;

      if (from === to) {
        $log.debug('[bu.$state] skipping activation');
        defer.resolve();
        return defer.promise;
      }

      if (angular.isDefined(from)) {
        $log.debug('[bu.$state] screen change ' + from.name + ' => ' + to.name);

        $q.all([
          from.getReadyDeactivate(direction),
          to.getReadyActivate(direction)
        ]).then(function() {
          return $q.all([
            from.deactivate(direction),
            to.activate(direction),
          ]);
        }).then(function() {
          to.setActive();
          from.setInactive();
          defer.resolve();
        });
      } else {
        $log.debug('[bu.$state] initial screen setup');

        angular.forEach(service.screens, function(screen) {
          if (screen.name === name) {
            screen.setActive();
          } else {
            screen.setInactive();
          }
        });
        defer.resolve();
      }
      return defer.promise;
    };

    // initial ui information //
    service.ui.width  = angular.element($window).width();
    service.ui.height = angular.element($window).height();

    // events //
    angular.element($window).bind('resize', _.throttle(function(e) {
      service.ui.width  = angular.element($window).width();
      service.ui.height = angular.element($window).height();

      $bu.fire('bu.$state', 'BU_EVENT_RESIZE');
    }, 1000, {leading: false, trailing: true}));

    /* when notified, all directives got compiled & linked */
    $bu.wait('bu.$state', 'BU_EVENT_DOMREADY', function() {
    });

    service.isLarge         = isLarge;
    service.isSmall         = isSmall;
    service.isMedium        = isMedium;

    service.getScreen       = getScreen;
    service.getActiveScreen = getActiveScreen;
    service.activateScreen  = activateScreen;
    service.registerScreen  = registerScreen;

    return service;
  }
]);