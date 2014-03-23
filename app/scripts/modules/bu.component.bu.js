//-------------------------------------------------------------------
// bu component: bu
//-------------------------------------------------------------------
angular.module('bu')
.directive('bu', ['$log', 'bu.$service',
  function($log, $bu) {

    var DEFAULT_BG_SIZE     = 'cover';
    var DEFAULT_BG_POSITION = 'center center';

    function linker(scope, element, attrs) {

      // common styles //
      if (angular.isDefined(attrs.bgColor)) {
        element.css('background-color', attrs.bgColor);
      }
      if (angular.isDefined(attrs.zindex)) {
        element.css('z-index', parseInt(attrs.zindex));
      }
      if (angular.isDefined(attrs.width)) {
        element.css('width', attrs.width);
      }
      if (angular.isDefined(attrs.x)) {
        $bu.x(element, attrs.x, 0);
      }

      // background image //
      if (angular.isDefined(attrs.bgSrc)) {
        var src = attrs.bgSrc;

        angular.forEach({
          'background-repeat': 'no-repeat',
          'background-size': attrs.bgSize || DEFAULT_BG_SIZE,
          'background-position': attrs.bgPosition || DEFAULT_BG_POSITION,
        }, function(value, key) {
          element.css(key, value);
        });
        $bu.preload(src)
        .then(function() {
          element.css('background-image', 'url(' + src + ')');
        });
      }
    }
    return {
      restrict: 'C',
      link    : linker,
    };
  }
])
