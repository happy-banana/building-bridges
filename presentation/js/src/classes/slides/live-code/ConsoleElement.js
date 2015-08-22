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

    this.logs = [];
  }

  ConsoleElement.prototype.destroy = function() {
  };

  function htmlEscape(str) {
    return String(str).replace(/&/g, '&amp;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  ConsoleElement.prototype.info = function(args) {
    var str = '';
    args.forEach(function(arg){
      if(str.length > 0) {
        str += ' ';
      }
      str += htmlEscape(JSON.stringify(arg));
    });
    this.logs.push('<pre>' + str + '</pre>');
    while(this.logs.length > 20) {
      this.logs.shift();
    }
    var html = this.logs.join('');
    this.el.innerHTML = html;
    this.wrapperEl.scrollTop = this.wrapperEl.scrollHeight;
  };

  ConsoleElement.prototype.error = function(args) {
    var str = '';
    args.forEach(function(arg){
      if(str.length > 0) {
        str += ' ';
      }
      str += htmlEscape(JSON.stringify(arg));
    });
    this.logs.push('<pre class="console-error">' + str + '</pre>');
    while(this.logs.length > 20) {
      this.logs.shift();
    }
    var html = this.logs.join('');
    this.el.innerHTML = html;
    this.wrapperEl.scrollTop = this.wrapperEl.scrollHeight;
  };

  return ConsoleElement;
})();
