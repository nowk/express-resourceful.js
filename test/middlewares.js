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

describe("middlewares", function() {
  'use strict';

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

    co(function *() {
      yield assertRequest('get',   '/comments',      401);
      yield assertRequest('get',   '/comments/new',  200);
      yield assertRequest('post',  '/comments',      401);
      yield assertRequest('get',   '/user/edit',     401);
      yield assertRequest('get',   '/user/new',      200);
      yield assertRequest('del',   '/user',          401);
      done();
    })();
  });
});

