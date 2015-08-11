module.exports = (function(){

	var path = requireNode('path');

	if(!global.Config) {
		global.Config = {};

		// Retrieve local ip for Config
		var ip = '127.0.0.1', ifaces = requireNode('os').networkInterfaces();
		for (var dev in ifaces) {
			if(dev.indexOf('bridge') !== 0) {
				/* jshint ignore:start */
				ifaces[dev].forEach(function(details) {
					if (details.family === 'IPv4') {
						ip = details.address;
					}
				});
				/* jshint ignore:end */
			}
		}

		global.Config.childNodeAppFilePath = path.resolve('./child-app/node/app.js');
		global.Config.childTesselAppFilePath = path.resolve('./child-app/tessel/app.js');
		global.Config.ip = ip;

		global.Config.mobileServerUrl = "";
		global.Config.mobileServerUsername = "";
		global.Config.mobileServerPassword = "";

	}

	return global.Config;

})();
