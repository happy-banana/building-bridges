import $ from 'jquery';
import bean from 'bean';
import io from 'socket.io-client';
import _ from 'lodash';

window.$ = window.jQuery = $;
window.bean = bean;
window.io = io;
window._ = _;

window.Tether = require('tether');
require('../../vendors/bootstrap-4.0.0-alpha.2/dist/js/bootstrap');

window.CodeMirror = require('../../vendors/codemirror/lib/codemirror.js');
require('../../vendors/codemirror/mode/javascript/javascript.js');
require('../../vendors/codemirror/mode/htmlmixed/htmlmixed.js');
require('../../vendors/codemirror/mode/clike/clike.js');
require('../../vendors/codemirror/addon/hint/show-hint.js');
require('../../vendors/codemirror/addon/hint/javascript-hint.js');

require('../../vendors/split-pane.js');
