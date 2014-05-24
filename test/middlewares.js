/* jshint node: true, esnext: true */

var t = require('./test_helper');
var Q = require('q');
var assert = require('chai').assert;
var express = require('express');

var controller = t.controller;
var fn = t.fn;
var nextMiddleware = t.nextMiddleware;
var auth = t.auth;

var Resourceful = require('..');
var app = express();

var assertRequest = t.assertRequest(app);

describe("middlewares", function() {
  this._timeout = 9999;

  it("can be passed in as part of the route function", function(done) {
    app.resources('/comments', {
      index: [auth, fn],
      new: fn,
      create: [auth, fn]
    });

    app.resource("/user", {
      edit: [auth, fn],
      new: fn,
      destroy: [auth, fn]
    });

    Q.all([
      assertRequest('get',   '/comments',      401),
      assertRequest('get',   '/comments/new',  200),
      assertRequest('post',  '/comments',      401),
      assertRequest('get',   '/user/edit',     401),
      assertRequest('get',   '/user/new',      200),
      assertRequest('del',   '/user',          401)
    ])
    .then(function(results) {
      done();
    })
    .catch(done);
  });
});

