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

describe("on root", function() {
  before(function() {
    app.resources('/', controller);
  });

  it('maps default actions on root', function(done) {
    Q.all([
      assertRequest('get',    '/',          200),
      assertRequest('get',    '/new',       200),
      assertRequest('get',    '/123',       200),
      assertRequest('post',   '/',          200),
      assertRequest('get',    '/123/edit',  200),
      assertRequest('put',    '/123',       200),
      assertRequest('patch',  '/123',       200),
      assertRequest('del',    '/123',       200)
    ])
    .then(function(results) {
      done();
    })
    .catch(done);
  });

  it("should be the last resource defined to avoid name collision", function(done) {
    app.resources("/posts", controller);
    assertRequest("get", "/posts", {id: "posts"})
      .then(function(results) {
        done();
      })
      .catch(done);
  });
});

