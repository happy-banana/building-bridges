module.exports = (function(){

  var self;

	function CodeElement(el) {
    self = this;
		this.el = el;
		this.$el = $(el);
		//wrap element in a container
		this.$wrapperEl = $(el).wrap('<div class="live-code-element live-code-code-element"></div>').parent();
		this.wrapperEl = this.$wrapperEl[0];

		this.id = this.$el.attr('data-id');
		if(!this.id)
		{
			//generate id
			this.id = 'code-' + Math.round(Math.random() * 1000 * new Date().getTime());
			this.$el.attr('data-id', this.id);
		}

		this.runtime = this.$el.data('runtime');
		if(!this.runtime)
		{
			this.runtime = 'browser';
		}

		this.console = this.$el.data('console');
		this.processor = this.$el.data('processor');

		//language is programming language - used for injecting in html
		this.language = this.$el.data('language');
		if(!this.language)
		{
			//default to javascript
			this.language = "javascript";
		}

		//mode is mode for codemirror
		this.mode = this.$el.data('mode');
		if(!this.mode)
		{
			//default to the language
			this.mode = this.language;
		}

		this.codeMirror = CodeMirror.fromTextArea(this.el, {
			lineNumbers: true,
			mode: this.mode,
			extraKeys: {"Ctrl-Space": "autocomplete"}
		});

		this.$el.css('width', '100%').css('height', '100%');
		this.layout();

    //disable keyboard bubbling up
    $(window).on('keydown', this.keyDownHandler);
	}

  CodeElement.prototype.keyDownHandler = function(e) {
    //cancel if code mirror has focus
    var type = "" + Object.prototype.toString.call(event.target);
    if(type.toLowerCase().indexOf('textarea') > -1){
      e.stopImmediatePropagation();
    }
  };

	CodeElement.prototype.destroy = function() {
    $(window).off('keydown', this.keyDownHandler);
	};

	CodeElement.prototype.getValue = function() {
		return this.codeMirror.getValue();
	};

	CodeElement.prototype.layout = function() {
		this.$wrapperEl.find('.CodeMirror-scroll').css('max-height', this.$wrapperEl.css('height'));
		this.codeMirror.refresh();
	};

	return CodeElement;
})();
