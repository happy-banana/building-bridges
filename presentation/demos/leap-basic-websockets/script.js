'use strict';

(() => {
  let ws = new WebSocket("ws://localhost:6437/");

  // On successful connection
  ws.onopen = event => {
    let enableMessage = JSON.stringify({enableGestures: true});
    ws.send(enableMessage); // Enable gestures
  };

  // On message received
  ws.onmessage = event => {
    let trackingdata = JSON.parse(event.data);
    console.log(trackingdata);
  };

  // On socket close
  ws.onclose = event => {
    ws = null;
  }

  // On socket error
  ws.onerror = event => {
    alert("Received error");
  };
})();
