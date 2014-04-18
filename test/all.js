/* jshint node: true, esnext: true */

const t = require('./test_helper');
const co = require('co');
const Q = require('q');
const assert = require('chai').assert;
const express = require('express');

const controller = t.controller;
const fn = t.fn;
const nextMiddleware = t.nextMiddleware;
const auth = t.auth;

const Resourceful = require('..');
const app = express();

const assertRequest = t.assertRequest(app);


describe("all", function() {
  "use strict";

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

    co(function *() {
      yield assertRequest("get",   "/posts/new",               401);
      yield assertRequest("post",  "/posts",                   401);
      yield assertRequest("get",   "/posts/123/comments/new",  401);
      yield assertRequest("get",   "/accounts/new",            401);
      yield assertRequest("post",  "/accounts",                401);
      yield assertRequest("get",   "/accounts/projects/new",   401);
      done();
    })();
  });
});

