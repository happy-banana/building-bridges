var edge = require('../../nms/node_modules/edge');

var createKinect = edge.func(function () {/*
    using System;
    using System.Threading.Tasks;

    using System.Reflection;
    using System.IO;

    public class Startup
    {
      public async Task<object> Invoke(dynamic input)
      {
        var nodeKinect = new NodeKinect();
        return new {
          open = (Func<object,Task<object>>)(
            async (arg) =>
            {
              nodeKinect.Open();
              return true;
            }
          )
        };
      }
    }

    public class NodeKinect
    {

      private Assembly kinectDll;

      private Type KinectSensorType;
      private Object kinectSensor = null;

      private Object coordinateMapper = null;
      private Type BodyFrameSourceType = null;

      private Type BodyFrameReaderType = null;
      private Object bodyFrameReader = null;

      public NodeKinect()
      {
        try
        {
          kinectDll = Assembly.LoadFrom("C:\\Program Files\\Microsoft SDKs\\Kinect\\v2.0_1409\\Assemblies\\Microsoft.Kinect.dll");

          KinectSensorType = kinectDll.GetType("Microsoft.Kinect.KinectSensor");
          BodyFrameSourceType = kinectDll.GetType("Microsoft.Kinect.BodyFrameSource");
          BodyFrameReaderType = kinectDll.GetType("Microsoft.Kinect.BodyFrameReader");
        }
        catch (Exception e)
        {
          Console.Write(e.Message);
        }
      }

      public void Open()
      {
        this.kinectSensor =  KinectSensorType.GetMethod("GetDefault").Invoke(null, null);
        if (this.kinectSensor != null)
        {
          this.coordinateMapper = KinectSensorType.GetProperty("CoordinateMapper").GetValue(this.kinectSensor, null);
          KinectSensorType.GetMethod("Open").Invoke(this.kinectSensor, null);

          Object bodyFrameSource = KinectSensorType.GetProperty("BodyFrameSource").GetValue(this.kinectSensor, null);
          this.bodyFrameReader = BodyFrameSourceType.GetMethod("OpenReader").Invoke(bodyFrameSource, null);

          EventInfo evFrameArrived = BodyFrameReaderType.GetEvent("FrameArrived");
          Type tDelegate = evFrameArrived.EventHandlerType;
          MethodInfo miHandler = typeof(NodeKinect).GetMethod("BodyReader_FrameArrived", BindingFlags.NonPublic | BindingFlags.Instance);
          Delegate d = Delegate.CreateDelegate(tDelegate, this, miHandler);

          MethodInfo addHandler = evFrameArrived.GetAddMethod();
          Object[] addHandlerArgs = { d };
          addHandler.Invoke(this.bodyFrameReader, addHandlerArgs);
        }
      }

      private void BodyReader_FrameArrived(Object sender, EventArgs e)
      {
        Console.Write("BodyFrameArrived\n");
      }

    }
*/});

var kinect = createKinect(null, true);
kinect.open(null, true);

setTimeout(function(){
  console.log('done');
}, 2000);