//-------------------------------------------------------------------
// bu: $events (service)
//-------------------------------------------------------------------
angular.module('bu')
.value('bu.$events', {

	// UI //
	'BU_EVENT_UI:RESIZE'  : 'bu.event.ui:resize',
	'BU_EVENT_UI:READY'   : 'bu.event.ui:ready',

	// SCREEN //
	'BU_EVENT_SCREEN:ACTIVATE': 'bu.event.screen:activate',
	'BU_EVENT_SCREEN:READY'   : 'bu.event.screen:ready',
});
