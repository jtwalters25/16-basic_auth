'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema
const flickSchema = Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true },//make sure its part of the correct gallery
  galleryID: { type: Schema.Types.ObjectId, required: true },
  imageURI: { type: String, required: true, unique: true },//what comes back from s3
  objectKey: { type: String, required: true, unique: true },//also comes back from s3
  created: { type: Date, default: Date.now }
});

module.exports= mongoose.model('flick', flickSchema);
