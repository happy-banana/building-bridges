module.exports = (function(){

	//Extend the shared class
	var SharedSlideBridge = require('shared/SlideBridge');

	function SlideBridge(data) {
		SharedSlideBridge.call(this, data);
	}

	SlideBridge.prototype = Object.create(SharedSlideBridge.prototype);

	SlideBridge.prototype.attachToSlideHolder = function(slideHolder, src, cb) {
		this.slideHolder = slideHolder;
		//notify the content it is being cleared
		this.tryToPostMessage({action: 'destroy'});
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
				this.tryToPostMessage({
					action: 'setState',
					state: this.state
				});
				cb();
			}).bind(this));
			$(slideHolder).html($importEl);
			$importEl.attr('href', src);
			$(slideHolder).attr('data-src', src);
		}
	};

	SlideBridge.prototype.tryToPostMessage = function(message) {
		if(!this.slideHolder)
		{
			return;
		}
		//trigger with jquery
		$(this.slideHolder).trigger('message-to-slide', message);
	};

	return SlideBridge;
})();
