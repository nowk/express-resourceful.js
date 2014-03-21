/* jshint laxcomma: true, esnext: true, node: true */

var co = require('co');
var Q = require('q');
var assert = require('chai').assert;
var request = require('supertest');
var express = require('express');
var Resourceful = require('..');

var app = express();

var nextMiddleware = function(req, res, next) {
  next();
};

var authMiddleware = function(req, res, next) {
  res.send({}, 401);
};

var actionfn = function(req, res, next) {
  var params = {};
  for(var key in req.params) {
    params[key] = req.params[key];
  }
  res.send(params);
};

var controller = {
  index: actionfn,
  new: actionfn,
  create: actionfn,
  show: actionfn,
  edit: actionfn,
  update: actionfn,
  patch: actionfn,
  destroy: actionfn
};

var controllerWithMiddleware = {
  index: [authMiddleware, actionfn],
  new: [authMiddleware, actionfn],
  create: [authMiddleware, actionfn],
  show: [authMiddleware, actionfn]
};


describe('app.resources', function() {
  before(function() {
    app.resources('/posts', controller);
    app.resources('/comments', controllerWithMiddleware);
    app.resources('/', controller); // / should always be defined last
  });

  it('maps default CRUD routes', function(done) {
    co(function *() {
      yield assert_request('get',    '/',          200);
      yield assert_request('get',    '/new',       200);
      yield assert_request('get',    '/123',       200);
      yield assert_request('post',   '/',          200);
      yield assert_request('get',    '/123/edit',  200);
      yield assert_request('put',    '/123',       200);
      yield assert_request('patch',  '/123',       200);
      yield assert_request('del',    '/123',       200);

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

  it('supports middlewares', function(done) {
    co(function *() {
      yield assert_request('get',   '/comments',      401);
      yield assert_request('get',   '/comments/new',  401);
      yield assert_request('post',  '/comments',      401);
      done();
    })();
  });

  describe('nested resources', function() {
    before(function() {
      app.resources('/tasks', controller, function(tasks) {
        tasks.resources('/assignments', controller, function(assignments) {
          assignments.resources('/comments', controller);
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

    it('uses the singularized path as the prefix for the id param name', function(done) {
      co(function *() {
        yield assert_request('get', '/tasks/123/assignments', {task_id: '123'});
        yield assert_request('get', '/tasks/123/assignments/456/comments', 
          {task_id: '123', assignment_id: '456'});

        yield assert_request('get', '/tasks/123/assignments/456/comments/789', 
          {task_id: '123', assignment_id: '456', id: '789'});

        done();
      })();
    });
  });
});

describe('app.resourceMatch', function() {
  before(function() {
    app.resourceMatch(Resourceful.verbs.GET, '/users', actionfn);
    app.resourceMatch(Resourceful.verbs.DELETE, '/users/:id', [nextMiddleware, authMiddleware, actionfn]);
  });

  it('maps a single route', function(done) {
    assert_request('get', '/users', 200).then(function(res) {
      done();
    });
  });

  it('supports middlewares', function(done) {
    assert_request('del', '/users/123', 401).then(function(res) {
      done();
    });
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
