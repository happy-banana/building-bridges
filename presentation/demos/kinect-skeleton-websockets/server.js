var Kinect2 = require('../../nms/node_modules/kinect2'),
  express = require('../../nms/node_modules/express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('../../nms/node_modules/socket.io').listen(server);

var kinect = new Kinect2();

if(kinect.open()) {
  server.listen(8000);
  console.log('Server listening on port 8000');
  console.log('Point your browser to http://localhost:8000');

  kinect.on('bodyFrame', function(bodyFrame){
    io.sockets.emit('bodyFrame', bodyFrame);
  });

  kinect.openBodyReader();
}