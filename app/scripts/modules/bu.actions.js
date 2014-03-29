//-------------------------------------------------------------------
// bu: bu.$actions (service)
//-------------------------------------------------------------------
angular.module('bu').factory('bu.$actions', [
	'$log', 'bu.$service',
	function($log, $bu) {
		var service = {};

		// USER ACTIONS //
		function activateScreen(name) {
			return $bu.fire('user.$actions', 'BU_EVENT_SCREEN:ACTIVATE', name);
		}

		service.activateScreen = activateScreen;
		return service;
	}
])