//-------------------------------------------------------------------
// component: miscellaneous directives
//-------------------------------------------------------------------

angular.module('bu').directive('buBackground', [
  '$log', '$parse', 'bu.$service',

  function($log, $parse, $bu) {
    var DEFAULT_POSITION = 'center center';
    var DEFAULT_SIZE     = 'cover';

    function linker(scope, element, attrs) {
      var spec = scope.$eval(attrs.buBackground);

      $console.assert(angular.isDefined(spec.src));

      angular.isDefined(spec.position)?
        element.css('background-position', spec.position):
        element.css('background-position', DEFAULT_POSITION);
      angular.isDefined(spec.size)?
        element.css('background-size', spec.size):
        element.css('background-size', DEFAULT_SIZE);

      $bu.preload(spec.src)
      .then(function() {
        element.css('background-image', 'url(' + spec.src + ')');
      });
    }
    return {
      restrict: 'A',
      link    : linker,
    };
  }
]);