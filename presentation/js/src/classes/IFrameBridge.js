module.exports = (function(){

	//Extend the shared class
	var SharedIFrameBridge = require('shared/IFrameBridge');

	function IFrameBridge(data) {
		SharedIFrameBridge.call(this, data);
	}

	IFrameBridge.prototype = Object.create(SharedIFrameBridge.prototype);

	IFrameBridge.prototype.attachToIframe = function(iframe, src, cb) {
		this.iframe = iframe;
		$(iframe).off('dom-ready');
		$(iframe).attr('name', this.name);
		$(iframe).addClass('loading');
		$(iframe).removeClass('loaded');
		if(src !== $(iframe).attr('src')) {
			$(iframe).on('dom-ready', (function(event){
				iframe.openDevTools();
				$(iframe).removeClass('loading');
				$(iframe).addClass('loaded');
				this.tryToPostMessage({
					action: 'setState',
					state: this.state
				});
				cb();
			}).bind(this));
			$(iframe).attr('src', src);
		}
	};

	IFrameBridge.prototype.tryToPostMessage = function(message) {
		//we use IPC instead of postmessage in electron
		if(!this.iframe || !this.iframe.send || !$(this.iframe).hasClass('loaded'))
		{
			return;
		}
		this.iframe.send('message', message);
	};

	return IFrameBridge;
})();
