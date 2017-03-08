'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const debug = require('debug')('cfgram:server');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const dotenv = require('dotenv');

const authRouter = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT || 8000;
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);
app.use(galleryRouter);
app.use(errors);

app.listen(PORT, () => {
  debug(`server up: ${PORT}`);
});
