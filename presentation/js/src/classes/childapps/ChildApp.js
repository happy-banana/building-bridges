var Config = require('../config'),
	events = requireNode('events'),
	fs = requireNode('fs'),
	childProcess = requireNode('child_process'),
	util = requireNode('util'),
	path = requireNode('path');

//kill entire process tree
//http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
var kill = function (pid, signal, callback) {
	signal = signal || 'SIGKILL';
	callback = callback || function () {};
	//var isWin = /^win/.test(process.platform);
	var isWin = true;
	if(!isWin) {
		var psTree = requireNode('ps-tree');
		var killTree = true;
		if(killTree) {
			psTree(pid, function (err, children) {
				[pid].concat(
					children.map(function (p) {
						return p.PID;
					})
				).forEach(function (tpid) {
					try { process.kill(tpid, signal); }
					catch (ex) { }
					});
					callback();
			});
		} else {
			try { process.kill(pid, signal); }
			catch (ex) { }
			callback();
		}
	} else {
		childProcess.exec('taskkill /PID ' + pid + ' /T /F', function (error, stdout, stderr) {
			callback();
		});
	}
};

function ChildApp() {
	events.EventEmitter.call(this);
	console.log("[ChildApp] constructor");
	this.runner = false;
}

util.inherits(ChildApp, events.EventEmitter);

ChildApp.getInstance = function() {
	if(!ChildApp.instance) {
		ChildApp.instance = new ChildApp();
	}
	return ChildApp.instance;
};

ChildApp.prototype.saveCode = function(code, type, cb) {
	//if code is running, stop it
	if(this.runner) {
		this.stop(this.saveCode.bind(this, code, type, cb));
	} else {
		var filePath = Config.childNodeAppFilePath;
		if(type === 'tessel') {
			filePath = Config.childTesselAppFilePath;
		}
		//create folder / file if needed
		fs.writeFile(filePath, code, function(err) {
				if(err) {
						console.log(err);
				} else {
						console.log("[ChildApp] The file was saved!");
						if(cb) {
							cb();
						}
				}
		});
	}
};

ChildApp.prototype.runCode = function(code, type) {
	console.log("[ChildApp] runCode");
	//write code to file & run it
	this.saveCode(code, type, (function(){
		//run the code
		if(type === 'tessel') {
      this.cwd = path.dirname(Config.childTesselAppFilePath);
      this.numDataEventsReceived = 0;
			this.runner = childProcess.spawn("tessel", ["run", Config.childTesselAppFilePath], {cwd: this.cwd});
		} else {
      this.cwd = path.dirname(Config.childNodeAppFilePath);
      this.numDataEventsReceived = 0;
			//this.runner = process.spawn("node", [Config.childNodeAppFilePath], {cwd: path.dirname(Config.childNodeAppFilePath)});
			this.runner = childProcess.spawn("cmd", ["nvmw", "use", "iojs-v2.3.1"], {cwd: this.cwd});
			setTimeout((function(){
				//execute first command
				this.runner.stdin.write("node " + Config.childNodeAppFilePath + "\n");
			}).bind(this), 500);
		}
		this.runner.stdout.on('data', this.onRunnerData.bind(this));
		this.runner.stderr.on('data', this.onRunnerError.bind(this));
		this.runner.on('disconnect', this.onDisconnect.bind(this));
		this.runner.on('close', this.onClose.bind(this));
		this.runner.on('exit', this.onExit.bind(this));
	}).bind(this));
};

ChildApp.prototype.isRunning = function() {
	return (this.runner !== false);
};

ChildApp.prototype.stop = function(cb) {
	if(this.runner) {
		console.log("[ChildApp] execute stop");
		console.log(this.runner.pid);
		this.runner.stdout.removeAllListeners();
		this.runner.stderr.removeAllListeners();
		this.runner.stdin.end();
		//listen for runner events and execute callbacks
		var cbCalled = false;
		this.runner.on('disconnect', function(){
			if(cb && !cbCalled)
			{
				cb();
			}
		});
		this.runner.on('close', function(){
			if(cb && !cbCalled)
			{
				cb();
			}
		});
		this.runner.on('exit', function(){
			if(cb && !cbCalled)
			{
				cb();
			}
		});
		kill(this.runner.pid);
		this.runner = false;
	} else {
		if(cb) {
			cb();
		}
	}
};

ChildApp.prototype.onRunnerData = function(data) {
  this.numDataEventsReceived++;
  if(this.numDataEventsReceived < 3) {
    //ignore the first two messages
    return;
  }
  data = data.toString().trim();
  if(data.indexOf(this.cwd) === 0) {
    data = data.substr(this.cwd.length);
    if(data.length === 1) {
      return;
    }
  }
	this.emit('stdout-data', data);
};

ChildApp.prototype.onRunnerError = function(error) {
	this.emit('stderr-data', error.toString().trim());
};

ChildApp.prototype.onDisconnect = function() {
	console.log('[ChildApp] runner disconnected');
	this.runner = false;
};

ChildApp.prototype.onClose = function() {
	console.log('[ChildApp] runner closed');
	this.runner = false;
};

ChildApp.prototype.onExit = function() {
	console.log('[ChildApp] runner exited');
	this.runner = false;
};

module.exports = ChildApp;
