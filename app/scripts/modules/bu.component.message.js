//-------------------------------------------------------------------
// bu: message (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buBox', [
  '$log', '$q', 'bu.$state',

  function($log, $q, $state) {
  	function linker(scope, element, attrs) {

  		function reposition() {
				element.css('top', ($state.ui.height - element.outerHeight()) / 2);
  		}

  		scope.$watch(function() {
  			return $state.ui.height;
  		}, function() {
  			reposition();
  		});
  		scope = angular.extend(scope, {
  			options: scope.$eval(attrs.buBox),
  		});
  	}
  	return {
			restrict   : 'AE',
			replace    : true,
			transclude : true,
			templateUrl: 'bu.component.box.html',
			link       : linker,
  	};
  }
]);

//-------------------------------------------------------------------
// bu: message (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buFlash', [
  '$log', '$q', 'bu.$state',

  function($log, $q, $state) {

    function linker(scope, element, attrs) {

    	scope.state  = 'inactive';
      scope.zindex = function() { return $state.ui.zindex.flash; }

      scope = angular.extend(scope, {
      	options: scope.$eval(attrs.buFlash),
        element: element,
        attrs  : attrs,
      });
      $state.register(scope);
    }

    return {
      restrict   : 'A',
      replace    : true,
      transclude : true,
      templateUrl: 'bu.component.flash.html',
      link       : linker,
    };
  }
]);
