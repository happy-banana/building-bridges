module.exports = (function(){

	function WebPreviewElement(el) {
		this.el = el;
		this.$el = $(el);
		//wrap element in a container
		this.$wrapperEl = $(el).wrap('<div class="live-code-element live-code-web-preview-element"></div>').parent();
		this.wrapperEl = this.$wrapperEl[0];

		this.id = this.$el.attr('id');
		if(!this.id)
		{
			//generate id
			this.id = 'code-' + Math.round(Math.random() * 1000 * new Date().getTime());
			this.$el.attr('id', this.id);
		}

		this.$el.css('width', '100%').css('height', '100%');
	}

	return WebPreviewElement;
})();
