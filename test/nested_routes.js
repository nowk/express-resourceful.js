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


describe("nested routes", function() {
  "use strict";

  let assignmentsResources;
  let commentsResources;

  before(function() {
    app.resources('/tasks', controller, function(tasks) {
      assignmentsResources = tasks.resources('/assignments', controller, function(assignments) {
        commentsResources = assignments.resources('/comments', controller);
      });
    });
  });

  it("can be nested to resources", function(done) {
    co(function *() {
      yield assertRequest('get',    '/tasks/123/assignments',           200);
      yield assertRequest('get',    '/tasks/123/assignments/new',       200);
      yield assertRequest('post',   '/tasks/123/assignments',           200);
      yield assertRequest('get',    '/tasks/123/assignments/456',       200);
      yield assertRequest('get',    '/tasks/123/assignments/456/edit',  200);
      yield assertRequest('put',    '/tasks/123/assignments/456',       200);
      yield assertRequest('patch',  '/tasks/123/assignments/456',       200);
      yield assertRequest('del',    '/tasks/123/assignments/456',       200);
      done();
    })();
  });

  it("can be more than one level deep", function(done) {
    co(function *() {
      yield assertRequest('get',    '/tasks/123/assignments/456/comments',           200);
      yield assertRequest('get',    '/tasks/123/assignments/456/comments/new',       200);
      yield assertRequest('post',   '/tasks/123/assignments/456/comments',           200);
      yield assertRequest('get',    '/tasks/123/assignments/456/comments/789',       200);
      yield assertRequest('get',    '/tasks/123/assignments/456/comments/789/edit',  200);
      yield assertRequest('put',    '/tasks/123/assignments/456/comments/789',       200);
      yield assertRequest('patch',  '/tasks/123/assignments/456/comments/789',       200);
      yield assertRequest('del',    '/tasks/123/assignments/456/comments/789',       200);
      done();
    })();
  });

  it('uses the singularized namespace as the prefix for the id param name', function(done) {
    assert.equal(assignmentsResources.path, '/tasks/:task_id/assignments');
    assert.equal(commentsResources.path, '/tasks/:task_id/assignments/:assignment_id/comments');
    assertRequest('get', '/tasks/123/assignments/456/comments/789', {
      task_id: '123', 
      assignment_id: '456', 
      id: '789'})
    .then(done());
  });

  it("can be nested to a singular resource", function(done) {
    var accountResource = app.resource('/account', controller);
    var projectResources = accountResource.resources('/projects', controller);
    var taskResources = projectResources.resources('/tasks', controller);

    assert.equal(accountResource.path, '/account');
    assert.equal(projectResources.path, '/account/projects');
    assert.equal(taskResources.path, '/account/projects/:project_id/tasks');

    co(function *() {
      yield assertRequest('get',    '/account/projects',           200);
      yield assertRequest('get',    '/account/projects/new',       200);
      yield assertRequest('post',   '/account/projects/',          200);
      yield assertRequest('get',    '/account/projects/123',       {id: '123'});
      yield assertRequest('get',    '/account/projects/123/edit',  200);
      yield assertRequest('put',    '/account/projects/123',       200);
      yield assertRequest('patch',  '/account/projects/123',       200);
      yield assertRequest('del',    '/account/projects/123',       200);

      yield assertRequest('get',    '/account',       200);
      yield assertRequest('get',    '/account/new',   200);
      yield assertRequest('post',   '/account',       200);
      yield assertRequest('get',    '/account/edit',  200);
      yield assertRequest('put',    '/account',       200);
      yield assertRequest('patch',  '/account',       200);
      yield assertRequest('del',    '/account',       200);

      yield assertRequest('get',    '/account/projects/123/tasks',           200);
      yield assertRequest('get',    '/account/projects/123/tasks/new',       200);
      yield assertRequest('post',   '/account/projects/123/tasks/',          200);
      yield assertRequest('get',    '/account/projects/123/tasks/456',       {
        project_id: '123',
        id: '456'
      });
      yield assertRequest('get',    '/account/projects/123/tasks/456/edit',  200);
      yield assertRequest('put',    '/account/projects/123/tasks/456',       200);
      yield assertRequest('patch',  '/account/projects/123/tasks/456',       200);
      yield assertRequest('del',    '/account/projects/123/tasks/456',       200);
      done();
    })();
  });
});

