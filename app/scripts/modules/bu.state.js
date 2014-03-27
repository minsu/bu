//-------------------------------------------------------------------
// service: bu.$state
//-------------------------------------------------------------------
angular.module('bu').factory('bu.$state',  [
  '$log', '$q', '$window', '$rootScope',
  'bu.$settings', 'bu.$service',

  function($log, $q, $window, $rootScope, $settings, $bu) {
    var service = {};

    service.ui = {
      width  : 0,
      height : 0,
      loading: false, /* ajax loading */

      zindex : {
        flash : 100,  /* temporary escalation or flash */
        top   : 30,   /* top layer    */
        middle: 20,   /* middle layer */
        bottom: 10,   /* bottom layer */
        base  : 0,    /* base zindex  */
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
    function register(spec) {
      /* bu-screen */
      if (angular.isDefined(spec.attrs.buScreen)) {
        service.screens = service.screens || {};
        service.screens[spec.options.name] = spec;
        $log.debug('[bu.$state] screen registered: ' + spec.options.name);
      }
      /* bu-flash */
      if (angular.isDefined(spec.attrs.buFlash)) {
        console.assert(!angular.isDefined(service.flash));
        service.flash = spec;
        $log.debug('[bu.$state] flash registered');
      }
    }

    function showFlash(title, text, options) {
      console.assert(service.flash);
      var DEFAULT_OPTIONS = {
        closeable: false,
        confirm  : true,
      };
      options = angular.extend(DEFAULT_OPTIONS, options);
      _.defer(function(){
        $rootScope.$apply(function() {
          angular.extend(service.flash, options);
          service.flash.message = {
            title: title,
            text : text,
          };
          service.flash.state = 'active';
        });
      });
    }
    function hideFlash() {
      _.defer(function() {
        $rootScope.$apply(function() {
          service.flash.state   = 'inactive';
        });
      });
    }
    function activateScreen(name, direction) {
      var defer = $q.defer();
      var from  = getActiveScreen();
      var to    = getScreen(name);

      $console.assert(to);
      direction = angular.isDefined(direction)? direction : $settings.BU_SLIDE_DIRECTION;

      if (from === to) {
        $log.debug('[bu.$state] skipping activation');
        defer.resolve();
        return defer.promise;
      }

      if (angular.isDefined(from)) {
        $log.debug('[bu.$state] screen change ' +
          from.options.name + ' => ' + to.options.name);

        $q.all([
          from.getReadyDeactivate(direction),
          to.getReadyActivate(direction)
        ]).then(function() {
          return $q.all([
            from.deactivate(direction),
            to.activate(direction),
          ]);
        }).then(function() {
          to.state = 'active';
          from.state = 'inactive';
          defer.resolve();
        });
      } else {
        $log.debug('[bu.$state] initial screen setup');

        angular.forEach(service.screens, function(screen) {
          if (screen.options.name === name) {
            screen.state = 'active';
          } else {
            screen.state = 'inactive';
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

    service.register        = register

    service.getScreen       = getScreen;
    service.getActiveScreen = getActiveScreen;
    service.activateScreen  = activateScreen;

    // Flash //
    service.showFlash     = showFlash;
    service.hideFlash     = hideFlash;
    return service;
  }
]);