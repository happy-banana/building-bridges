module.exports = (function(){

  var path = requireNode('path');

  var PresentationBase = require('shared/Presentation');

  var Constants = require('Constants');
  var Config = require('./config');

  var ChildApp = require('./childapps/ChildApp');
  var MobileServerBridge = require('./MobileServerBridge');

  var SlideBridge = require('./SlideBridge');

  var KEYCODE_LEFT = 37;
  var KEYCODE_RIGHT = 39;

  function Presentation(data, role, settings) {
    if(settings) {
      for(var key in settings) {
        Config[key] = settings[key];
      }
    }
    PresentationBase.call(this, data, 'presentation');

    window.onbeforeunload = this.closeHandler.bind(this);

    this.elevatorMusicPlaying = false;
    this.elevatorMusic = false;

    $('#consoleModal').on('show.bs.modal', function (e) {
      var w = $('#consoleModal iframe')[0].contentWindow;
      w.postMessage('consoleModalOpen', 'http://localhost:3000');
    });

    this.elevatorMusic = $('#elevatormusic')[0];
    $('.elevator-button').on('click', $.proxy(this.toggleElevatorMusic, this));

    $('.info .ip').text('bbridges.herokuapp.com');

    $(window).on('keydown', $.proxy(this.keydownHandler, this));
    bean.on(this, Constants.SET_CURRENT_SLIDE_INDEX, this.currentSlideIndexChangedHandler.bind(this));

    //forward childapp messages
    ChildApp.getInstance().on('stdout-data', this.childAppDataHandler.bind(this));
    ChildApp.getInstance().on('stderr-data', this.childAppErrorHandler.bind(this));

    $('body').on(Constants.GO_TO_PREVIOUS_SLIDE, this.goToPreviousSlide.bind(this));
    $('body').on(Constants.GO_TO_NEXT_SLIDE, this.goToNextSlide.bind(this));
    $('body').on(Constants.OPEN_COMMAND_LINE, this.openCommandLine.bind(this));
    $('body').on(Constants.OPEN_CAMERA, this.openCamera.bind(this));
  }

  Presentation.prototype = Object.create(PresentationBase.prototype);

  Presentation.prototype.closeHandler = function(e) {
    if(ChildApp.getInstance().isRunning()) {
      ChildApp.getInstance().stop(function(){
        console.log('Presentation: childapp stopped');
        requireNode('remote').getCurrentWindow().close();
      });
      return false;
    }
  };

  Presentation.prototype.currentSlideIndexChangedHandler = function(slideIndex) {
    console.log('Presentation: currentSlideIndexChangedHandler');
    if(ChildApp.getInstance().isRunning()) {
      ChildApp.getInstance().stop(function(){
        console.log('Presentation: childapp stopped');
      });
    }
  };

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

  Presentation.prototype.createSlideHolders = function() {
    for(var i = 0; i < this.numSlideHolders; i++) {
      var $slideHolder = $('<div class="slide-frame" />');
      this.slideHolders.push($slideHolder);
      $('#presentation').append($slideHolder);
    }
  };

  //prepend urls with file:/// (faster?)
  Presentation.prototype.processSlideSrc = function(src) {
    src = 'file:///' + path.resolve('./presentation/' + src);
    src = src.replace(/\\/g,"/");
    return src;
  };

  Presentation.prototype.createSlideBridges = function(data) {
    PresentationBase.prototype.createSlideBridges.call(this, data);
    var that = this;
    var $slideMenu = $('#slideMenu');
    var numSlideBridges = this.slideBridges.length;
    for(var i = 0; i < numSlideBridges; i++) {
      var slideBridge = this.slideBridges[i];
      $slideMenu.append('<li><a href="#" data-slidenr="' + i + '">' + (i + 1) + ' ' + slideBridge.name + '</a></li>');
    }
    $slideMenu.find('a').on('click', function(event){
      event.preventDefault();
      that.setCurrentSlideIndex(parseInt($(this).data('slidenr')));
    });
  };

  Presentation.prototype.createSlideBridge = function(slide) {
    //use our own bridge to webviews
    return new SlideBridge(slide);
  };

  Presentation.prototype.attachToSlideHolder = function(slideHolder, slideBridge, src) {
    //listen for events on this slideHolder
    $(slideHolder).off('message-from-slide');
    $(slideHolder).on('message-from-slide', (function(event, message) {
      this.slideMessageHandler({data: message});
    }).bind(this));
    PresentationBase.prototype.attachToSlideHolder.call(this, slideHolder, slideBridge, src);
  };

  Presentation.prototype.slideMessageHandler = function(event) {
    PresentationBase.prototype.slideMessageHandler.call(this, event);
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
    var self = this;
    //one frame delay
    requestAnimationFrame(function(){
      if(event.isImmediatePropagationStopped()) {
        return;
      }
      switch(event.keyCode) {
        case KEYCODE_LEFT:
          self.goToPreviousSlide();
          break;
        case KEYCODE_RIGHT:
          self.goToNextSlide();
          break;
      }
    });
  };

  Presentation.prototype.childAppDataHandler = function(data) {
    var currentSlideBridge = this.getSlideBridgeByIndex(this.currentSlideIndex);
    if(currentSlideBridge) {
      currentSlideBridge.tryToPostMessage({
        action: Constants.CHILD_APP_STDOUT_DATA,
        data: data
      });
    }
  };

  Presentation.prototype.childAppErrorHandler = function(data) {
    var currentSlideBridge = this.getSlideBridgeByIndex(this.currentSlideIndex);
    if(currentSlideBridge) {
      currentSlideBridge.tryToPostMessage({
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

  Presentation.prototype.handleMobileServerMessage = function(message) {
    if(message.content) {
      if(message.content.action === 'goToNextSlide') {
        this.goToNextSlide();
      } else if(message.content.action === 'goToPreviousSlide') {
        this.goToPreviousSlide();
      }
    }
  };

  return Presentation;

})();
