//-------------------------------------------------------------------
// service: bu.$keyboard
//-------------------------------------------------------------------
angular.module('bu').factory('bu.$keyboard', [
  '$log', '$document',

  function($log, $document){
    var subscribers = [];
    var keys = {
      33: 'PAGE-UP',
      34: 'PAGE-DOWN',
      37: 'LEFT-ARROW',
      38: 'UP-ARROW',
      39: 'RIGHT-ARROW',
      40: 'DOWN-ARROW',
    };
    var service = {};

    function subscribe(spec) {
      $log.debug('[bu.$keyboard] subscribing');
      $log.debug(spec);
      subscribers.push(spec);
    }
    function unsubscribe(spec) {
      var index = _.indexOf(subscribers, spec);

      $log.debug('[bu.$keyboard] unsubscribing service');
      if (index > -1) {
        subscribers.splice(index, 1);
      } else {
        $log.debug('[bu.$keyboard] unsubscribing non-existing handler');
      }

    }
    function broadcast(e) {
      $log.debug('[bu.$keyboard] keyup: ' + keys[e.keyCode]);
      angular.forEach(subscribers, function(subscriber) {
        return handler(subscriber, e);
      })
    }
    function handler(subscriber, e) {
      switch(e.keyCode) {
      case 33: case 37: case 38:
        return subscriber.left();

      case 34: case 39: case 40:
        return subscriber.right();
      }
    };
    angular.element($document).bind("keyup", function(e) {
      return broadcast(e);
    });

    service.subscribe = subscribe;
    service.unsubscribe = unsubscribe;
    return service;
  }
]);
