//-------------------------------------------------------------------
// bu: $events (service)
//-------------------------------------------------------------------
angular.module('bu')
.value('bu.$events', {
	BU_EVENT_RESIZE  : 'bu.event.resize',
	BU_EVENT_DOMREADY: 'bu.event.domready',
});
