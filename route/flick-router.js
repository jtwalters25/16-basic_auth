'use strict';

const fs = require('fs');//native modules
const path = require('path');//extract file path
const del =require('del');
const AWS =require('aws-sdk');
const multer =require('multer');//handles extraction
const Router =require('express').Router;
const createError =require('http-errors');
const debug = require('debug')('cfgram:flick-router');

const Flick = require('../model/flick.js');//data models
const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const flickRouter = module.exports = Router();

function s3uploadProm(params) {
  debug('s3uploadProm');
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

flickRouter.post('/api/gallery/:galleryID/flick', bearerAuth, upload.single('image'), function(req, res, next){
  debug('POST: /api/gallery/:galleryID/flick');

  if(!req.file){
    return next(createError(400, 'file not found'));
  }

  if(!req.file.path){
    return next(createError(500, 'file not saved'));
  }

  let ext = path.extname(req.file.originalname);
  //method part of native js that will extract extension name


  let params = { //image URI that anyone can see
    Bucket: process.env.AWS_BUCKET,
    ACL: 'public-read', //save this image at this bucket
    Key: `${req.file.filename}${ext}`, //grabs hashed version of filename & add .png from above
    Body: fs.createReadStream(req.file.path) //where we read the image & send
  };

  Gallery.findById(req.params.galleryID)
  .then( () => s3uploadProm(params))
  .then( s3data => {
    del([`${dataDir}/*`]);
    let flickData = {
      name: req.body.name,
      desc: req.body.desc,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      userID: req.user._id,
      galleryID: req.params.galleryID
    };
    return new Flick(flickData).save();
  })
  .then( flick => res.json(flick))
  .catch( err => next(err));
});
