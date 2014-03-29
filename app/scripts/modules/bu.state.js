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
    service.root = undefined;

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
    function registerRoot(spec) {
      var element;
      if (angular.isDefined(spec.attrs.buScreens)) {
        element = 'screens';
      } else if (angular.isDefined(spec.attrs.buScreen)) {
        element = 'screen';
      } else {
        console.assert(false);
      }
      $log.debug('[bu.$state] registering root: ' + element);
      service.root = spec
    };

    // initial ui information //
    service.ui.width  = angular.element($window).width();
    service.ui.height = angular.element($window).height();

    service.isLarge  = isLarge;
    service.isSmall  = isSmall;
    service.isMedium = isMedium;

    service.registerRoot = registerRoot;

    // Flash //
    service.showFlash = showFlash;
    service.hideFlash = hideFlash;

    // events //
    angular.element($window).bind('resize', _.throttle(function(e) {
      service.ui.width  = angular.element($window).width();
      service.ui.height = angular.element($window).height();

      $bu.fire('bu.$state', 'BU_EVENT_UI:RESIZE');
    }, 1000, {leading: false, trailing: true}));

    return service;
  }
]);