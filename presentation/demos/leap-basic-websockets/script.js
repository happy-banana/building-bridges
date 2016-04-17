  (function(){
    ws = new WebSocket("ws://localhost:6437/");

    // On successful connection
    ws.onopen = function(event) {
      var enableMessage = JSON.stringify({enableGestures: true});
      ws.send(enableMessage); // Enable gestures
    };

    // On message received
    ws.onmessage = function(event) {
      var trackingdata = JSON.parse(event.data);
      console.log(trackingdata);
    };

    // On socket close
    ws.onclose = function(event) {
      ws = null;
    }

    // On socket error
    ws.onerror = function(event) {
      alert("Received error");
    };
  })();
