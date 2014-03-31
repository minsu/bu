//-------------------------------------------------------------------
// bu: bu.$actions (service)
//-------------------------------------------------------------------
angular.module('bu').factory('bu.$actions', [
	'$log', '$q', 'bu.$service', 'bu.$state',
	function($log, $q, $bu, $state) {
		var service = {};

		// USER ACTIONS //
		function activateScreen(name) {
			return $state.root.activate(name).then(function() {
				$state.screen = _.find($state.root.screens, {state: 'active'});
				return $q.when(true);
			});
		}
		function togglePanel(name, position) {
			var screen = _.find($state.root.screens, {options: {name: name}});
			console.assert(screen);
			$log.debug('[bu.$actions] togglePane(' + name + ')');
			return screen.togglePanel(position);
		}

		/* actions */
		service.activateScreen = activateScreen;
		service.togglePanel    = togglePanel;
		return service;
	}
])