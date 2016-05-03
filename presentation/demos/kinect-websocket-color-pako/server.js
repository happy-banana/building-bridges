'use strict';

let Kinect2 = require('../../nms/node_modules/kinect2'),
  express = require('../../nms/node_modules/express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('../../nms/node_modules/socket.io').listen(server),
  zlib = require('zlib');

let kinect = new Kinect2();

if(kinect.open()) {
  server.listen(8000);
  console.log('Server listening on port 8000');
  console.log('Point your browser to http://localhost:8000');

  let frameNr = 0;
  let compressing = false;

  kinect.on('colorFrame', colorFrame => {
    if(compressing) {
      return;
    }
    compressing = true;
    console.log('send colorFrame', ++frameNr);
    zlib.deflate(colorFrame, (err, result) => {
      if(!err) {
        for(let socketId in io.sockets.sockets) {
          io.sockets.sockets[socketId].volatile.emit('colorFrame', result);
        }
      }
      compressing = false;
    });
  });

  kinect.openColorReader();
}
