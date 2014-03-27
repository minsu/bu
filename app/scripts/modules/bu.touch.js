//-------------------------------------------------------------------
// bu: touch (directives)
//
// - adapted from: https://github.com/dreame4/angular-hammer
//-------------------------------------------------------------------
;(function() {
	_.forEach(['hold', 'tap', 'doubletap', 'drag', 'dragstart', 'dragend', 'dragup', 'dragdown', 'dragleft', 'dragright', 'swipe', 'swipeup', 'swipedown', 'swipeleft', 'swiperight', 'transform', 'transformstart', 'transformend', 'rotate', 'pinch', 'pinchin', 'pinchout', 'touch', 'release'], function(g) {

		var name = 'buTouch' + g[0].toUpperCase() + g.slice(1);

		angular.module('bu').directive(name, function() {
			return function(scope, element, attrs) {
				Hammer(element[0]).on(g, function(e) {
					scope.$eval(attrs[name]);
				});
			};
		});
	});
}());
