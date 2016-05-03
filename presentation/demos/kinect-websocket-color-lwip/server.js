'use strict';

let Kinect2 = require('../../nms/node_modules/kinect2'),
  express = require('../../nms/node_modules/express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('../../nms/node_modules/socket.io').listen(server),
  lwip = require('../../nms/node_modules/lwip');

let kinect = new Kinect2();

if(kinect.open()) {
  server.listen(8000);
  console.log('Server listening on port 8000');
  console.log('Point your browser to http://localhost:8000');

  let w = 1920;
  let h = 1080;

  let size = 4 * w * h;
  let channelSize = size / 4;
  let redOffset = 0;
  let greenOffset = channelSize;
  let blueOffset = channelSize * 2;
  let alphaOffset = channelSize * 3;
  let lwipBuffer = new Buffer(size);

  let frameNr = 0;
  let compressing = false;

  kinect.on('colorFrame', colorFrame => {
    if(compressing) {
      return;
    }
    compressing = true;
    console.log('send colorFrame', ++frameNr);
    //swap colorFrame to lwip buffer
    for(let i = 0; i < channelSize; i++) {
      lwipBuffer[i + redOffset] = colorFrame[i * 4];
      lwipBuffer[i + greenOffset] = colorFrame[i * 4 + 1];
      lwipBuffer[i + blueOffset] = colorFrame[i * 4 + 2];
      lwipBuffer[i + alphaOffset] = 100;
    }
    lwip.open(lwipBuffer, {width: w, height: h}, (err, image) => {
      if(err) {
        compressing = false;
        return;
      }
      image.batch()
        .toBuffer('jpg', { quality: 50 }, (err, buffer) => {
          if(err) {
            compressing = false;
            return;
          }
          for(let socketId in io.sockets.sockets) {
            io.sockets.sockets[socketId].volatile.emit('colorFrame', buffer);
          }
          compressing = false;
        });
    });
  });

  kinect.openColorReader();
}
