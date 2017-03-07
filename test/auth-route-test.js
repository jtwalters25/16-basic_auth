'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const fakeUser = {
  username: 'fakeuser',
  password: '1234',
  email: 'fakeuser@test.com'
};


describe('Authorization Routes', function() {
  describe('POST: /api/signup', function(){
    describe('with a valid body', function(){
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(fakeUser)
        .end((err, res) => {
          if (err) return done(err);
          console.log('token:', res.text);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('with invalid body', function(){
      it('should return an 400 error', done => {
        request.post(`${url}/api/signup`)
        .send('invalidbody')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET: /api/signin', function() {
    describe('with a valid body', function() {
      before ( done => {
        let user = new User(fakeUser);
        user.generatePasswordHash(fakeUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth('fakeuser', '1234')
        .end((err, res) => {
          if (err) return done(err);
          console.log('user:', this.tempUser);
          console.log('token:', res.text);
          expect(res.status).to.equal(200);
          done();
        });
      });


      describe('user could not be authenticated', function(){
        it('should return a 401 error', done => {
          request.get(`${url}/api/signin`)
          .auth('fakeuser', 'wrong')
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
        });
      });
    });
  });
});
