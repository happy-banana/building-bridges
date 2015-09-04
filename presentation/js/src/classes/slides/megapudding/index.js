module.exports = (function(){
  var ContentBase = require('../ContentBase');
  var Constants = require('Constants');

  function MegaPuddingSlide($slideHolder) {
    ContentBase.call(this, $slideHolder);

    this.$webview = $slideHolder.find('webview');
    this.webview = this.$webview[0];

    this.webview.addEventListener("dom-ready", (function(){
      //this.webview.openDevTools();
    }).bind(this));
  }

  MegaPuddingSlide.prototype = Object.create(ContentBase.prototype);

  MegaPuddingSlide.prototype.destroy = function() {
    ContentBase.prototype.destroy.call(this);
  };

  MegaPuddingSlide.prototype.onStateChanged = function() {
    if(this.state === Constants.STATE_ACTIVE) {
      this.webview.setAttribute('src', 'slides/megapudding/index.html');
    } else {
      this.webview.setAttribute('src', '');
    }
  };

  return MegaPuddingSlide;

})();
