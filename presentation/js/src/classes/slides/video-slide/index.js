module.exports = (function(){
	var ContentBase = require('../ContentBase');

	function VideoSlide() {
		var name = this.getParameterByName('video');
		ContentBase.call(this, name);

		this.videoPlaying = false;

		this.video = $('video')[0];
		$(this.video).attr('src', name);
		$(this.video).on('click', this.clickHandler.bind(this));
	}

	VideoSlide.prototype = Object.create(ContentBase.prototype);

	/**
	 * http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	 */
	VideoSlide.prototype.getParameterByName = function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
		return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};

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
