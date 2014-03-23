//-------------------------------------------------------------------
// component: miscellaneous directives
//-------------------------------------------------------------------
var module = angular.module('bu')

module.directive('buBackground', ['$log', '$parse', 'bu.$service',
  function($log, $parse, $bu) {
    var DEFAULT_POSITION = 'center center';
    var DEFAULT_SIZE     = 'cover';

    return {
      restrict: 'A',
      link    : function(scope, element, attrs) {
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
    };
  }
]);


// directive: picture
//-------------------------------------------------------------------
module.directive('picture', [
  '$log', 'bu.$service',

  function($log, $e, $bu) {

    function compile(element, attrs) {
      var html_content = '<img src="' + attrs.src + '" />';
      var html_caption = (attrs.caption)?
        '<div class="caption">' + attrs.caption + '</div>' : ''
      element.html(html_content + html_caption);
    }

    function linker(scope, element, attrs) {

      scope.$watch(function() {
        return attrs.src;
      }, function(value) {
        $log.debug('bu.picture src: ' + value);
        $bu.load(value)
        .then(function() {
          compile(element, attrs);
        });
      });
    }

    return {
      restrict: 'C',
      link    : linker,
    };
  }
]);
