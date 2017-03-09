'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

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

mongoose.Promise = Promise;

describe('Gallery Routes', function(){
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove([])
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/gallery', () => {
    describe('with a valid body', () => {
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

      it('should return a gallery', done => {
        request.post(`${url}/api/gallery`)
        .send(fakeGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(fakeGallery.name);
          expect(res.body.desc).to.equal(fakeGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('Invalid Date');
          done();
        });
      });
      describe('with invalid body', function(){
        before(done => {
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
          .catch();
        });

        it('should return a 400 for bad request', done => {
          request.post(`${url}/api/gallery`)
          .send({})
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            expect(res.status).to.equal(400);
            done();
          });
        });

        describe('if no token found', () => {
          it('should return a 401 status code', done => {
            request.post(`${url}/api/gallery`)
            .send(fakeGallery)
            .set({})
            .end((err, res) => {
              expect(res.status).to.equal(401);
              done();
            });
          });
        });
      });
    });
  });

  describe('GET: /api/gallery/:id', () => {
    before( done => {
      new User (fakeUser)
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

    before ( done => {
      fakeGallery.userID = this.tempUser._id.toString();
      new Gallery(fakeGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    after( () => {
      delete fakeGallery.userID;
    });

    it('should return a gallery', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if(err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(fakeGallery.name);
        expect(res.body.desc).to.equal(fakeGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    describe('with invalid request if id not found', () => {
      it('should return a 404 status', done => {
        request.get(`${url}/api/gallery/`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('invalid if no token found', () => {
      it('should return a 401 status', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('PUT /api/gallery/:id', function() {
    before( done => {
      new User(fakeUser)
      .generatePasswordHash(fakeUser.password)
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

      this.tempGallery = new Gallery(fakeGallery);
      this.tempGallery.userID = this.tempUser._id;
      this.tempGallery.save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    describe('with valid token', () => {
      describe('with valid body', () => {
        it('should return updated gallery', done => {
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({name: 'updatedName', desc: 'updatedDesc'})
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal('test gallery');
            expect(res.body.desc).to.equal('test gallery description');
            expect(res.body.userID).to.equal(this.tempUser._id.toString());
            done();
          });
        });
      });
      describe('with an invalid body', () => {
        it('should return a 400 error', done => {
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({ NahName:'blahwrong', DuhDesc:'wrongupdate'})
          .end((err, res) => {
            expect(res.status).to.equal(400);
            done();
          });
        });
      });

      describe('with an unfound gallery ID', () => {
        it('should return a 404', done => {
          request.put(`${url}/api/gallery/`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({name: 'no dice', desc: 'no luck'})
          .end((err, res) => {
            expect(err.message).to.equal('Not Found');
            expect(res.status).to.equal(404);
            done();
          });
        });
      });
    });
    describe('with an invalid token', () => {
      it('should return a 401 error', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: 'Bear claws'
        })
        .send({name: 'nope', desc:'nada'})
        .end((err, res) => {
          expect(err.message).to.equal('Unauthorized');
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
});
