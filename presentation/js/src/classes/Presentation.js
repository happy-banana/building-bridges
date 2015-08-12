module.exports = (function(){

	var path = requireNode('path');

	var PresentationBase = require('shared/Presentation');

	var Constants = require('Constants');
	var Config = require('./config');

	var ChildApp = require('./childapps/ChildApp');
	var MobileServerBridge = require('./MobileServerBridge');

	var IFrameBridge = require('./IFrameBridge');

	var KEYCODE_LEFT = 37;
	var KEYCODE_RIGHT = 39;

	function Presentation(data, role, settings) {
		if(settings) {
			for(var key in settings) {
				Config[key] = settings[key];
			}
		}
		PresentationBase.call(this, data, 'presentation');

		this.elevatorMusicPlaying = false;
		this.elevatorMusic = false;

		$('#consoleModal').on('show.bs.modal', function (e) {
			var w = $('#consoleModal iframe')[0].contentWindow;
			w.postMessage('consoleModalOpen', 'http://localhost:3000');
		});

		this.elevatorMusic = $('#elevatormusic')[0];
		$('.elevator-button').on('click', $.proxy(this.toggleElevatorMusic, this));

		$('.info .ip').text('jsworkout.herokuapp.com');

		$(window).on('keydown', $.proxy(this.keydownHandler, this));

		//forward childapp messages
		ChildApp.getInstance().on('stdout-data', this.childAppDataHandler.bind(this));
		ChildApp.getInstance().on('stderr-data', this.childAppErrorHandler.bind(this));

		$('body').on(Constants.GO_TO_PREVIOUS_SLIDE, this.goToPreviousSlide.bind(this));
		$('body').on(Constants.GO_TO_NEXT_SLIDE, this.goToNextSlide.bind(this));
		$('body').on(Constants.OPEN_COMMAND_LINE, this.openCommandLine.bind(this));
		$('body').on(Constants.OPEN_CAMERA, this.openCamera.bind(this));
	}

	Presentation.prototype = Object.create(PresentationBase.prototype);

	Presentation.prototype.createMobileServerBridge = function() {
		return new MobileServerBridge(this, Config.mobileServerUrl);
	};

	Presentation.prototype.toggleElevatorMusic = function() {
		this.elevatorMusicPlaying = !this.elevatorMusicPlaying;
		if(this.elevatorMusicPlaying) {
			this.elevatorMusic.play();
		} else {
			this.elevatorMusic.pause();
		}
	};

	//create webviews instead of iframes
	Presentation.prototype.createIFrames = function() {
		for(var i = 0; i < this.numIframes; i++) {
			var $iframe = $('<webview class="slide-frame" nodeintegration />');
			this.iframes.push($iframe);
			$('#presentation').append($iframe);
		}
	};

	//prepend urls with file:/// (faster?)
	Presentation.prototype.processIFrameSrc = function(src) {
		src = 'file:///' + path.resolve('./presentation/' + src);
		src = src.replace(/\\/g,"/");
		return src;
	};

	Presentation.prototype.createIFrameBridges = function(data) {
		PresentationBase.prototype.createIFrameBridges.call(this, data);
		var that = this;
		var $slideMenu = $('#slideMenu');
		var numIFrameBridges = this.iFrameBridges.length;
		for(var i = 0; i < numIFrameBridges; i++) {
			var iFrameBridge = this.iFrameBridges[i];
			$slideMenu.append('<li><a href="#" data-slidenr="' + i + '">' + (i + 1) + ' ' + iFrameBridge.name + '</a></li>');
		}
		$slideMenu.find('a').on('click', function(event){
			event.preventDefault();
			that.setCurrentSlideIndex(parseInt($(this).data('slidenr')));
		});
	};

	Presentation.prototype.createIframeBridge = function(slide) {
		//use our own bridge to webviews
		return new IFrameBridge(slide);
	};

	Presentation.prototype.attachToIFrame = function(iFrame, iFrameBridge, src) {
		//listen for ipc messages on this iframe
		$(iFrame).off('ipc-message');
		$(iFrame).on('ipc-message', (function(event) {
			this.iFrameMessageHandler({data: event.originalEvent.args[0]});
		}).bind(this));
		PresentationBase.prototype.attachToIFrame.call(this, iFrame, iFrameBridge, src);
	};

	Presentation.prototype.iFrameMessageHandler = function(event) {
		PresentationBase.prototype.iFrameMessageHandler.call(this, event);
		if(!event.data) {
			return;
		}
		switch(event.data.action) {
			case Constants.GO_TO_PREVIOUS_SLIDE:
				this.goToPreviousSlide();
				break;
			case Constants.GO_TO_NEXT_SLIDE:
				this.goToNextSlide();
				break;
			case Constants.OPEN_COMMAND_LINE:
				this.openCommandLine();
				break;
			case Constants.OPEN_CAMERA:
				this.openCamera();
				break;
			case Constants.CHILD_APP_SAVE_CODE:
				ChildApp.getInstance().saveCode(event.data.code, event.data.type);
				break;
			case Constants.CHILD_APP_RUN_CODE:
				ChildApp.getInstance().runCode(event.data.code, event.data.type);
				break;
		}
	};

	Presentation.prototype.keydownHandler = function(event) {
		switch(event.keyCode) {
			case KEYCODE_LEFT:
				this.goToPreviousSlide();
				break;
			case KEYCODE_RIGHT:
				this.goToNextSlide();
				break;
		}
	};

	Presentation.prototype.childAppDataHandler = function(data) {
		var currentIFrameBridge = this.getIFrameBridgeByIndex(this.currentSlideIndex);
		if(currentIFrameBridge) {
			currentIFrameBridge.tryToPostMessage({
				action: Constants.CHILD_APP_STDOUT_DATA,
				data: data
			});
		}
	};

	Presentation.prototype.childAppErrorHandler = function(data) {
		var currentIFrameBridge = this.getIFrameBridgeByIndex(this.currentSlideIndex);
		if(currentIFrameBridge) {
			currentIFrameBridge.tryToPostMessage({
				action: Constants.CHILD_APP_STDERR_DATA,
				data: data
			});
		}
	};

	Presentation.prototype.openCommandLine = function() {
		$('#consoleModal').modal('show');
	};

	Presentation.prototype.openCamera = function() {
		$('#webcamModal').modal('show');
	};

	return Presentation;

})();
