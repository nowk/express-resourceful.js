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


describe("resources", function() {
  'use strict';

  beforeEach(function() {
    app.resources('/posts', controller);
  });

  it('maps the default actions', function(done) {
    co(function *() {
      yield assertRequest('get',    '/posts/',          200);
      yield assertRequest('get',    '/posts/new',       200);
      yield assertRequest('get',    '/posts/123',       200);
      yield assertRequest('post',   '/posts/',          200);
      yield assertRequest('get',    '/posts/123/edit',  200);
      yield assertRequest('put',    '/posts/123',       200);
      yield assertRequest('patch',  '/posts/123',       200);
      yield assertRequest('del',    '/posts/123',       200);
      done();
    })();
  });
});

