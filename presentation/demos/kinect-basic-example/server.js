var Kinect2 = require('../../nms/node_modules/kinect2');
var kinect = new Kinect2();
if(kinect.open()) {
  console.log('kinect opened');
  kinect.on('bodyFrame', function(bodyFrame){
    console.log(bodyFrame);
  });
  kinect.openBodyReader();
  setTimeout(kinect.close.bind(kinect), 5000);
}