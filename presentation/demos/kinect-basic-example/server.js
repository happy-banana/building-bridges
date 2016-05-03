'use strict';

const Kinect2 = require('../../nms/node_modules/kinect2');

let kinect = new Kinect2();
if(kinect.open()) {
  console.log('kinect opened');
  kinect.on('bodyFrame', bodyFrame => {
    console.log(bodyFrame);
  });
  kinect.openBodyReader();
  setTimeout(kinect.close.bind(kinect), 5000);
}