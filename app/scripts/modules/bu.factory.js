//-------------------------------------------------------------------
// service: bu.$factory
//-------------------------------------------------------------------
angular.module('bu')
.factory('bu.$factory', ['$log', '$q', 'bu.$service', 'bu.$state',
  function($log, $q, $bu, $state) {
    var service = {};

    //---------------------------------------------------------------
    // panelControl
    //---------------------------------------------------------------
    function panelControl(owner, panels, config) {
      var obj;
      var owner = owner, panels = panels, config = config;

      console.assert(owner && panels.length > 0 && config);
      function get(pos) {
        return _.find(panels, {position: pos});
      }
      function state(pos) {
        var panel = get(pos);
        console.assert(panel);
        return panel.state;
      }
      function width(pos) {
        var panel = get(pos);
        if (angular.isDefined(panel)) {
          return panel.element.width();
        } else {
          $log.error('[bu.$factory:panelControl] no matching panel found: ' + pos);
          return 0;
        }
      }
      function revert() {
        var bucket = [];
        if (config[$state.getSize()] === 'none') {
          angular.forEach(panels, function(panel) {
            if (panel.state === 'active') {
              bucket.push(close(panel.position));
            }
          });
        }
        $state.state.panel = false;
        return $q.all(bucket);
      }
      function open(pos, speed) {
        var offset;
        var panel = get(pos);
        var opposite = (pos === 'left')? 'right' : 'left';
        var other = get(opposite);

        // trivial cases //
        console.assert(pos === 'left' || pos === 'right');
        if (!angular.isDefined(panel)) {
          $log.debug('[bu.$factory:panelControl] no panel found: ' + pos);
          return $q.when(true);
        }
        if (panel.state !== 'inactive') {
          $log.debug('[bu.$factory:panelControl] no need to open: ' + pos + '(' + panel.state + ')');
          return $q.when(true);
        }

        switch (config[$state.getSize()]) {
        case 'both':
          console.assert(false); /* handled above as a trivial case */

        case 'left': case 'right':
          console.assert(angular.isDefined(opposite));
          console.assert(opposite.state === 'active');

          return $q.all([
            panel.getReadyActivate(),
            other.getReadyDeactivate(),
          ])
          .then(function() {
            if (pos === 'left') {
              offset = width('left');
            } else if (pos === 'right') {
              offset = 0;
            } else { console.assert(false); }

            return $q.all([
              $bu.x(owner.element, offset, speed),
              panel.activate(speed),
              other.deactivate(speed),
            ]);
          })
          .then(function() {
            panel.setState('active');
            other.setState('inactive');
            return $q.when(true);
          });
          console.assert(false);
        case 'none':
          if (other && other.state === 'active') {
            return close(opposite, speed);
          }

          return panel.getReadyActivate()
          .then(function() {
            if (pos === 'left') {
              offset = width('left');
            } else if (pos === 'right') {
              offset = (-1) * width('right');
            }
            $log.debug('owner.element');
            $log.debug(owner.element[0]);
            return $q.all([
              $bu.x(owner.element, offset, speed),
              panel.activate(speed),
            ]);
          })
          .then(function() {
            panel.setState('active');
            $state.state.panel = true; /* closeable panel is active */
            return $q.when(true);
          });
          console.assert(false);
        default:
          console.assert(false);
        }
      }
      function close(pos, speed) {
        var offset;
        var panel = get(pos);
        var opposite = (pos === 'left')? 'right' : 'left';
        var other = get(opposite);

        // trivial cases //
        console.assert(pos === 'left' || pos === 'right');
        if (!angular.isDefined(panel)) {
          $log.debug('[bu.$factory:panelControl] no panel found: ' + position);
          return $q.when(true);
        }
        if (panel.state !== 'active') {
          $log.debug('[bu.$factory:panelControl] no need to close: ' + position + '(' + panel.state + ')');
          return $q.when(true);
        }

        switch (config[$state.getSize()]) {
        case 'both':
          console.assert(false); /* handled above as a trivial case */

        case 'left': case 'right':
          console.assert(angular.isDefined(opposite));
          return $q.all([
            panel.getReadyDeactivate(),
            other.getReadyActivate(),
          ])
          .then(function() {
            if (pos === 'left') {
              offset = 0;
            } else if (pos === 'right') {
              offset = width('left');
            }
            return $q.all([
              $bu.x(owner.element, offset),
              panel.deactivate(speed),
              other.activate(speed),
            ]);
          })
          .then(function() {
            other.setState('active');
            panel.setState('inactive');
            return $q.when(true);
          });
        case 'none':
          return panel.getReadyDeactivate()
          .then(function() {
            return $q.all([
              $bu.x(owner.element, 0),
              panel.deactivate(speed),
            ]);
          })
          .then(function() {
            panel.setState('inactive');
            $state.state.panel = false; /* no closeable panel */
            return $q.when(true);
          });
        default:
          console.assert(false);
        }
      }
      function toggle(pos) {
        var panel = get(pos);
        console.assert(panel);
        if (panel.state === 'active') {
          return close(pos);
        } else if (panel.state === 'inactive') {
          return open(pos);
        } else {
          $log.debug('[bu.$factory:controlPanel] ineffective toggle: ' + panel.state);
        }
      }
      function reset() {
        $log.debug('[bu.$factory:panelControl] reset positions');
        switch (config[$state.getSize()]) {
        case 'both':
          console.assert(angular.isDefined(get('left')));
          console.assert(angular.isDefined(get('right')));
          get('left').setState('enabled');
          get('right').setState('enabled');

          owner.element.width(owner.element.parent().width() -
            (width('left') + width('right')));
          return $q.all([
            $bu.x(get('left').element, 0, 0),
            $bu.x(get('right').element, owner.element.parent().width() - width('right'), 0),
            $bu.x(owner.element, width('left'), 0),
          ]);
        case 'left':
          console.assert(angular.isDefined(get('left')));
          if (angular.isDefined(get('right'))) {
            get('left').setState('active');
            get('right').setState('inactive');
          } else {
            get('left').setState('enabled');
          }
          owner.element.width(owner.element.parent().width() - width('left'));
          return $q.all([
            $bu.x(get('left').element, 0, 0),
            $bu.x(owner.element, width('left'), 0),
            ]);
        case 'right':
          if (angular.isDefined(get('left'))) {
            get('right').setState('active');
            get('left').setState('inactive');
          } else {
            get('right').setState('enabled');
          }
          owner.element.width(owner.element.parent().width() - width('right'));
          return $q.all([
            $bu.x(get('right').element, owner.element.parent().width() - width('right'), 0),
            $bu.x(owner.element, 0, 0),
          ]);
        case 'none':
          angular.forEach(panels, function(panel) {
            panel.setState('inactive');
          });
          owner.element.width(owner.element.parent().width());
          return $bu.x(owner.element, 0, 0);
        default:
          console.assert(false);
        }
      }

      // INTERFACES //
      obj = {
        reset : reset,
        revert: revert,
        open  : open,
        close : close,
        toggle: toggle,
      }
      return obj;
    }
    //---------------------------------------------------------------

    service.panelControl = panelControl;
    return service;
  }
]);
