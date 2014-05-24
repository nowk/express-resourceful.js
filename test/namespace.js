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

describe("namespace", function() {
  it('creates a namespace if no actions are provided', function(done) {
    app.resources('/api', function(api) {
      var posts = api.resources('/posts', controller);
      assert.equal(posts.path, '/api/posts');

      Q.all([
        assertRequest('get',    '/api/posts/',          200),
        assertRequest('get',    '/api/posts/new',       200),
        assertRequest('get',    '/api/posts/123',       {id: "123"}),
        assertRequest('post',   '/api/posts/',          200),
        assertRequest('get',    '/api/posts/123/edit',  200),
        assertRequest('put',    '/api/posts/123',       200),
        assertRequest('patch',  '/api/posts/123',       200),
        assertRequest('del',    '/api/posts/123',       200),
        assertRequest('get', '/api', 404)
      ])
      .then(function(results) {
        done();
      })
      .catch(done);
    });
  });
});

