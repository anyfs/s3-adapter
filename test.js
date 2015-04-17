'use strict';

var AnyFS = require('anyfs');
var test = require('anyfs').test;
var Adapter = require('./');

var secret = require('./.secret.json');
var adapter = new Adapter(secret);

var fs = new AnyFS(adapter);

AnyFS.test(fs);