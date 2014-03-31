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
    service.root   = undefined;
    service.screen = undefined; /* active screen */

    /* state */
    service.state = {
      keyboard: false, /* under keyboard processing */
      ajax    : false, /* under ajax loading */
    }

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
    function getSize() {
      if (isLarge()) return 'large';
      if (isMedium()) return 'medium';
      if (isSmall()) return 'small';
      console.assert(false);
    }
    function registerRoot(spec) {
      var element;
      console.assert(angular.isDefined(spec.attrs.buScreens));
      $log.debug('[bu.$state] registering root (screens)');
      service.root = spec
    }

    service.isLarge  = isLarge;
    service.isSmall  = isSmall;
    service.isMedium = isMedium;
    service.getSize  = getSize;

    service.registerRoot = registerRoot;

    return service;
  }
]);