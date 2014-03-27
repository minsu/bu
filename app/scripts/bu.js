//-------------------------------------------------------------------
// bu: bu (module)
//-------------------------------------------------------------------
var module = angular.module('bu', [])

// $settings
//-------------------------------------------------------------------
module.constant('bu.$settings', {
  BU_ANIMATION      : true, /* if false, css 'left' is used */
  BU_FORCE_3D       : true, /* if false, translateX() is used */
  BU_DEBUG          : true,
  BU_SLIDE_SPEED    :  400, /* unit: ms */
  BU_SLIDE_DIRECTION: 'right',

  /* responsive thresholds */
  BU_WIDTH_SMALL : 480,
  BU_WIDTH_MEDIUM: 1024,
});

// configuration
//-------------------------------------------------------------------
module.config(['$logProvider', 'bu.$settings',
  function($logProvider, $settings) {

    /* configure logging */
    $logProvider.debugEnabled($settings.BU_DEBUG);

    /* configure console debug/assert */
    if (!$settings.BU_DEBUG || !angular.isDefined(window.console)) {
      window.$console = {};
      window.$$console.assert = angular.noop;
      window.$console.log    = angular.noop;
    } else {
      window.$console = window.console;
    }
  }
]);