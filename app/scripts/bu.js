//-------------------------------------------------------------------
// bu: bu (module)
//-------------------------------------------------------------------
var module = angular.module('bu', [])

// $settings
//-------------------------------------------------------------------
module.constant('bu.$settings', {
  BU_DEBUG          : true,
  BU_SLIDE_SPEED    : 350,      // ms
  BU_SLIDE_DIRECTION: 'right',

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