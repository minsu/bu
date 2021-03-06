//-------------------------------------------------------------------
// bu: flex (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buFlex', [
	'$log', '$timeout', 'bu.$state', 'bu.$service',

	function($log, $timeout, $state, $bu) {
		function linker(scope, element, attrs) {

			function reposition() {
				var total = 0, count = 0;
				var elem, attr;
				var children = element.children();

				angular.forEach(children, function(child) {
					elem = angular.element(child);
					attr = elem.attr('bu-flex-element');
					if (attr === 'fixed' || attr === 'expand') {
						if (attrs.buFlex === 'row') {
							total = total + elem.outerWidth(true);
						} else if (attrs.buFlex === 'column') {
							total = total + elem.outerHeight(true);
						} else {
							$log.debug('[bu.flex] invalid direction: ' + direction);
							$log.debug(element);
							console.assert(false);
						}
					}
					if (attr === 'expand') {
						count = count + 1;
					}
				});

				angular.forEach(children, function(child) {
					elem = angular.element(child);
					attr = elem.attr('bu-flex-element');

					if (attr === 'remaining') {
						if (attrs.buFlex === 'row') {
							elem.width(element.width() - total);
						} else if (attrs.buFlex === 'column') {
							elem.height(element.height() - total);
						} else {
							console.assert(false);
						}
					} else if (attr === 'expand') {
						if (attrs.buFlex === 'row') {
							elem.width(elem.width() +	(element.width() - total) / count);
						} else if (attrs.buFlex === 'column') {
							elem.height(elem.height() +	(element.height() - total) / count);
						} else {
							console.assert(false);
						}
					}
				});
			}

			function resizeHandler(value, old) {
				$log.debug('[bu.flex] repositioning');
				$log.debug('[bu.flex] old: ' + old + ', new: ' + value);
				$log.debug(element);

				if (value && angular.isDefined(attrs.buFlexEvent)) {
					$timeout(function() {
						$bu.fire('bu.flex', attrs.buFlexEvent);
					});
				}
				value && reposition();
			}

			if (attrs.buFlex === 'row') {
				scope.$watch(function() {
					return element[0].offsetWidth;
				}, _.throttle(resizeHandler, 1000));
			} else if (attrs.buFlex === 'column') {
				scope.$watch(function() {
					return element[0].offsetHeight;
				}, _.throttle(resizeHandler, 1000));
			} else {
				console.assert(false);
			}
		}
		return {
			restrict: 'A',
			link    : linker,
		};
	}
]);
