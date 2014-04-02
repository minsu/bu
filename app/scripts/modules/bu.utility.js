//-------------------------------------------------------------------
// service: bu.$utility
//-------------------------------------------------------------------
angular.module('bu')
.factory('bu.$utility', ['$log', '$rootScope',
  function($log, $rootScope) {
    var service = {};
    function createScopeObject(spec) {
      var result = {};
      result[spec.name + 'Options'] = '@';
      angular.forEach(spec.options, function(option) {
        result[name + option[0].toUpperCase() + option.slice(1)] = '@';
      });
      return result;
    }
    function createOptionObject(spec, attrs) {
      var result = {};
      var value;

      /* FIRST - defaults */
      if (angular.isDefined(spec.defaults)) {
        angular.extend(result, spec.defaults);
      }
      /* SECOND - options */
      if (angular.isDefined(attrs[spec.name + 'Options'])) {
        angular.extend(result,
          $rootScope.$eval(attrs[spec.name + 'Options']));
      }
      /* LAST - individual options */
      angular.forEach(spec.options, function(option) {
        value = attrs[spec.name + option[0].toUpperCase() + option.slice(1)];
        if (angular.isDefined(value)) result[option] = value;
      });
      return result;
    }
    service.createScopeObject  = createScopeObject;
    service.createOptionObject = createOptionObject;

    return service;
  }
]);
