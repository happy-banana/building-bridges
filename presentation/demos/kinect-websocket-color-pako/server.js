var Kinect2 = require('../../nms/node_modules/kinect2'),
  express = require('../../nms/node_modules/express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('../../nms/node_modules/socket.io').listen(server),
  zlib = require('zlib');

var kinect = new Kinect2();

if(kinect.open()) {
  server.listen(8000);
  console.log('Server listening on port 8000');
  console.log('Point your browser to http://localhost:8000');

  var frameNr = 0;
  var compressing = false;

  kinect.on('colorFrame', function(colorFrame){
    if(compressing) {
      return;
    }
    compressing = true;
    console.log('send colorFrame', ++frameNr);
    zlib.deflate(colorFrame, function(err, result){
      if(!err) {
        for(var socketId in io.sockets.sockets) {
          io.sockets.sockets[socketId].volatile.emit('colorFrame', result);
        }
      }
      compressing = false;
    });
  });

  kinect.openColorReader();
}
