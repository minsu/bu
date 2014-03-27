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

		$scope.bu = $state;

		/* DEBUG */
		if ($settings.BU_DEBUG) {
			window.$bu    = $state;
			window.$apply = function() {
				_.defer(function(){ $scope.$apply();});
			};
		}

		$log.debug('[bu.$controller] created');
		return $scope;
	}
]);

