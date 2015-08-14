module.exports = (function(){

	function WebPreviewElement(el) {
		this.el = el;
		this.$el = $(el);
		//wrap element in a container
		this.$wrapperEl = $(el).wrap('<div class="live-code-element live-code-web-preview-element"></div>').parent();
		this.wrapperEl = this.$wrapperEl[0];

		this.id = this.$el.attr('data-id');
		if(!this.id)
		{
			//generate id
			this.id = 'code-' + Math.round(Math.random() * 1000 * new Date().getTime());
			this.$el.attr('data-id', this.id);
		}

		this.console = this.$el.data('console');

		this.$el.css('width', '100%').css('height', '100%');
	}

	WebPreviewElement.prototype.destroy = function() {
	};

	WebPreviewElement.prototype.updateCode = function(blocks) {
		//create a webview tag
		if(this.webview) {
			this.webview.parentNode.removeChild(this.webview);
			this.webview = false;
		}
		this.webview = document.createElement('webview');
		this.webview.style.width = '100%';
		this.webview.style.height = '100%';
		this.el.appendChild(this.webview);

		var htmlSrc = '';
		//add some extra javascript to the htmlSrc to forward console logs
		htmlSrc += "<script>\n";
		htmlSrc += "console.log = function(){\n";
		htmlSrc += "args = [];\n";
		htmlSrc += "[].forEach.call(arguments, function(argument){\n";
		htmlSrc += "args.push(htmlEscape(argument));\n";
		htmlSrc += "});\n";
		htmlSrc += "require('ipc').sendToHost('console.log', args);\n";
		htmlSrc += "}\n";
		htmlSrc += "console.error = function(){\n";
		htmlSrc += "args = [];\n";
		htmlSrc += "[].forEach.call(arguments, function(argument){\n";
		htmlSrc += "args.push(htmlEscape(argument));\n";
		htmlSrc += "});\n";
		htmlSrc += "require('ipc').sendToHost('console.error', args);\n";
		htmlSrc += "}\n";
		htmlSrc += "function htmlEscape(str) {\n";
		htmlSrc += "return String(str)\n";
		htmlSrc += ".replace(/&/g, '&amp;')\n";
		htmlSrc += ".replace(/\"/g, '&quot;')\n";
		htmlSrc += ".replace(/'/g, '&#39;')\n";
		htmlSrc += ".replace(/</g, '&lt;')\n";
		htmlSrc += ".replace(/>/g, '&gt;');\n";
		htmlSrc += "}\n";
		htmlSrc += "</script>";
		for(var i = 0; i < blocks.length; i++)
		{
			htmlSrc += blocks[i].code;
		}

		this.webview.addEventListener("dom-ready", (function(){
		//this.webview.openDevTools();
		}).bind(this));

		this.webview.addEventListener('ipc-message', (function(event) {
			if(event.channel === 'request-html')
			{
				this.webview.send('receive-html', htmlSrc);
			}
			else if(event.channel === 'console.log')
			{
				//notify live code editor
				this.$wrapperEl.trigger('console.log', event.args[0]);
			}
			else if(event.channel === 'console.error')
			{
				//notify live code editor
				this.$wrapperEl.trigger('console.error', event.args[0]);
			}
		}).bind(this));

		this.webview.setAttribute('nodeintegration', '');
		this.webview.setAttribute('src', 'webpreview.html');
	};

	return WebPreviewElement;
})();
