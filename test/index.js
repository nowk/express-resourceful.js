/* jshint laxcomma: true, esnext: true, node: true */

const co = require('co');
const Q = require('q');
const assert = require('chai').assert;
const request = require('supertest');
const express = require('express');

const Resourceful = require('..');
const app = express();


describe('#resources', function() {

  'use strict';

  let controller = {
    index: fn,
    new: fn,
    create: fn,
    show: fn,
    edit: fn,
    update: fn,
    patch: fn,
    destroy: fn
  };

  it('maps the default actions', function(done) {
    app.resources('/posts', controller);

    co(function *() {
      yield assert_request('get',    '/posts/',          200);
      yield assert_request('get',    '/posts/new',       200);
      yield assert_request('get',    '/posts/123',       200);
      yield assert_request('post',   '/posts/',          200);
      yield assert_request('get',    '/posts/123/edit',  200);
      yield assert_request('put',    '/posts/123',       200);
      yield assert_request('patch',  '/posts/123',       200);
      yield assert_request('del',    '/posts/123',       200);
      done();
    })();
  });

  it('middlewares', function(done) {
    app.resources('/comments', {
      index:   [auth, fn],
      new:     fn,
      create:  [auth, fn]
    });

    co(function *() {
      yield assert_request('get',   '/comments',      401);
      yield assert_request('get',   '/comments/new',  200);
      yield assert_request('post',  '/comments',      401);
      done();
    })();
  });

  describe('nested resources', function() {
    let assignmentsResources;
    let commentsResources;

    before(function() {
      app.resources('/tasks', controller, function(tasks) {
        assignmentsResources = tasks.resources('/assignments', controller, function(assignments) {
          commentsResources = assignments.resources('/comments', controller);
        });
      });
    });

    it('creates nested routes', function(done) {
      co(function *() {
        yield assert_request('get',    '/tasks/123/assignments',           200);
        yield assert_request('get',    '/tasks/123/assignments/new',       200);
        yield assert_request('post',   '/tasks/123/assignments',           200);
        yield assert_request('get',    '/tasks/123/assignments/456',       200);
        yield assert_request('get',    '/tasks/123/assignments/456/edit',  200);
        yield assert_request('put',    '/tasks/123/assignments/456',       200);
        yield assert_request('patch',  '/tasks/123/assignments/456',       200);
        yield assert_request('del',    '/tasks/123/assignments/456',       200);
        done();
      })();
    });

    it('creates nested nested routes, and so on', function(done) {
      co(function *() {
        yield assert_request('get',    '/tasks/123/assignments/456/comments',           200);
        yield assert_request('get',    '/tasks/123/assignments/456/comments/new',       200);
        yield assert_request('post',   '/tasks/123/assignments/456/comments',           200);
        yield assert_request('get',    '/tasks/123/assignments/456/comments/789',       200);
        yield assert_request('get',    '/tasks/123/assignments/456/comments/789/edit',  200);
        yield assert_request('put',    '/tasks/123/assignments/456/comments/789',       200);
        yield assert_request('patch',  '/tasks/123/assignments/456/comments/789',       200);
        yield assert_request('del',    '/tasks/123/assignments/456/comments/789',       200);
        done();
      })();
    });

    it('uses the singularized namespace as the prefix for the id param name', function(done) {
      assert.equal(assignmentsResources.path, '/tasks/:task_id/assignments');
      assert.equal(commentsResources.path, '/tasks/:task_id/assignments/:assignment_id/comments');
      assert_request('get', '/tasks/123/assignments/456/comments/789',
        {task_id: '123', assignment_id: '456', id: '789'}).then(done());
    });
  });

  it('namespaces if no actions are provided', function(done) {
    app.resources('/api', function(api) {
      let posts = api.resources('/posts', controller);
      assert.equal(posts.path, '/api/posts');

      co(function *() {
        yield assert_request('put', '/api/posts/123', {id: '123'});
        yield assert_request('get', '/api', 404);
        done();
      })();
    });
  });

  // This causes some trouble. Any route set after
  // will get caught by this and return false postives
  //
  // it('maps default actions on root', function(done) {
  //   app.resources('/', controller);

  //   co(function *() {
  //     yield assert_request('get',    '/',          200);
  //     yield assert_request('get',    '/new',       200);
  //     yield assert_request('get',    '/123',       200);
  //     yield assert_request('post',   '/',          200);
  //     yield assert_request('get',    '/123/edit',  200);
  //     yield assert_request('put',    '/123',       200);
  //     yield assert_request('patch',  '/123',       200);
  //     yield assert_request('del',    '/123',       200);
  //     done();
  //   })();
  // });
});

describe('app.resourceMatch', function() {
  it('maps a single route', function(done) {
    app.resourceMatch(Resourceful.verbs.GET, '/users', fn);
    assert_request('get', '/users', 200).then(done());
  });

  it('supports middlewares', function(done) {
    app.resourceMatch(Resourceful.verbs.DELETE, '/users/:id', [nextMiddleware, auth, fn]);
    assert_request('del', '/users/123', 401).then(done());
  });
});


/*
 * assert request
 */

function assert_request(method, path, status) {
  var defer = Q.defer();

  request(app)[method](path)
    .expect(status)
    .end(function(err, res) {
      if (err) throw err;
      defer.resolve(res);
    });

  return defer.promise;
}


/*
 * just next
 */

function nextMiddleware(req, res, next) {
  next();
}


/*
 * mimic failed auth middleware
 */

function auth(req, res, next) {
  res.send({}, 401);
}


/*
 * middleware acts as action sends params back as body
 */

function fn(req, res, next) {

  'use strict';

  let params = {};

  for(let key in req.params) {
    params[key] = req.params[key];
  }

  res.send(params);
}

