# anyfs-s3-adapter

[![npm](https://img.shields.io/npm/v/anyfs-s3-adapter.svg?style=flat-square)](https://www.npmjs.com/package/anyfs-s3-adapter)
[![npm](https://img.shields.io/npm/dm/anyfs-s3-adapter.svg?style=flat-square)](https://www.npmjs.com/package/anyfs-s3-adapter)
![npm](https://img.shields.io/npm/l/anyfs-s3-adapter.svg?style=flat-square)

AWS S3 adapter for AnyFS

## Usage


```js
var AnyFS = require('anyfs');
var Adapter = require('anyfs-s3-adapter');
var adapter = new Adapter({
    "accessKeyId": "AWS access key",
    "secretAccessKey": "AWS secret",
    "region": "S3 region",
    "bucket": "S3 bucket"
});

var fs = new AnyFS(adapter);

fs.list('/dir', function(err, list) {
    console.log(list);
});
```

## Test

Create `.secret.json` with credentials of your AWS S3 bucket:

```json
{
    "accessKeyId": "AWS access key",
    "secretAccessKey": "AWS secret",
    "region": "S3 region",
    "bucket": "S3 bucket"
}
```

Then run:

```
npm install
npm test
```

## Reference

[S3 API](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property)