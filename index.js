'use strict';

var path = require('path');
var AWS = require('aws-sdk');
var PassThrough = require('stream').PassThrough;

module.exports = Adapter;

function error(code, message) {
    var err = new Error(message);
    err.code = code;

    return err;
}

function parseError(err) {
    if (!err) {
        return null;
    }

    if (err.statusCode === 404) {
        return error('ENOENT');
    }

    return err;
}

function parseMetadata(p, data) {
    var isDir = p.substr(-1) === '/';
    var name = path.basename(p);
    var metadata = {
        name: name,
        is_dir: isDir,
        time: data.LastModified,
    };

    if (!isDir) {
        metadata.size = data.ContentLength;
    }

    return metadata;
}

function Adapter(options) {
    this.options = options || {};
    this.options.params = this.options.params || {};
    this.options.params.Bucket = this.options.params.Bucket || this.options.bucket;

    this.s3 = new AWS.S3(options);
}

Adapter.prototype.features = {};

Adapter.prototype.metadata = function(p, cb) {
    if (p === '/') {
        return cb(null, {
            is_dir: true
        });
    }

    p = p.substr(1);

    var self = this;
    this.s3.headObject({
        Key: p,
    }, function(err, data) {
        if (!err) {
            cb(null, parseMetadata(p, data));
        } else if (err.statusCode === 404) {
            // try directory
            self.s3.listObjects({
                Prefix: p + '/',
                MaxKeys: 1,
            }, function(err, data) {
                if (err) {
                    return cb(parseError(err));
                }

                if (data.Contents.length > 0) {
                    return cb(null, {
                        name: path.basename(p),
                        is_dir: true,
                    });
                }

                cb(error('ENOENT'));
            });
        } else {
            cb(parseError(err));
        }
    });
};

Adapter.prototype.list = function(p, cb) {
    p = p.substr(1);
    this.s3.listObjects({
        Prefix: p,
        Delimiter: '/',
    }, function(err, data) {
        if (err) {
            return cb(parseError(err));
        }

        var list = []
        for (var i = 0, length = data.Contents.length; i < length; i++) {
            var item = data.Contents[i];
            // ignore .
            if (item.Key === p + '/') {
                continue;
            }

            var metadata = parseMetadata(item.Key, item);
            list.push(metadata);
        }

        cb(null, list);
    });
};

Adapter.prototype.mkdir = function(p, cb) {
    p = p.substr(1);
    this.s3.putObject({
        Key: p + '/',
        Body: '',
    }, function(err, data) {
        cb(parseError(err));
    })
};

Adapter.prototype.features.DELETE_RECURSIVE = true;
Adapter.prototype.delete = function(p, cb) {
    p = p.substr(1);
    var self = this;
    this.s3.headObject({
        Key: p
    }, function(err, data) {
        if (!err) {
            self.s3.deleteObject({
                Key: p,
            }, function(err) {
                cb(parseError(err));
            });
            return;
        }

        if (err.statusCode !== 404) {
            return cb(parseError(err));
        }

        // try remove directory
        // list by prefix, and delete all
        self.s3.listObjects({
            Prefix: p + '/'
        }, function(err, data) {
            if (err) {
                return cb(parseError(err));
            }

            if (data.Contents.length === 0) {
                return cb();
            }

            var keys = [];
            for (var i = 0, length = data.Contents.length; i < length; i++) {
                keys.push({
                    Key: data.Contents[i].Key
                });
            }

            self.s3.deleteObjects({
                Delete: {
                    Objects: keys,
                }
            }, function(err, data) {
                cb(parseError(err));
            });
        });
    });
};

// FIXME: consider directory
Adapter.prototype.move = function(a, b, cb) {
    a = a.substr(1);
    b = b.substr(1);

    this.s3.copyObject({
        CopySource: a, 
        Key: b,
    }, function(err, data) {
        cb(parseError(err));
    });
};

Adapter.prototype.createReadStream = function(p, cb) {
    p = p.substr(1);
    return this.s3.getObject({
        Key: p
    }).createReadStream();
};

// TODO: write stream
// Adapter.prototype.createWriteStream = function(p, cb) {
//     p = p.substr(1);
//     var pt = new PassThrough();
//     this.s3.upload({
//         Key: p,
//         Body: pt
//     });

//     return pt;
// };

Adapter.prototype.writeFile = function(p, data, cb) {
    p = p.substr(1);
    this.s3.putObject({
        Key: p,
        Body: data
    }, function(err, data) {
        cb(parseError(err));
    });
};