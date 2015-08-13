module.exports = (function(){
	function getIframeWindow(iframe_object) {
		var doc;

		if (iframe_object.contentWindow) {
			return iframe_object.contentWindow;
		}

		if (iframe_object.window) {
			return iframe_object.window;
		}

		if (!doc && iframe_object.contentDocument) {
			doc = iframe_object.contentDocument;
		}

		if (!doc && iframe_object.document) {
			doc = iframe_object.document;
		}

		if (doc && doc.defaultView) {
		 return doc.defaultView;
		}

		if (doc && doc.parentWindow) {
			return doc.parentWindow;
		}

		return undefined;
	}

	function SlideBridge(data) {
		this.data = data;
		this.name = this.data.name;
	}

	SlideBridge.prototype.isAlreadyCorrectlyAttached = function(slideHolder, src) {
		return (this.slideHolder === slideHolder && $(slideHolder).attr('data-name') === this.name && $(slideHolder).attr('data-src') === src);
	};

	SlideBridge.prototype.attachToSlideHolder = function(slideHolder, src, cb) {
		this.slideHolder = slideHolder;
		$(slideHolder).off('load');
		$(slideHolder).attr('data-name', this.name);
		$(slideHolder).addClass('loading');
		if(src !== $(slideHolder).attr('data-src')) {
			$(slideHolder).on('load', (function(event){
				$(slideHolder).removeClass('loading');
				this.tryToPostMessage({
					action: 'setState',
					state: this.state
				});
				cb();
			}).bind(this));
			$(slideHolder).attr('data-src', src);
			$(slideHolder).attr('src', src);
		}
	};

	SlideBridge.prototype.setState = function(state) {
		this.state = state;
		this.tryToPostMessage({
			action: 'setState',
			state: this.state
		});
	};

	SlideBridge.prototype.tryToPostMessage = function(message) {
		if(!this.slideHolder) {
			return;
		}
		var w = getIframeWindow(this.slideHolder);
		if(w) {
			w.postMessage(message, "*");
		}
	};

	return SlideBridge;
})();
