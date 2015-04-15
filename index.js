'use strict';

var AWS = require('aws-sdk');

module.exports = Adapter;

function Adapter(options) {
    this.options = options;
    this.s3 = new AWS.S3(options);
}

Adapter.prototype.metadata = function(p, cb) {
};