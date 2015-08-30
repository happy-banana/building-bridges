module.exports = (function(){
	var ContentBase = require('../ContentBase');
  var Constants = require('Constants');

	function VideoSlide($slideHolder) {
		ContentBase.call(this, $slideHolder);

		this.videoPlaying = false;
		var videoUrl = getParameterByName(this.src, 'video');

		this.video = this.$slideHolder.find('video')[0];
		$(this.video).attr('src', videoUrl);
		this._clickHandler = this.clickHandler.bind(this);
		$(this.video).on('click', this._clickHandler);
	}

	VideoSlide.prototype = Object.create(ContentBase.prototype);

	VideoSlide.prototype.destroy = function() {
		ContentBase.prototype.destroy.call(this);
		$(this.video).off('click', this._clickHandler);
	};

  VideoSlide.prototype.onStateChanged = function() {
    if(this.state === Constants.STATE_ACTIVE) {
      this.setVideoPlaying(true);
    } else {
      this.setVideoPlaying(false);
    }
  };

	VideoSlide.prototype.clickHandler = function(event) {
		this.toggleVideoPlaying();
	};

  VideoSlide.prototype.setVideoPlaying = function(value) {
    if(value !== this.videoPlaying) {
      this.videoPlaying = value;
      if(this.videoPlaying) {
        this.video.play();
      } else {
        this.video.pause();
      }
    }
  };

  VideoSlide.prototype.toggleVideoPlaying = function() {
    this.setVideoPlaying(!this.videoPlaying);
  };

	function getParameterByName(url, name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(url);
		return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	return VideoSlide;

})();
