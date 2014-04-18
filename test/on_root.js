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

describe("on root", function() {
  before(function() {
    app.resources('/', controller);
  });

  it('maps default actions on root', function(done) {
    co(function *() {
      yield assertRequest('get',    '/',          200);
      yield assertRequest('get',    '/new',       200);
      yield assertRequest('get',    '/123',       200);
      yield assertRequest('post',   '/',          200);
      yield assertRequest('get',    '/123/edit',  200);
      yield assertRequest('put',    '/123',       200);
      yield assertRequest('patch',  '/123',       200);
      yield assertRequest('del',    '/123',       200);
      done();
    })();
  });

  it("should be the last resource defined to avoid name collision", function(done) {
    app.resources("/posts", controller);

    co(function *() {
      yield assertRequest("get", "/posts", {id: "posts"});
      done();
    })();
  });
});

