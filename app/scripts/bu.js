//-------------------------------------------------------------------
// module: bu
//-------------------------------------------------------------------
var module = angular.module('bu', [])

// service: bu.$settings
//-------------------------------------------------------------------
module.constant('bu.$settings', {
  BU_DEBUG          : true,
  BU_ANIMATION      : true, /* if false, css 'left' is used */
  BU_FORCE_3D       : true, /* if false, translateX() is used */
  BU_SLIDE_SPEED    :  500, /* unit: ms */
  BU_SLIDE_DIRECTION: 'right',

  /* responsive thresholds */
  BU_WIDTH_SMALL : 480,
  BU_WIDTH_MEDIUM: 1024,

  /* responsive panel positions */
  BU_PANEL_CONFIG: {
    small : 'none', /* no permanently shown panel for small devices */
    medium: 'none', /* no permanently shown panel for medium devices */
    large : 'none', /* no permanently shown panel for large devices */
  },
});

// config
//-------------------------------------------------------------------
module.config(['$logProvider', 'bu.$settings',
  function($logProvider, $settings) {

    // LOGGING //
    $logProvider.debugEnabled($settings.BU_DEBUG);

    // CONSOLE //
    if (!$settings.BU_DEBUG ||
        !angular.isDefined(window.console)) {
      window.$console = {};
      window.$$console.assert = angular.noop;
      window.$console.log    = angular.noop;
    } else {
      window.$console = window.console;
    }
  }
]);

// run
//-------------------------------------------------------------------
module.run(['$log', 'bu.$settings', 'bu.$state',
  function($log, $settings, $state) {
    $log.debug('[bu] START');
    if ($settings.BU_DEBUG) window.$bu = $state;
  }
]);