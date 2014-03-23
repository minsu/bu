//-------------------------------------------------------------------
// bu: condense (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buCondense', ['$log',
	function($log) {
		return {
			restrict: 'A',
			priority: 2000,
			link    : function(scope, element, attrs) {
				/* remove white space */
				element.contents().filter(function() {
					return this.nodeType === 3;
				}).remove();
			}
		}
	}
]);
