module.exports = (function(){

	function ConsoleElement(el) {
		this.el = el;
		this.$el = $(el);
		//wrap element in a container
		this.$wrapperEl = $(el).wrap('<div class="live-code-element live-code-console-element unreset"></div>').parent();
		this.wrapperEl = this.$wrapperEl[0];

		this.id = this.$el.attr('data-id');
		if(!this.id)
		{
			//generate id
			this.id = 'code-' + Math.round(Math.random() * 1000 * new Date().getTime());
			this.$el.attr('data-id', this.id);
		}

		this.$el.css('width', '100%').css('height', '100%');
	}

	ConsoleElement.prototype.destroy = function() {
	};

	ConsoleElement.prototype.info = function(data) {
		this.el.innerHTML += '<pre>' + data + '</pre>';
		this.wrapperEl.scrollTop = this.wrapperEl.scrollHeight;

	};

	ConsoleElement.prototype.error = function(data) {
		this.el.innerHTML += '<pre class="console-error">' + data + '</pre>';
		this.wrapperEl.scrollTop = this.wrapperEl.scrollHeight;
	};

	return ConsoleElement;
})();
