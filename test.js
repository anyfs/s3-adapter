'use strict';

var AnyFS = require('anyfs');
var test = require('anyfs').test;
var Adapter = require('./');

var secret = require('./.secret.json');
var adapter = new Adapter(secret);

var fs = new AnyFS(adapter);

AnyFS.test(fs);
// adapter.s3.headObject({
//     Bucket: secret.bucket,
//     Key: 'test/'
// }, function(err, data) {
//     console.log(err, data);
// });

// // AnyFS.test(fs);
// adapter.s3.listObjects({
//     Bucket: secret.bucket,
//     Prefix: 'testt'
// }, function(err, data) {
//     console.log(err, data);
// });