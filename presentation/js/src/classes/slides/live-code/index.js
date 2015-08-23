module.exports = (function(){
  var ContentBase = require('../ContentBase');
  var Constants = require('Constants');

  var ConsoleElement = require('./ConsoleElement');
  var CodeElement = require('./CodeElement');
  var WebPreviewElement = require('./WebPreviewElement');

  function LiveCode($slideHolder) {
    ContentBase.call(this, $slideHolder);

    //create the consoles
    this.consoleElements = {};
    this.$slideHolder.find('[data-type="console"]').each((function(index, consoleEl){
      this.createConsoleElement(consoleEl);
    }).bind(this));

    //create the previews
    this.webPreviewElements = {};
    this.$slideHolder.find('[data-type="web-preview"]').each((function(index, webPreviewEl){
      this.createWebPreviewElement(webPreviewEl);
    }).bind(this));

    //create the code editors
    this.codeElements = {};
    this.$slideHolder.find('[data-type="code"]').each((function(index, codeEl){
      this.createCodeElement(codeEl);
    }).bind(this));

    //create run buttons
    this.runButtonEls = [];
    this.$slideHolder.find('[data-type="run-button"]').each((function(index, runButtonEl){
      this.createRunButton(runButtonEl);
    }).bind(this));
  }

  LiveCode.prototype = Object.create(ContentBase.prototype);

  LiveCode.prototype.destroy = function() {
    ContentBase.prototype.destroy.call(this);
    var key;
    for(key in this.consoleElements)
    {
      this.destroyConsoleElement(this.consoleElements[key]);
    }
    for(key in this.webPreviewElements)
    {
      this.destroyWebPreviewElement(this.webPreviewElements[key]);
    }
    for(key in this.codeElements)
    {
      this.destroyCodeElement(this.codeElements[key]);
    }
    for(key = 0; key < this.runButtonEls.length; key++)
    {
      this.destroyRunButton(this.runButtonEls[key]);
    }
  };

  LiveCode.prototype.onStateChanged = function() {
    //stop running apps when not active
    if(this.state !== Constants.STATE_ACTIVE)
    {
      //stop the web previews
      for(var key in this.webPreviewElements)
      {
        this.webPreviewElements[key].stop();
      }
      //node child apps get stopped in presentation
    }
  };

  LiveCode.prototype.layout = function() {
    //might be triggered after split pane resize or tab switch
    //codemirror instances need to be updated
    for(var key in this.codeElements)
    {
      this.codeElements[key].layout();
    }
  };

  LiveCode.prototype.createConsoleElement = function(consoleEl) {
    var consoleElement = new ConsoleElement(consoleEl);
    this.consoleElements[consoleElement.id] = consoleElement;
  };

  LiveCode.prototype.destroyConsoleElement = function(consoleElement) {
    consoleElement.destroy();
  };

  LiveCode.prototype.createWebPreviewElement = function(webPreviewEl) {
    var webPreviewElement = new WebPreviewElement(webPreviewEl);
    webPreviewElement.$wrapperEl.on('console.log', this.webPreviewConsoleLogHandler.bind(this, webPreviewElement));
    webPreviewElement.$wrapperEl.on('console.error', this.webPreviewConsoleErrorHandler.bind(this, webPreviewElement));
    this.webPreviewElements[webPreviewElement.id] = webPreviewElement;
  };

  LiveCode.prototype.destroyWebPreviewElement = function(webPreviewElement) {
    webPreviewElement.$wrapperEl.off('console.log');
    webPreviewElement.$wrapperEl.off('console.error');
    webPreviewElement.destroy();
  };

  LiveCode.prototype.createCodeElement = function(codeEl) {
    var codeElement = new CodeElement(codeEl);
    this.codeElements[codeElement.id] = codeElement;
  };

  LiveCode.prototype.destroyCodeElement = function(codeElement) {
    codeElement.destroy();
  };

  LiveCode.prototype.createRunButton = function(runButtonEl) {
    this.runButtonEls.push(runButtonEl);
    $(runButtonEl).on('click', (function(){
      //run code in target element
      if(this.codeElements[$(runButtonEl).data('target')]) {
        this.runCode(this.codeElements[$(runButtonEl).data('target')]);
      }
    }).bind(this));
  };

  LiveCode.prototype.destroyRunButton = function(runButtonEl) {
    $(runButtonEl).off('click');
  };

  LiveCode.prototype.runCode = function(codeElement) {
    var code = codeElement.getValue();
    //where do we run this code? nodejs or in browser?
    if(codeElement.runtime === 'node')
    {
      //run as child-app
      this.postMessage({
        action: Constants.CHILD_APP_RUN_CODE,
        code: code
      });
    }
    else
    {
      //get the web preview element which is handling this code
      var webPreviewElement = this.getWebPreviewElementForCodeElement(codeElement);
      if(webPreviewElement)
      {
        this.updateWebPreviewElement(webPreviewElement);
      }
    }
  };

  LiveCode.prototype.handleMessage = function(message) {
    var consoleElement;
    if(message.action === Constants.CHILD_APP_STDOUT_DATA)
    {
      consoleElement = this.getConsoleElementForRuntime('node');
      if(consoleElement)
      {
        consoleElement.info([message.data]);
      }
    }
    else if(message.action === Constants.CHILD_APP_STDERR_DATA)
    {
      consoleElement = this.getConsoleElementForRuntime('node');
      if(consoleElement)
      {
        consoleElement.error([message.data]);
      }
    }
  };

  LiveCode.prototype.webPreviewConsoleLogHandler = function(webPreviewElement, event, message) {
    //get the console element for this web preview
    var consoleElement = this.getConsoleElementForWebPreview(webPreviewElement);
    if(consoleElement)
    {
      consoleElement.info(JSON.parse(message).args);
    }
  };

  LiveCode.prototype.webPreviewConsoleErrorHandler = function(webPreviewElement, event, message) {
    //get the console element for this web preview
    var consoleElement = this.getConsoleElementForWebPreview(webPreviewElement);
    if(consoleElement)
    {
      consoleElement.error(JSON.parse(message).args);
    }
  };

  LiveCode.prototype.getConsoleElementForRuntime = function(runtime) {
    //<textarea id="node-code" data-type="code" data-runtime="node" data-console="node-console" data-language="javascript">
    for(var key in this.codeElements)
    {
      var codeElement = this.codeElements[key];
      if(codeElement.runtime === runtime && this.consoleElements[codeElement.console])
      {
        return this.consoleElements[codeElement.console];
      }
    }
    return false;
  };

  LiveCode.prototype.getConsoleElementForWebPreview = function(webPreviewElement) {
    return this.consoleElements[webPreviewElement.console];
  };

  LiveCode.prototype.getWebPreviewElementForCodeElement = function(codeElement) {
    return this.webPreviewElements[codeElement.processor];
  };

  LiveCode.prototype.updateWebPreviewElement = function(webPreviewElement) {
    //gather all the code for this element
    var blocks = [];
    for(var key in this.codeElements)
    {
      var codeElement = this.codeElements[key];
      if(codeElement.processor === webPreviewElement.id)
      {
        var block = {
          language: codeElement.language,
          code: codeElement.getValue()
        };
        blocks.push(block);
      }
    }
    webPreviewElement.updateCode(blocks);
  };

  LiveCode.prototype.saveClickHandler = function() {
    var code = this.codeMirror.getValue();
    this.postMessage({
      action: Constants.CHILD_APP_SAVE_CODE,
      code: code,
      type: this.type
    });
    this.postMessage({
      action: Constants.OPEN_COMMAND_LINE
    });
  };

  LiveCode.prototype.runClickHandler = function() {
    var code = this.codeMirror.getValue();
    this.postMessage({
      action: Constants.CHILD_APP_RUN_CODE,
      code: code,
      type: this.type
    });
    this.postMessage({
      action: Constants.OPEN_CAMERA
    });
  };

  return LiveCode;

})();
