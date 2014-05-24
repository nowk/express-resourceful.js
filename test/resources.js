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

describe("resources", function() {
  beforeEach(function() {
    app.resources('/posts', controller);
  });

  it('maps the default actions', function(done) {
    Q.all([
      assertRequest('get',    '/posts/',          200),
      assertRequest('get',    '/posts/new',       200),
      assertRequest('get',    '/posts/123',       200),
      assertRequest('post',   '/posts/',          200),
      assertRequest('get',    '/posts/123/edit',  200),
      assertRequest('put',    '/posts/123',       200),
      assertRequest('patch',  '/posts/123',       200),
      assertRequest('del',    '/posts/123',       200)
    ])
    .then(function(results) {
      done();
    })
    .catch(done);
  });
});

