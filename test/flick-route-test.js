'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('cfgram:flick-route-test');

const Flick = require('../model/flick.js');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;


const fakeUser = {
  username: 'fakeuser',
  password: '1234',
  email: 'fakeuser@test.com'
};

const fakeGallery = {
  name: 'test gallery',
  desc: 'test gallery description'
};

const fakeFlick = {
  name: 'test gallery',
  desc: 'test gallery description',
  image: `${__dirname}/data/tester.png`
};


describe('Flick Routes', function() {
  before( done => {
    serverToggle.serverOn(server, done);
  });
  // 
  // after( done => {
  //   serverToggle.serverOff(server, done);
  // });

  afterEach( done => {
    Promise.all([
      Flick.remove({}),
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/gallery/:id/flick', function() {
    describe('with a valid token and valid data', function() {
      before( done => {
        new User(fakeUser)
        .generatePasswordHash(fakeUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        fakeGallery.userID = this.tempUser._id.toString();
        new Gallery(fakeGallery).save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      after( done => {
        delete fakeGallery.userID;
        done();
      });

      it('should return a flick', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/flick`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', fakeFlick.name)
        .field('desc', fakeFlick.desc)
        .attach('image', fakeFlick.image)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(fakeFlick.name);
          expect(res.body.desc).to.equal(fakeFlick.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          done();
        });
      });
    });
  });
});
