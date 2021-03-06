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

    /* structure */
    service.root = undefined;

    /* state */
    service.state = {
      panel   : false, /* true: closeable panel is active */
      screen  : false, /* true: screen is ready */
      keyboard: false, /* under keyboard processing */
      ajax    : false, /* under ajax loading */
    }

    // API //
    function isLarge() {
      return (angular.element($window).width() > $settings.BU_WIDTH_MEDIUM);
    }
    function isSmall() {
      return (angular.element($window).width() <= $settings.BU_WIDTH_SMALL);
    }
    function isMedium() {
      var width = angular.element($window).width();
      return ((width >  $settings.BU_WIDTH_SMALL) &&
              (width <= $settings.BU_WIDTH_MEDIUM));
    }
    function getSize() {
      if (isLarge())  return 'large';
      if (isMedium()) return 'medium';
      if (isSmall())  return 'small';
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