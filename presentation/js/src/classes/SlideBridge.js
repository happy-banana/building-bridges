module.exports = (function(){

	//Extend the shared class
	var SharedSlideBridge = require('shared/SlideBridge');

	function SlideBridge(data) {
		SharedSlideBridge.call(this, data);
	}

	SlideBridge.prototype = Object.create(SharedSlideBridge.prototype);

	SlideBridge.prototype.attachToSlideHolder = function(slideHolder, src, cb) {
		this.slideHolder = slideHolder;
		//clear the current content
		this.slideHolder.innerHTML = '';
		$(slideHolder).off('load');
		$(slideHolder).attr('data-name', this.name);
		$(slideHolder).addClass('loading');
		if(src !== $(slideHolder).attr('data-src')) {
			//create html import
			var $importEl = $('<link rel="import">');
			var importEl = $importEl[0];
			$importEl.on('load', (function(){
				var template = importEl.import.querySelector('template');
				if(template) {
					var clone = document.importNode(template.content, true);
					this.slideHolder.appendChild(clone);
				}
				$importEl.remove();
				$(slideHolder).removeClass('loading');
				//send message to the content
				/*
				this.tryToPostMessage({
					action: 'boot',
					message: {
						name: this.name,
						src: src
					}
				});
				*/
			}).bind(this));
			$(slideHolder).html($importEl);
			$importEl.attr('href', src);
			$(slideHolder).attr('data-src', src);
		}
	};

	/*
	{
		action: Constants.SOCKET_RECEIVE,
		message: message
	}
	*/
	SlideBridge.prototype.tryToPostMessage = function(message) {
		if(!this.slideHolder)
		{
			return;
		}
		//use jquery trigger to communicate
		//$(importEl.import).trigger('message-to-slide', message);
		//this.slideHolder.send('message', message);
	};

	return SlideBridge;
})();
