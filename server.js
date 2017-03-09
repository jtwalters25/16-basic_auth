'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const debug = require('debug')('cfgram:server');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const authRouter = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const flickRouter = require('./route/flick-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();
//wow

const PORT = process.env.PORT || 8000;
const app = express();

mongoose.connect(process.env.MONGODB_URI);

let morganFormat = process.env.PRODUCTION ? 'common' : 'dev';

app.use(cors());
app.use(morgan(morganFormat));

app.use(authRouter);
app.use(galleryRouter);
app.use(flickRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`server up: ${PORT}`);
});

server.isRunning = true;
