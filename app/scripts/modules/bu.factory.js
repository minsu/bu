//-------------------------------------------------------------------
// service: bu.$factory
//-------------------------------------------------------------------
angular.module('bu')
.factory('bu.$factory', ['$log', '$q', 'bu.$service', 'bu.$state',
  function($log, $q, $bu, $state) {
    var service = {};

    //---------------------------------------------------------------
    // PanelControl
    //---------------------------------------------------------------
    function PanelControl() {
      var self = this;

      this.panels = undefined;
      this.pages  = undefined;
      this.config = undefined;

      function init(pages, panels, config) {
        self.panels = panels;
        self.pages  = pages;
        self.config = config;
      }
      function get(pos) {
        return _.find(self.panels, {position: pos});
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
          $log.error('[bu.$factory:PanelControl] no matching panel found: ' + pos);
          return 0;
        }
      }
      function revert() {
        var bucket = [];
        if (self.config[$state.getSize()] === 'none') {
          angular.forEach(self.panels, function(panel) {
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
          $log.debug('[bu.$factory:PanelControl] no panel found: ' + pos);
          return $q.when(true);
        }
        if (panel.state !== 'inactive') {
          $log.debug('[bu.$factory:PanelControl] no need to open: ' + pos + '(' + panel.state + ')');
          return $q.when(true);
        }

        switch (self.config[$state.getSize()]) {
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
              $bu.x(self.pages.element, offset, speed),
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
            $log.debug('self.pages.element');
            $log.debug(self.pages.element[0]);
            return $q.all([
              $bu.x(self.pages.element, offset, speed),
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
          $log.debug('[bu.$factory:PanelControl] no panel found: ' + position);
          return $q.when(true);
        }
        if (panel.state !== 'active') {
          $log.debug('[bu.$factory:PanelControl] no need to close: ' + position + '(' + panel.state + ')');
          return $q.when(true);
        }

        switch (self.config[$state.getSize()]) {
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
              $bu.x(self.pages.element, offset),
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
              $bu.x(self.pages.element, 0),
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
          console.assert(false);
        }
      }
      function reset() {
        $log.debug('[bu.$factory:PanelControl] reset positions');
        switch (self.config[$state.getSize()]) {
        case 'both':
          console.assert(angular.isDefined(get('left')));
          console.assert(angular.isDefined(get('right')));
          get('left').setState('enabled');
          get('right').setState('enabled');

          self.pages.element.width(self.pages.element.parent().width() -
            (width('left') + width('right')));
          return $q.all([
            $bu.x(get('left').element, 0, 0),
            $bu.x(get('right').element, self.pages.element.parent().width() - width('right'), 0),
            $bu.x(self.pages.element, width('left'), 0),
          ]);
        case 'left':
          console.assert(angular.isDefined(get('left')));
          if (angular.isDefined(get('right'))) {
            get('left').setState('active');
            get('right').setState('inactive');
          } else {
            get('left').setState('enabled');
          }
          self.pages.element.width(self.pages.element.parent().width() - width('left'));
          return $q.all([
            $bu.x(get('left').element, 0, 0),
            $bu.x(self.pages.element, width('left'), 0),
            ]);
        case 'right':
          if (angular.isDefined(get('left'))) {
            get('right').setState('active');
            get('left').setState('inactive');
          } else {
            get('right').setState('enabled');
          }
          self.pages.element.width(self.pages.element.parent().width() - width('right'));
          return $q.all([
            $bu.x(get('right').element, self.pages.element.parent().width() - width('right'), 0),
            $bu.x(self.pages.element, 0, 0),
          ]);
        case 'none':
          angular.forEach(self.panels, function(panel) {
            panel.setState('inactive');
          });
          self.pages.element.width(self.pages.element.parent().width());
          return $bu.x(self.pages.element, 0, 0);
        default:
          console.assert(false);
        }
      }

      // INTERFACES //
      this.init   = init;
      this.reset  = reset;
      this.revert = revert;
      this.open   = open;
      this.close  = close;
      this.toggle = toggle;

      return this;
    }
    //---------------------------------------------------------------

    service.PanelControl = PanelControl;
    return service;
  }
]);
