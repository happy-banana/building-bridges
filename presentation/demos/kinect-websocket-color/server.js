var Kinect2 = require('kinect2'),
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);

var kinect = new Kinect2();

if(kinect.open()) {
  server.listen(8000);
  console.log('Server listening on port 8000');
  console.log('Point your browser to http://localhost:8000');

  var frameNr = 0;

  kinect.on('colorFrame', function(colorFrame){
    console.log('send colorFrame', ++frameNr);
    io.sockets.emit('colorFrame', colorFrame);
    /*
    for(var socketId in io.sockets.sockets) {
      io.sockets.sockets[socketId].volatile.emit('colorFrame', colorFrame);
    }
    */
  });

  kinect.openColorReader();
}
