//-------------------------------------------------------------------
// bu: pages (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buPages', [
  '$log', '$q',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events',

  function($log, $q, $settings, $bu, $state, $e) {
    function controller($scope, $element) {
      var pages = [];

      function registerPage(spec) {
        if (pages.length === 0) {
          spec.position = 'middle';
          spec.state    = 'active';
        } else if (pages.length === 1) {
          spec.position = 'left';
          spec.state    = 'inactive';
        } else if (pages.length === 2) {
          spec.position = 'right';
          spec.state    = 'inactive';
        } else {
          console.assert(false);
        }
        $log.debug('[bu.pages] registering a page: ' + spec.state);
        pages.push(spec);
      }

      function activate(position) {
        var bucket = [];
        bucket.push($bu.x(getPage('middle').element,
          position === 'left'?
          $element.width() : (-1) * $element.width())
        );
        bucket.push($bu.x(getPage(position).element, 0, $settings.BU_SLIDE_SPEED * 0.95));

        $scope.state = 'inactive';
        return $q.all(bucket).then(function() {
          var opposite;
          var tempPage;

          if (position === 'left') {
            opposite = 'right';
          } else if (position === 'right') {
            opposite = 'left';
          }
          tempPage = getPage(opposite);
          getPage('middle').position = opposite;
          getPage(position).position = 'middle';
          tempPage.position = position;

          // state //
          getPage('middle').state = 'active';
          getPage(position).state = 'inactive';
          getPage(opposite).state = 'inactive';

          $scope.state = 'active';
          return $q.when(true);
        });
      }
      function prevPage() {
        if (pages.length !== 3) return $q.when(true);
        return getReadyPage('left').then(function() {
          return activate('left');
        });
      }
      function nextPage() {
        if (pages.length !== 3) return $q.when(true);
        return getReadyPage('right').then(function() {
          return activate('right');
        });
      }
      function getReadyPage(pos) {
        var page = getPage(pos);
        var to;

        console.assert(page);
        page.state = 'ready';
        if (page.position === 'left') {
          to = (-1) * 0.5 * $element.width();
        } else if (page.position === 'right') {
          to = $element.width() - 0.5 * $element.width();
        } else {
          console.assert(false);
        }
        return $bu.x(page.element, to, 0);
      }
      function getPage(pos) {
        return _.find(pages, {position: pos});
      }
      function isFirstPage() {
        if (pages.length !== 3) return true;
        return false;
      }
      function isLastPage()  {
        if (pages.length !== 3) return true;
        return false;
      }

      $scope.state    = 'enabled';
      $scope.pages    = pages;
      $scope.registerPage = registerPage;
      $scope.activate = activate;
      $scope.prevPage = prevPage;
      $scope.nextPage = nextPage;
      $scope.getPage  = getPage;

      $scope.isFirstPage  = isFirstPage;
      $scope.isLastPage   = isLastPage;
      $scope.getReadyPage = getReadyPage;

      return $scope;
    }
    function linker(scope, element, attrs, ctrl) {
      spec = angular.extend(scope, {
        options : scope.$eval(attrs.buPages),
        element : element,
        attrs   : attrs,
      });

      if (scope.pages.length == 3) {
        spec = angular.extend(spec, {
          keyboard: {
            left : scope.prevPage,
            right: scope.nextPage,
          }
        })
      }
      ctrl.registerPages(spec);
    }

    return {
      restrict   : 'A',
      require    : '^buWindow',
      controller : controller,
      link       : linker,
    };
  }
]);
