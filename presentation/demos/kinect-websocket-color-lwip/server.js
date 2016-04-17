var Kinect2 = require('kinect2'),
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  lwip = require('lwip');

var kinect = new Kinect2();

if(kinect.open()) {
  server.listen(8000);
  console.log('Server listening on port 8000');
  console.log('Point your browser to http://localhost:8000');

  var w = 1920;
  var h = 1080;

  var size = 4 * w * h;
  var channelSize = size / 4;
  var redOffset = 0;
  var greenOffset = channelSize;
  var blueOffset = channelSize * 2;
  var alphaOffset = channelSize * 3;
  var lwipBuffer = new Buffer(size);

  var frameNr = 0;
  var compressing = false;

  kinect.on('colorFrame', function(colorFrame){
    if(compressing) {
      return;
    }
    compressing = true;
    console.log('send colorFrame', ++frameNr);
    //swap colorFrame to lwip buffer
    for(var i = 0; i < channelSize; i++) {
      lwipBuffer[i + redOffset] = colorFrame[i * 4];
      lwipBuffer[i + greenOffset] = colorFrame[i * 4 + 1];
      lwipBuffer[i + blueOffset] = colorFrame[i * 4 + 2];
      lwipBuffer[i + alphaOffset] = 100;
    }
    lwip.open(lwipBuffer, {width: w, height: h}, function(err, image){
      if(err) {
        compressing = false;
        return;
      }
      image.batch()
        .toBuffer('jpg', { quality: 50 }, function(err, buffer){
          if(err) {
            compressing = false;
            return;
          }
          for(var socketId in io.sockets.sockets) {
            io.sockets.sockets[socketId].volatile.emit('colorFrame', buffer);
          }
          compressing = false;
        });
    });
  });

  kinect.openColorReader();
}
