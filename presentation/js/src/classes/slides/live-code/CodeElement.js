module.exports = (function(){

	function CodeElement(el) {
		this.el = el;
		this.$el = $(el);
		//wrap element in a container
		this.$wrapperEl = $(el).wrap('<div class="live-code-element live-code-code-element"></div>').parent();
		this.wrapperEl = this.$wrapperEl[0];

		this.id = this.$el.attr('id');
		if(!this.id)
		{
			//generate id
			this.id = 'code-' + Math.round(Math.random() * 1000 * new Date().getTime());
			this.$el.attr('id', this.id);
		}

		this.runtime = this.$el.data('runtime');
		if(!this.runtime)
		{
			this.runtime = 'browser';
		}

		this.console = this.$el.data('console');

		//create codemirror
		this.language = this.$el.data('language');
		if(!this.language)
		{
			//default to javascript
			this.language = "javascript";
		}

		this.codeMirror = CodeMirror.fromTextArea(this.el, {
			lineNumbers: true,
			mode: this.language,
			extraKeys: {"Ctrl-Space": "autocomplete"}
		});

		this.$el.css('width', '100%').css('height', '100%');

		/*
		if(this.$el.css('height'))
		{
			this.$wrapperEl.css('height', this.$el.css('height'));
			this.$wrapperEl.find('.CodeMirror-scroll').css('max-height', this.$el.css('height'));
			this.$el.css('height', false);
			//refresh to force relayout
			this.codeMirror.refresh();
		}
		*/
		this.layout();
	}

	CodeElement.prototype.getValue = function() {
		return this.codeMirror.getValue();
	};

	CodeElement.prototype.layout = function() {
		this.$wrapperEl.find('.CodeMirror-scroll').css('max-height', this.$wrapperEl.css('height'));
		this.codeMirror.refresh();
	};

	return CodeElement;
})();
