//-------------------------------------------------------------------
// bu: distribute (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buDistribute', [
	'$log', 'bu.$service', '$timeout',

	function($log, $bu, $timeout) {

		function distribute(scope, element, attrs) {
			var length = 0, count = 0, vertical, value;

			if (attrs['bu-distribute'] == 'column') {
				vertical = true;
			} else {
				vertical = false;
			}
			angular.forEach(element.children(), function(child) {
				var elem = angular.element(child);
				if (elem.is('[bu-cell]')) {
					count = count + 1;
				} else {
					length = length + Math.ceil(
						vertical? elem[0].offsetHeight : elem[0].offsetWidth);
				}
			});

			count = count || 1;
			value = ((vertical? element.height() : element.width()) - length) / count;
			angular.forEach(element.children(), function(child) {
				var elem = angular.element(child);

				if (elem.is('[bu-cell]')) {
					vertical?	elem.css('height', value) : elem.css('width', value);
				}
			});

		}
		return {
			restrict: "A",
			scope   : {},
			link    : function(scope, element, attrs) {

				scope.$watch(function() {
					return element.width();
				}, function(value) {
					$log.debug('[bu.distribute] repositiong: ' + value);
					if (value > 0) {
						distribute(scope, element, attrs);
					}
				});
			},
		};
	}
]);