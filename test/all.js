/* jshint node: true */

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

describe("all", function() {
  this._timeout = 9999;

  it("runs `all` actions before all other actions", function(done) {
    app.resources("/posts", {
      all: auth,
      new: fn,
      create: fn
    }, function(posts) {
      posts.resources("/comments", {new: fn});
    });

    app.resource("/accounts", {
      all: [nextMiddleware, auth],
      new: fn,
      create: fn
    }, function(accounts) {
      accounts.resources("/projects", {new: fn});
    });

    Q.all([
      assertRequest("get",   "/posts/new",               401),
      assertRequest("post",  "/posts",                   401),
      assertRequest("get",   "/posts/123/comments/new",  401),
      assertRequest("get",   "/accounts/new",            401),
      assertRequest("post",  "/accounts",                401),
      assertRequest("get",   "/accounts/projects/new",   401)
    ])
    .then(function(results) {
      done();
    })
    .catch(done);
  });
});

