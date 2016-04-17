var edge = require('../../nms/node_modules/edge'),
  path = require('path'),
  _ = require('../../nms/node_modules/lodash');

var dllPath = path.resolve('NodeKinect2.dll');
var dllProperties = {
  assemblyFile: dllPath,
  typeName: 'NodeKinect2.Startup'
};

var kinect = {
  create: edge.func(_.assign({}, dllProperties)),
  open: edge.func(_.assign({ methodName: 'Open' }, dllProperties)),
  openBodyReader: edge.func(_.assign({ methodName: 'OpenBodyReader' }, dllProperties)),
  close: edge.func(_.assign({ methodName: 'Close' }, dllProperties))
};

kinect.create({
  logCallback: function(msg) {
    console.log('[Kinect2]', msg);
  }
}, true);

if(kinect.open(null, true)) {
  kinect.openBodyReader({
    bodyFrameCallback: function(bodies) {
      console.log(bodies);
    }
  }, true);

  setTimeout(function(){
    kinect.close(null, true);
  }, 5000);
}
