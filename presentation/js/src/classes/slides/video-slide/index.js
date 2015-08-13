module.exports = (function(){
	var ContentBase = require('../ContentBase');

	function VideoSlide($slideHolder) {
		ContentBase.call(this, $slideHolder);

		this.videoPlaying = false;
		var videoUrl = getParameterByName(this.src, 'video');

		this.video = this.$slideHolder.find('video')[0];
		$(this.video).attr('src', videoUrl);
		$(this.video).on('click', this.clickHandler.bind(this));
	}

	VideoSlide.prototype = Object.create(ContentBase.prototype);

	VideoSlide.prototype.clickHandler = function(event) {
		this.videoPlaying = !this.videoPlaying;
		if(this.videoPlaying) {
			this.video.play();
		} else {
			this.video.pause();
		}
	};

	function getParameterByName(url, name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(url);
		return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	return VideoSlide;

})();
