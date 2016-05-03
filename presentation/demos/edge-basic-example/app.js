'use strict';

let edge = require('../../nms/node_modules/edge');

const hello = edge.func(() => {/*
 async (input) =>
 {
   return ".NET welcomes " + input.ToString();
 }
*/});

hello('Node.js', (error, result) => {
 if (error) throw error;
 console.log(result);
});
