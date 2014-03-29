//-------------------------------------------------------------------
// bu: touch (directives)
//
// - adapted from: https://github.com/dreame4/angular-hammer
//-------------------------------------------------------------------
;(function() {
	_.forEach(['hold', 'tap', 'doubletap', 'drag', 'dragstart', 'dragend', 'dragup', 'dragdown', 'dragleft', 'dragright', 'swipe', 'swipeup', 'swipedown', 'swipeleft', 'swiperight', 'transform', 'transformstart', 'transformend', 'rotate', 'pinch', 'pinchin', 'pinchout', 'touch', 'release'], function(g) {

		var name = 'buTouch' + g[0].toUpperCase() + g.slice(1);

		angular.module('bu').directive(name, ['$log', '$parse',
			function($log, $parse) {
				return function(scope, element, attrs) {
					var options = scope.$eval(attrs.buTouchOptions);
					scope = angular.extend(scope, {
						element: element,
						attrs  : attrs,
					});

					/* register event */
					Hammer(element[0], options).on(g, function(e) {
						return scope.$apply(function() {
							var result = scope.$eval(attrs[name]);
							if (result && angular.isDefined(result.callback)) {
								return result.callback(e, scope);
							} else {
								return result;
							}
						});
					});
				};
			}
		]);

	});
}());
