var tap = require('tap')
var assert = require('chai').assert;
var Test = require('../lib/fn-obj');
var Promise  = require('promise-polyfill');
var Observable = require("zen-observable");
var through = require('through');
var cp = require('child_process');
var runFn = require('../lib/run-fn');
var test = tap.test;
var noop = function() {};
