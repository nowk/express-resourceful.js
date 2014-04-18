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

describe("namespace", function() {
  "use strict";

  it('creates a namespace if no actions are provided', function(done) {
    app.resources('/api', function(api) {
      let posts = api.resources('/posts', controller);
      assert.equal(posts.path, '/api/posts');

      co(function *() {
        yield assertRequest('get',    '/api/posts/',          200);
        yield assertRequest('get',    '/api/posts/new',       200);
        yield assertRequest('get',    '/api/posts/123',       {id: "123"});
        yield assertRequest('post',   '/api/posts/',          200);
        yield assertRequest('get',    '/api/posts/123/edit',  200);
        yield assertRequest('put',    '/api/posts/123',       200);
        yield assertRequest('patch',  '/api/posts/123',       200);
        yield assertRequest('del',    '/api/posts/123',       200);

        yield assertRequest('get', '/api', 404);
        done();
      })();
    });
  });
});

