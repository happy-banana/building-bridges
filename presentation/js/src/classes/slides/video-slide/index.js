module.exports = (function(){
	var ContentBase = require('../ContentBase');

	function VideoSlide(video, url) {
		ContentBase.call(this, url);

		this.videoPlaying = false;

		this.video = video;
		$(this.video).attr('src', url);
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

	return VideoSlide;

})();
