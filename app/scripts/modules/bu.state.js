//-------------------------------------------------------------------
// service: bu.$state
//-------------------------------------------------------------------
angular.module('bu').factory('bu.$state',  [
  '$log', '$q', '$window', '$rootScope',
  'bu.$settings',

  function($log, $q, $window, $rootScope, $settings) {
    var service = {};

    /* BROWSER CAPABILITY */
    service.browser = {
      transitions : Modernizr.csstransitions || false,
      transforms  : Modernizr.csstransforms  || false,
      transforms3d: Modernizr.csstransforms3d|| false,
      columns     : Modernizr.csscolumns     || false,
    };

    /* UI */
    service.ui = {
      width : angular.element($window).width(),
      height: angular.element($window).height(),
    };

    /* structure */
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
    }

    service.isLarge  = isLarge;
    service.isSmall  = isSmall;
    service.isMedium = isMedium;

    service.registerRoot = registerRoot;

    return service;
  }
]);