module.exports = (function(){

	var Constants = require('Constants');
	var SlideBridge = require('./SlideBridge');

	/*
	 * data: json object with slides array property
	 * role: mobile or presentation
	 */
	function Presentation(data, role) {
		this.data = data;
		this.role = role;
		this.currentSlideIndex = -1;
		this.slideHolders = [];
		this.numSlideHolders = 3;
		this.slideBridges = [];
		this.slideBridgesBySlideName = {};

		this.createSlideHolders();
		this.createSlideBridges(this.data);

		this.mobileServerBridge = this.createMobileServerBridge();
		this.startListeningForMessages();

		this.setCurrentSlideIndex(0);
	}

	Presentation.prototype.startListeningForMessages = function() {
		window.addEventListener("message", this.slideMessageHandler.bind(this), false);
	};

	Presentation.prototype.createSlideHolders = function() {
		for(var i = 0; i < this.numSlideHolders; i++) {
			var $slideHolder = $('<iframe class="slide-frame" />');
			this.slideHolders.push($slideHolder);
			$('#presentation').append($slideHolder);
		}
	};

	Presentation.prototype.createSlideBridges = function(data) {
		var that = this;
		var numSlides = data.slides.length;
		for(var i = 0; i < numSlides; i++) {
			var slideBridge = this.createSlideBridge(data.slides[i]);
			this.slideBridges.push(slideBridge);
			this.slideBridgesBySlideName[slideBridge.name] = slideBridge;
		}
	};

	Presentation.prototype.createSlideBridge = function(slide) {
		return new SlideBridge(slide);
	};

	Presentation.prototype.slideMessageHandler = function(event) {
		if(!event.data) {
			return;
		}
		switch(event.data.action) {
			case Constants.SOCKET_SEND:
				if(this.mobileServerBridge) {
					this.mobileServerBridge.tryToSend(Constants.MESSAGE, event.data.message);
				}
				break;
		}
	};

	Presentation.prototype.mobileServerBridgeConnected = function() {
		//join the rooms of the slideHolders
		for(var i = 0; i < this.numSlideHolders; i++) {
			this.mobileServerBridge.tryToSend(Constants.JOIN_SLIDE_ROOM, $(this.slideHolders[i]).attr('data-name'));
		}
	};

	Presentation.prototype.mobileServerMessageHandler = function(message) {
		if(message.target.slide) {
			//slide has to handle the message
			var slideBridge = this.getSlideBridgeByName(message.target.slide);
			if(slideBridge) {
				slideBridge.tryToPostMessage({
					action: Constants.SOCKET_RECEIVE,
					message: message
				});
			}
		} else {
			//presentation has to handle the message
			this.handleMobileServerMessage(message);
		}
	};

	Presentation.prototype.handleMobileServerMessage = function(message) {
		console.log('[shared/Presentation] handleMobileServerMessage', message);
	};

	Presentation.prototype.getSlideBridgeByIndex = function(index) {
		if(index >= 0 && index < this.slideBridges.length) {
			return this.slideBridges[index];
		}
		return false;
	};

	Presentation.prototype.getSlideBridgeByName = function(slideName) {
		return this.slideBridgesBySlideName[slideName];
	};

	Presentation.prototype.getSlideHolderForSlide = function(slide, slidesNotToClear) {
		if(slide) {
			var $slideHolder = $('.slide-frame[data-name="' + slide.name + '"]');
			if($slideHolder.length > 0) {
				return $slideHolder[0];
			}
			//get a free slideHolder
			var slideNamesNotToClear = [];
			$(slidesNotToClear).each(function(index, obj){
				slideNamesNotToClear.push(obj.name);
			});
			var $slideHolders = $('.slide-frame');
			for (var i = $slideHolders.length - 1; i >= 0; i--) {
				$slideHolder = $($slideHolders[i]);
				var name = $slideHolder.attr('data-name');
				if(!name || slideNamesNotToClear.indexOf(name) === -1) {
					return $slideHolder[0];
				}
			}
		}
		return false;
	};

	Presentation.prototype.goToPreviousSlide = function() {
		this.setCurrentSlideIndex(this.currentSlideIndex - 1);
	};

	Presentation.prototype.goToNextSlide = function() {
		this.setCurrentSlideIndex(this.currentSlideIndex + 1);
	};

	Presentation.prototype.setCurrentSlideIndex = function(value) {
		value = Math.max(0, Math.min(value, this.slideBridges.length - 1));
		if(value !== this.currentSlideIndex) {
			this.currentSlideIndex = value;

			var currentSlideBridge = this.getSlideBridgeByIndex(this.currentSlideIndex);
			var previousSlideBridge = this.getSlideBridgeByIndex(this.currentSlideIndex - 1);
			var nextSlideBridge = this.getSlideBridgeByIndex(this.currentSlideIndex + 1);

			var currentSlideHolder = this.getSlideHolderForSlide(currentSlideBridge, [previousSlideBridge, nextSlideBridge]);
			this.setupSlideHolder(currentSlideHolder, currentSlideBridge, Constants.STATE_ACTIVE, 0);

			var previousSlideHolder = this.getSlideHolderForSlide(previousSlideBridge, [currentSlideBridge, nextSlideBridge]);
			this.setupSlideHolder(previousSlideHolder, previousSlideBridge, Constants.STATE_INACTIVE, '-100%');

			var nextSlideHolder = this.getSlideHolderForSlide(nextSlideBridge, [previousSlideBridge, currentSlideBridge]);
			this.setupSlideHolder(nextSlideHolder, nextSlideBridge, Constants.STATE_INACTIVE, '100%');

			//all other slideHolder bridges should be unlinked from their slideHolder
			this.slideBridges.forEach(function(slideBridge){
				if(slideBridge === currentSlideBridge) {
					return;
				}
				if(slideBridge === previousSlideBridge) {
					return;
				}
				if(slideBridge === nextSlideBridge) {
					return;
				}
				slideBridge.slideHolder = null;
			});

			bean.fire(this, Constants.SET_CURRENT_SLIDE_INDEX, [this.currentSlideIndex]);
		}
	};

	Presentation.prototype.setupSlideHolder = function(slideHolder, slideBridge, state, left) {
		if(slideHolder) {
			var src = "slides/" + slideBridge.name + '.html';
			if(slideBridge.data[this.role] && slideBridge.data[this.role].url) {
				src = slideBridge.data[this.role].url;
			}
			src = this.processSlideSrc(src);
			if(slideBridge.isAlreadyCorrectlyAttached(slideHolder, src)) {
				//console.log(slideBridge.name + ' already attached');
			} else {
				this.attachToSlideHolder(slideHolder, slideBridge, src);
			}
			slideBridge.setState(state);
			$(slideHolder).css('left', left);
		}
	};

	Presentation.prototype.attachToSlideHolder = function(slideHolder, slideBridge, src) {
		//leave previous channel of this slideHolder
		if(this.mobileServerBridge) {
			this.mobileServerBridge.tryToSend(Constants.LEAVE_SLIDE_ROOM, $(slideHolder).attr('data-name'));
		}
		//add the join as a callback for the onload event
		slideBridge.attachToSlideHolder(slideHolder, src, this.slideLoaded.bind(this, slideHolder, slideBridge, src));
	};

	Presentation.prototype.slideLoaded = function(slideHolder, slideBridge) {
		//join new channel
		if(this.mobileServerBridge) {
			this.mobileServerBridge.tryToSend(Constants.JOIN_SLIDE_ROOM, $(slideHolder).attr('data-name'));
		}
	};

	Presentation.prototype.processSlideSrc = function(src) {
		return src;
	};

	Presentation.prototype.createMobileServerBridge = function() {
		//to implement in extending classes
	};

	return Presentation;

})();
