//-------------------------------------------------------------------
// bu: screens (directive)
//
// - The top container of BU framework. If only one screen is required
//   for the application, no need to create `screens`.
//-------------------------------------------------------------------
angular.module('bu').directive('buScreens', [
  '$log', '$timeout', '$q', 'bu.$service', 'bu.$settings', 'bu.$state',

  function($log, $timeout, $q, $bu, $settings, $state) {

  	function controller($scope, $element) {
  		var screens = [];

	    function getScreen(name) {
	      return _.find(screens, {options: {name: name}});
	    }
	    function registerScreen(spec) {
	    	if (!angular.isDefined(spec.options) ||
	    		  !angular.isDefined(spec.options.name)) {
	    		console.assert(false,
	    			'screen must have a name to be registed to screens');
	    	}
        $log.debug('[bu.screens] registering a screen: ' + spec.options.name);
        screens.push(spec);
	    }

	    function activate(name) {
	      var defer = $q.defer();
	      var from  = _.find(screens, {state: 'active'});
	      var to    = getScreen(name);

	      var direction = $settings.BU_SLIDE_DIRECTION;

	      $console.assert(to);
	      $log.debug('[bu.screens] activating ' + name);
	      if (from === to) {
	        $log.debug('[bu.screens] skipping activation');
	        defer.resolve();
	        return defer.promise;
	      }

	      if (angular.isDefined(from)) {
	        $log.debug('[bu.screens] screen change: ' +
	          from.options.name + ' => ' + to.options.name);

	        to.setState('ready');
	        $q.all([
	          from.getReadyDeactivate(direction),
	          to.getReadyActivate(direction)
	        ]).then(function() {
	          return $q.all([
	            from.deactivate(direction),
	            to.activate(direction),
	          ]);
	        }).then(function() {
	          to.setState('active');
	          from.setState('inactive');
	          defer.resolve();
	        });
	      } else {
	        $log.debug('[bu.$state] initial screen setup');

	        angular.forEach(screens, function(screen) {
	          if (screen.options.name === name) {
	          	screen.setState('active');
	          } else {
	          	screen.setState('inactive');
	          }
	        });
	        defer.resolve();
	      }
	      return defer.promise;
	    };

			$scope.screens        = screens;
			$scope.getScreen      = getScreen;
			$scope.activate       = activate;
			$scope.registerScreen = registerScreen;

	    return $scope;
  	}

  	function linker(scope, element, attrs) {
  		var spec;

      $timeout(function() {
        $bu.fire('bu.screens', 'BU_EVENT_UI:READY');
      });

      /* register as root element */
      spec = angular.extend(scope, {
      	options: scope.$eval(attrs.buScreens),
        element: element,
        attrs  : attrs,
      });
			$state.registerRoot(spec);
  	}

  	return {
			restrict   : 'A',
			controller : controller,
			link       : linker,
  	};
  }
]);
