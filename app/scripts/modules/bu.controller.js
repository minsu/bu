//-------------------------------------------------------------------
// controller: bu.$controller
//-------------------------------------------------------------------
angular.module('bu')
.controller('bu.$controller', [
	'$log', '$scope', 'bu.$state', 'bu.$settings', 'bu.$actions',

	function($log, $scope, $state, $settings, $actions) {

		$scope.actions = $actions;
		$log.debug('[bu.$controller] initialized');
		return $scope;
	}
]);

