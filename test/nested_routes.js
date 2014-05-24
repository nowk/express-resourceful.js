/* jshint node: true, esnext: true */

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


describe("nested routes", function() {
  var assignmentsResources;
  var commentsResources;

  before(function() {
    app.resources('/tasks', controller, function(tasks) {
      assignmentsResources = tasks.resources('/assignments', controller, function(assignments) {
        commentsResources = assignments.resources('/comments', controller);
      });
    });
  });

  it("can be nested to resources", function(done) {
    Q.all([
      assertRequest('get',    '/tasks/123/assignments',           200),
      assertRequest('get',    '/tasks/123/assignments/new',       200),
      assertRequest('post',   '/tasks/123/assignments',           200),
      assertRequest('get',    '/tasks/123/assignments/456',       200),
      assertRequest('get',    '/tasks/123/assignments/456/edit',  200),
      assertRequest('put',    '/tasks/123/assignments/456',       200),
      assertRequest('patch',  '/tasks/123/assignments/456',       200),
      assertRequest('del',    '/tasks/123/assignments/456',       200)
    ])
    .then(function(results) {
      done();
    })
    .catch(done);
  });

  it("can be more than one level deep", function(done) {
    Q.all([
      assertRequest('get',    '/tasks/123/assignments/456/comments',           200),
      assertRequest('get',    '/tasks/123/assignments/456/comments/new',       200),
      assertRequest('post',   '/tasks/123/assignments/456/comments',           200),
      assertRequest('get',    '/tasks/123/assignments/456/comments/789',       200),
      assertRequest('get',    '/tasks/123/assignments/456/comments/789/edit',  200),
      assertRequest('put',    '/tasks/123/assignments/456/comments/789',       200),
      assertRequest('patch',  '/tasks/123/assignments/456/comments/789',       200),
      assertRequest('del',    '/tasks/123/assignments/456/comments/789',       200)
    ])
    .then(function(results) {
      done();
    })
    .catch(done);
  });

  it('uses the singularized namespace as the prefix for the id param name', function(done) {
    assert.equal(assignmentsResources.path, '/tasks/:task_id/assignments');
    assert.equal(commentsResources.path, '/tasks/:task_id/assignments/:assignment_id/comments');
    assertRequest('get', '/tasks/123/assignments/456/comments/789', {
      task_id: '123',
      assignment_id: '456',
      id: '789'})
    .then(function() {
      done();
    });
  });

  it("can be nested to a singular resource", function(done) {
    var accountResource = app.resource('/account', controller);
    var projectResources = accountResource.resources('/projects', controller);
    var taskResources = projectResources.resources('/tasks', controller);

    assert.equal(accountResource.path, '/account');
    assert.equal(projectResources.path, '/account/projects');
    assert.equal(taskResources.path, '/account/projects/:project_id/tasks');

    Q.all([
      assertRequest('get',    '/account/projects',           200),
      assertRequest('get',    '/account/projects/new',       200),
      assertRequest('post',   '/account/projects/',          200),
      assertRequest('get',    '/account/projects/123',       {id: '123'}),
      assertRequest('get',    '/account/projects/123/edit',  200),
      assertRequest('put',    '/account/projects/123',       200),
      assertRequest('patch',  '/account/projects/123',       200),
      assertRequest('del',    '/account/projects/123',       200),

      assertRequest('get',    '/account',       200),
      assertRequest('get',    '/account/new',   200),
      assertRequest('post',   '/account',       200),
      assertRequest('get',    '/account/edit',  200),
      assertRequest('put',    '/account',       200),
      assertRequest('patch',  '/account',       200),
      assertRequest('del',    '/account',       200),

      assertRequest('get',    '/account/projects/123/tasks',           200),
      assertRequest('get',    '/account/projects/123/tasks/new',       200),
      assertRequest('post',   '/account/projects/123/tasks/',          200),
      assertRequest('get',    '/account/projects/123/tasks/456',       {
        project_id: '123',
        id: '456'
      }),
      assertRequest('get',    '/account/projects/123/tasks/456/edit',  200),
      assertRequest('put',    '/account/projects/123/tasks/456',       200),
      assertRequest('patch',  '/account/projects/123/tasks/456',       200),
      assertRequest('del',    '/account/projects/123/tasks/456',       200)
    ])
    .then(function(results) {
      done();
    })
    .catch(done);
  });
});

