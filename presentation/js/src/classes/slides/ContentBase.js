module.exports = (function(){

	var SharedContentBase = require('shared/ContentBase');

	function ContentBase($slideHolder) {
		this.$slideHolder = $slideHolder;
		this.src = $slideHolder.attr('data-src');
		SharedContentBase.call(this, $slideHolder.attr('data-name'));
	}

	ContentBase.prototype = Object.create(SharedContentBase.prototype);

	ContentBase.prototype.startListeningForMessages = function() {
		//we work with jquery events to message to / from DOM nodes
		this._slideHolderMessageToSlildeHandler = this.slideHolderMessageToSlildeHandler.bind(this);
		this.$slideHolder.on('message-to-slide', this._slideHolderMessageToSlildeHandler);
	};

	ContentBase.prototype.stopListeningForMessages = function() {
		this.$slideHolder.off('message-to-slide', this._slideHolderMessageToSlildeHandler);
	};

	ContentBase.prototype.slideHolderMessageToSlildeHandler = function(event, message) {
		this.receiveMessage({data: message});
	};

	ContentBase.prototype.postMessage = function(data) {
		this.$slideHolder.trigger('message-from-slide', data);
	};

	return ContentBase;

})();
