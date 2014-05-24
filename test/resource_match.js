/* jshint node: true, esnext: true */

var t = require('./test_helper');
var assert = require('chai').assert;
var express = require('express');

var controller = t.controller;
var fn = t.fn;
var nextMiddleware = t.nextMiddleware;
var auth = t.auth;

var Resourceful = require('..');
var app = express();

var assertRequest = t.assertRequest(app);


describe('app.resourceMatch', function() {
  it('maps a single route', function(done) {
    app.resourceMatch(Resourceful.verbs.GET, '/users', fn);
    assertRequest('get', '/users', 200)
      .then(function(res) {
        done();
      })
      .catch(done);
  });

  it('supports middlewares', function(done) {
    app.resourceMatch(Resourceful.verbs.DELETE, '/users/:id', [nextMiddleware, auth, fn]);
    assertRequest('del', '/users/123', 401)
      .then(function(res) {
        done();
      })
      .catch(done);
  });
});

