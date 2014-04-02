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
      scope   : false,
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
      scope   : false,
      priority: 1000,
      link    : linker,
    };
  }
]);

angular.module('bu').directive('buBackground', [
  '$log', '$parse', 'bu.$service', 'bu.$utility',

  function($log, $parse, $bu, $utility) {
    var SPEC = {
      name    : 'buBackground',
      options : ['size', 'position', 'repeat'],
      defaults: {
        size    : 'cover',
        position: 'center center',
        repeat  : 'no-repeat',
      },
    }

    function linker(scope, element, attrs) {
      scope.options = $utility.createOptionObject(SPEC, attrs);
      $log.debug('[@bu.background] options');
      $log.debug(scope.options);

      $bu.preload(attrs.buBackground)
      .then(function() {
        element.css({
          backgroundPosition: scope.options.position,
          backgroundSize: scope.options.size,
          backgroundRepeat: scope.options.repeat,
          backgroundImage: 'url(' + attrs.buBackground + ')',
        });
      });
    }
    return {
      restrict: 'A',
      scope   : false,
      link    : linker,
    };
  }
]);

angular.module('bu').directive('buPicture', [
  '$log', '$timeout', 'bu.$service', 'bu.$state', 'bu.$utility',

  function($log, $timeout, $bu, $state, $utility) {

    var SPEC = {
      name    : 'buPicture',
      options : ['size'],
      defaults: {
        size: 'contain'
      },
    };

    function linker(scope, element, attrs) {

      function reposition(dimension, size) {
        var size = size || 'contain';
        var w, h, iw, ih, lm, tm, width, height, ratio = 1;
        w = element.parent().width();
        h = element.parent().height();

        /* sanity check */
        console.assert(w);
        console.assert(h);

        iw = dimension.width;
        ih = dimension.height;

        if (size === 'contain') {
          if (iw > w) {
            ratio = w / iw;
            height = ih * ratio;
            if (height > h) {
              ratio = ratio * (h / height);
            }
          } else if (ih > h) {
            ratio = h / ih;
          }
        } else if (size === 'cover') {
          wratio = w / iw;
          hratio = h / ih;

          if (wratio > 1.0 && hratio > 1.0) {
            ratio = 1.0;
          } else {
            ratio = Math.max(wratio, hratio)
          }
        }

        width = iw * ratio;
        height = ih * ratio;
        element.find('img').css({
          width : width + 'px',
          height: height + 'px'
        });
        element.find('img').css('height', height);

        /* set position */
        lm = (w - width) / 2;
        tm = (h - height) / 2;
        element.find('img').css({
          marginLeft: lm + 'px',
          marginTop : tm + 'px',
        });
        scope.src = attrs.buPicture;
      }

      scope.options = $utility.createOptionObject(SPEC, attrs);
      $log.debug('[@bu.picture] options');
      $log.debug(scope.options);

      $bu.preload(attrs.buPicture)
      .then(function(dimension) {
        scope.$watch(function() {
          return element.width();
        }, function(value) {
          value && reposition(dimension, scope.options.size);
        })
      });
    }
    return {
      restrict   : 'A',
      scope      : $utility.createScopeObject(SPEC),
      link       : linker,
      templateUrl: 'bu.component.picture.html',
      replace    : true,
      transclude : false,
    };
  }
]);