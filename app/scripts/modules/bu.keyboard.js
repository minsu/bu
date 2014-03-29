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
      $log.debug('[bu.$keyboard] subscribing to keyboard');
      $log.debug(spec);
      console.assert(angular.isDefined(spec.keyboard))
      subscribers.push(spec);
    }
    function broadcast(e) {
      $log.debug('[bu.$keyboard] keyup: ' + keys[e.keyCode]);
      angular.forEach(subscribers, function(subscriber) {
        if (subscriber.state === 'active') {
          return handler(subscriber, e);
        }
      })
    }
    function handler(subscriber, e) {
      console.assert(subscriber.keyboard)

      switch(e.keyCode) {
      case 33: case 37: case 38:
        return subscriber.keyboard.left();

      case 34: case 39: case 40:
        return subscriber.keyboard.right();
      }
    };
    angular.element($document).bind("keyup", function(e) {
      return broadcast(e);
    });

    service.subscribe = subscribe;
    return service;
  }
]);
