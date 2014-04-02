//-------------------------------------------------------------------
// component: miscellaneous directives
//-------------------------------------------------------------------

angular.module('bu').directive('buWidth', ['$log',
  function($log) {
    function linker(scope, element, attrs) {
      element.css('width', attrs.buWidth);
    }
    return {
      restrict: 'A',
      priority: 1000,
      link    : linker,
    };
  }
]);
angular.module('bu').directive('buHeight', ['$log',
  function($log) {
    function linker(scope, element, attrs) {
      element.css('height', attrs.buHeight);
    }
    return {
      restrict: 'A',
      priority: 1000,
      link    : linker,
    };
  }
]);

angular.module('bu').directive('buBackground', [
  '$log', '$parse', 'bu.$service',

  function($log, $parse, $bu) {
    var DEFAULT_POSITION = 'center center';
    var DEFAULT_SIZE     = 'cover';

    function linker(scope, element, attrs) {
      var src = attrs.buBackground;
      var position = DEFAULT_POSITION;
      var size = DEFAULT_SIZE;

      if (angular.isDefined(attrs.buBackgroundOptions)) {
        options = scope.$eval(attrs.buBackgroundOptions);
        if (angular.isDefined(options.position)) {
          position = options.position;
        }
        if (angular.isDefined(options.size)) {
          size = options.size;
        }
      }

      element.css('background-position', DEFAULT_POSITION);
      element.css('background-size', DEFAULT_SIZE);

      $bu.preload(src)
      .then(function() {
        element.css('background-image', 'url(' + src + ')');
      });
    }
    return {
      restrict: 'A',
      priority: -1000,
      link    : linker,
    };
  }
]);

angular.module('bu').directive('buPicture', [
  '$log', '$timeout', 'bu.$service', 'bu.$state',

  function($log, $timeout, $bu, $state) {
    function linker(scope, element, attrs) {

      function handleTransform(e) {
        e.gesture.preventDefault(); // disable browser scrolling
        switch (e.type) {
        case 'transformstart':
        case 'transform':
        case 'transformend':
        default:
          console.assert(false);
        }
      }
      function reposition(dimension) {
        /* set size */
        var w, h, iw, ih, lm, tm, width, height, ratio = 1;
        w = element.parent().width();
        h = element.parent().height();

        /* sanity check */
        console.assert(w);
        console.assert(h);

        iw = dimension.width;
        ih = dimension.height;

        if (iw > w) {
          ratio = w / iw;
          height = ih * ratio;
          if (height > h) {
            ratio = ratio * (h / height);
          }
        } else if (ih > h) {
          ratio = h / ih;
        }
        width = iw * ratio;
        height = ih * ratio;
        element.find('img').css({
          width: width + 'px',
          height: height + 'px'
        });
        element.find('img').css('height', height);

        /* set position */
        lm = (w - width) / 2;
        tm = (h - height) / 2;
        element.find('img').css({
          marginLeft: lm + 'px',
          marginTop: tm + 'px',
        });
        scope.src = attrs.buPicture;
      }

      $bu.preload(attrs.buPicture)
      .then(function(dimension) {
        scope.$watch(function() {
          return element.width();
        }, function(value) {
          value && reposition(dimension);
        })
      });

      /* touch pinch zoom */
      Hammer(element.find('img')[0]).on(
        "transformstart transform transformend",
        handleTransform
      );
    }
    return {
      restrict   : 'A',
      scope      : {},
      link       : linker,
      templateUrl: 'bu.component.picture.html',
      replace    : true,
      transclude : false,
    };
  }
]);