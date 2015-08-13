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

		this.$el.css('width', '100%').css('height', '100%');
	}

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
		}).bind(this));

		this.webview.setAttribute('nodeintegration', '');
		this.webview.setAttribute('src', 'webpreview.html');
	};

	return WebPreviewElement;
})();
