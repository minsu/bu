//-------------------------------------------------------------------
// controller: bu.$controller
//-------------------------------------------------------------------
//   <div class="bu screens" ng-controller="bu.$controller">
//     <div class="bu screen" bu-screen><div>
//     <div class="bu screen" bu-screen></div>
//     <div class="bu screen" bu-screen></div>
//   </div>
//-------------------------------------------------------------------
angular.module('bu')
.controller('bu.$controller', [
	'$log', '$scope', 'bu.$state', 'bu.$settings',

	function($log, $scope, $state, $settings) {

		function register(spec) {
			$console.assert(spec.name);

			/* type check */
			if (angular.isDefined(spec.attrs.buScreen)) {
				$log.debug('[bu.$controller] registering a screen: ' + spec.name);
				$state.screens.push(spec);
			} else if (angular.isDefined(spec.attrs.buWindow)) {
				$log.debug('[bu.$controller] registering a window: ' + spec.name);
				$state.windows.push(spec);
			} else if (angular.isDefined(spec.attrs.buPanel)) {
				$log.debug('[bu.$controller] registering a penal: ' + spec.name);
				$state.panels.push(spec);
			}
		}
		$scope.bu = $state;
		$scope.register = register;

		/* DEBUG */
		if ($settings.BU_DEBUG) window.$bu = $state;

		$log.debug('[bu.$controller] created');
		return $scope;
	}
]);

