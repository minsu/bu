//-------------------------------------------------------------------
// bu: pages (directive)
//-------------------------------------------------------------------
angular.module('bu').directive('buPages', [
  '$log', '$q',
  'bu.$settings', 'bu.$service', 'bu.$state', 'bu.$events', 'bu.$keyboard',

  function($log, $q, $settings, $bu, $state, $e, $keyboard) {
    function controller($scope, $element) {
      $scope.pages = [];

      function register(spec) {
        if ($scope.pages.length === 0) {
          spec.position = 'middle';
          spec.state    = 'active';
        } else if ($scope.pages.length === 1) {
          spec.position = 'left';
          spec.state    = 'inactive';
        } else if ($scope.pages.length === 2) {
          spec.position = 'right';
          spec.state    = 'inactive';
        } else {
          console.assert(false);
        }
        $log.debug('[bu.pages] registering a page: ' + spec.state);
        $scope.pages.push(spec);
      }

      function flip(position) {
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
          var tempPage = getPage(opposite);
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
        return getReadyPage('left').then(function() {
          return flip('left');
        });
      }
      function nextPage() {
        $scope.state = 'inactive';
        return getReadyPage('right').then(function() {
          return flip('right');
        });
      }
      function getReadyPage(pos) {
        var page = getPage(pos);
        var to;

        page.state = 'ready';
        if (page.position === 'left') {
          to = (-1) * 0.5 * page.element.width();
        } else if (page.position === 'right') {
          to = $element.width() - 0.5 * page.element.width();
        }
        console.assert(page);
        return $bu.x(page.element, to, 0);
      }
      function getPage(pos) {
        return _.find($scope.pages, {position: pos});
      }
      function isFirstPage() { return false; }
      function isLastPage()  { return false; }

      $scope.state    = 'active';
      $scope.register = register;
      $scope.flip     = flip;
      $scope.prevPage = prevPage;
      $scope.nextPage = nextPage;
      $scope.isFirstPage = isFirstPage;
      $scope.isLastPage = isLastPage;
      $scope.getReadyPage = getReadyPage;
      $scope.getPage = getPage;

      $keyboard.register(angular.extend($scope, {
        keyboard: {
          left : prevPage,
          right: nextPage,
        },
      }));
      return $scope;
    }
    function linker(scope, element, attrs) {
    }
    return {
      restrict   : 'A',
      scope      : {},
      controller : controller,
      link       : linker,
    };
  }
]);
