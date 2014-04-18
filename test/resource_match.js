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


describe('app.resourceMatch', function() {
  it('maps a single route', function(done) {
    app.resourceMatch(Resourceful.verbs.GET, '/users', fn);
    assertRequest('get', '/users', 200).then(done());
  });

  it('supports middlewares', function(done) {
    app.resourceMatch(Resourceful.verbs.DELETE, '/users/:id', [nextMiddleware, auth, fn]);
    assertRequest('del', '/users/123', 401).then(done());
  });
});

