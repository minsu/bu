//-------------------------------------------------------------------
// module: app
//-------------------------------------------------------------------

angular.module('app', ['bu'])

// settings
//-------------------------------------------------------------------
.constant('app.$settings', {
	'HTML5_MODE': true,
	'DEBUG'     : true,
})

// config
//-------------------------------------------------------------------
.config([
	'$locationProvider', '$logProvider', 'app.$settings',

	function($locationProvider, $logProvider, $settings) {

		/* application setup */
		$locationProvider.html5Mode($settings.HTML5_MODE);
		$logProvider.debugEnabled($settings.DEBUG);

		if (!$settings.DEBUG || !angular.isDefined(window.console)) {
			window.console = {};
			window.$console.assert = angular.noop;
			window.console.log    = angular.noop;
		}
	}
])

// MainController
//-------------------------------------------------------------------
.controller('app.$controller', [
	'$log', '$scope',

	function($log, $scope) {
		$log.debug('[app] MainController');
	}
])

.run(['bu.$state', 'bu.$service',
	function($state, $bu) {
		$bu.wait('app', 'BU_EVENT_UI:READY', function() {
			$bu.fire('bu.$state', 'BU_EVENT_SCREEN:ACTIVATE', 'home');
		});
	}
])

// BOOTSTRAP
//-------------------------------------------------------------------
angular.element(document).ready(function() {
	angular.bootstrap(document, ['app']);
});
