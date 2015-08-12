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
		this.stop();
		console.log("[ChildApp] kill() executed");
		setTimeout(this.saveCode.bind(this, code, type, cb), 500);
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
			this.runner = childProcess.spawn("tessel", ["run", Config.childTesselAppFilePath], {cwd: path.dirname(Config.childTesselAppFilePath)});
		} else {
			//this.runner = process.spawn("node", [Config.childNodeAppFilePath], {cwd: path.dirname(Config.childNodeAppFilePath)});
			this.runner = childProcess.spawn("cmd", ["nvmw", "use", "iojs-v2.3.1"], {cwd: path.dirname(Config.childNodeAppFilePath)});
			setTimeout((function(){
				//execute first command
				this.runner.stdin.write("node " + Config.childNodeAppFilePath + "\n");
			}).bind(this), 500);
		}
		this.runner.stdout.on('data', this.onRunnerData.bind(this));
		this.runner.stderr.on('data', this.onRunnerError.bind(this));
		this.runner.on('disconnect', this.onDisconnect.bind(this));
		this.runner.on('close', this.onClose.bind(this));
	}).bind(this));
};

ChildApp.prototype.stop = function() {
	if(this.runner) {
		console.log("[ChildApp] stop");
		console.log(this.runner.pid);
		this.runner.stdout.removeAllListeners();
		this.runner.stderr.removeAllListeners();
		this.runner.stdin.end();
		kill(this.runner.pid);
		this.runner = false;
	}
};

ChildApp.prototype.onRunnerData = function(data) {
	this.emit('stdout-data', data.toString().trim());
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

module.exports = ChildApp;
