//-------------------------------------------------------------------
// bu: screens (directive)
//
// - The top container of BU framework. If only one screen is required
//   for the application, no need to create `screens`.
//-------------------------------------------------------------------
angular.module('bu').directive('buScreens', [
  '$log', '$timeout', '$q',
  'bu.$service', 'bu.$settings', 'bu.$state', 'bu.$utility',

  function($log, $timeout, $q, $bu, $settings, $state, $utility) {

  	var SPEC = {
			name    : 'buScreens',
			options : [],
			defaults: {},
  	};

  	function controller($scope, $element) {
  		var screens = [];

	    function registerScreen(spec) {
	    	if (!angular.isDefined(spec.name)) {
	    		console.assert(false,
	    			'screen must have a name to be registed to screens');
	    	}
        $log.debug('[bu.screens] registering a screen: ' + spec.name);
        screens.push(spec);
        $log.debug('[bu.screens] total screens: ' + screens.length);
	    }

			$scope.screens = screens;
			$scope.registerScreen = registerScreen;

	    return $scope;
  	}

  	function linker(scope, element, attrs) {
	    function getScreen(name) {
	      return _.find(scope.screens, {name: name});
	    }
	    function activate(name) {
	      var defer = $q.defer();
	      var from  = _.find(scope.screens, {state: 'active'});
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
	          from.name + ' => ' + to.name);

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

	        angular.forEach(scope.screens, function(screen) {
	          if (screen.name === name) {
	          	screen.setState('active');
	          } else {
	          	screen.setState('inactive');
	          }
	        });
	        defer.resolve();
	      }
	      return defer.promise;
	    };

			scope.options   = $utility.createOptionObject(SPEC, attrs);
			scope.getScreen = getScreen;
			scope.activate  = activate;

      $timeout(function() {
        $bu.fire('bu.screens', 'BU_EVENT_UI:READY');
      });

      /* register as root element */
      angular.extend(scope, {
        element: element,
        attrs  : attrs,
      });
			$state.registerRoot(scope);
  	}

  	return {
			restrict  : 'A',
			link      : linker,
			controller: controller,
  	};
  }
]);
