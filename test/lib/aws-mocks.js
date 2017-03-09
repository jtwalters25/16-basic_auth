'use strict';

const AWS = require('aws-sdk-mock');

module.exports = exports = {};

exports.uploadMock = {
  ETag: '"1234abcd"',
  Location: 'http://mockurl.com/mock.png',
  Key: '1234.png',
  Key: '1234.png',
  Bucket: 'codefellowgram'
};

AWS.mock('S3', 'upload', function(params, callback){
  if(!params.ACL === 'public-read'){
    return callback(new Error('ACL must be public-read'));
  }

  if (!params.Bucket === 'codefellowgram'){
    return callback(new Error('bucket must be codefellowgram'));
  }

  if (!params.Key){
    return callback(new Error('key required'));
  }
  if (!params.Body){
    return callback(new Error('body required'));
  }
  callback (null, exports.uploadMock) ;

});
