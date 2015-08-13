module.exports = (function(){

	var SharedContentBase = require('shared/ContentBase');
	var Constants = require('Constants');

	var KEYCODE_LEFT = 37;
	var KEYCODE_RIGHT = 39;

	function ContentBase($slideHolder) {
		this.$slideHolder = $slideHolder;
		this.src = $slideHolder.attr('data-src');
		SharedContentBase.call(this, $slideHolder.attr('data-name'));
		/*
		this.slideControlEnabled = true;
		$(window).on('keydown', this.keydownHandler.bind(this));
		*/
	}

	ContentBase.prototype = Object.create(SharedContentBase.prototype);

	ContentBase.prototype.startListeningForMessages = function() {
		//we work with jquery events to message to / from DOM nodes
		this.$slideHolder.on('message-to-slide', (function(event, message){
			//wrap in message
			this.receiveMessage({data: message});
		}).bind(this));
	};

	ContentBase.prototype.postMessage = function(data) {
		this.$slideHolder.trigger('message-from-slide', data);
	};

	ContentBase.prototype.keydownHandler = function(event) {
		if(this.slideControlEnabled) {
			switch(event.keyCode) {
				case KEYCODE_LEFT:
					this.postMessage({action: Constants.GO_TO_PREVIOUS_SLIDE});
					break;
				case KEYCODE_RIGHT:
					this.postMessage({action: Constants.GO_TO_NEXT_SLIDE});
					break;
			}
		}
	};

	return ContentBase;

})();
