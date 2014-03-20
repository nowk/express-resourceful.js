/* jshint laxcomma: true, node: true */

var express = require('express');
var app = express.application;


/*
 * crud actions
 *
 * [name, verb, path]
 */

var defaultActions = [
  ['index',    'get',     '/'],
  ['new',      'get',     '/new'],
  ['show',     'get',     '/:id'],
  ['create',   'post',    '/'],
  ['edit',     'get',     '/:id/edit'],
  ['update',   'put',     '/:id'],
  ['patch',    'patch',   '/:id'],
  ['destroy',  'delete',  '/:id']
];


/*
 * expose Resoureful
 */

module.exports = exports = Resourceful;


/*
 * http verbs
 */

Resourceful.verbs = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD'
};


/*
 * Resourceful
 *
 * @param {String} ns
 * @param {Object} resource
 * @param {Server} app
 */

function Resourceful(ns, resource, app) {
  this.app = app;
  this.mapDefaultActions(ns, resource);
}


/*
 * maps available CRUD actions
 *
 * @param {String} ns
 * @param {Object} actions
 * @api private
 */

Resourceful.prototype.mapDefaultActions = function(ns, actions) {
  var self = this;

  defaultActions.forEach(function(conf, i) {
    var name = conf[0];
    var verb = conf[1];
    var path = normalizePath(ns, conf[2]);
    var action = actions[name];

    if (action) {
      drawRoute.apply(self.app, [verb, path, action]);
    }
  });
};


/*
 * apply routes
 *
 * @param {String} verb
 * @param {String} path
 * @param {Function|Array} action
 * @api private
 */

function drawRoute(verb, path, action) {
  verb = verb.toLowerCase();

  this[verb](path, action);
}


/*
 * noramlize path for double / and remove the ending /
 *
 * @param {String} ns
 * @param {String} path
 * @return {String}
 * @api private
 */

function normalizePath(ns, path) {
  if ('/' === ns && '/' === path) {
    return path;
  }

  return [ns, path]
    .join('/')
    .replace(/\/{2,}/g, '/') // remove double /
    .replace(/\/$/g, '');    // remove ending /
}


/*
 * maps an object
 *
 * @param {String} ns
 * @param {Object} resource
 * @api public
 */

app.resources = function(ns, resource) {
  new Resourceful(ns, resource, this);
};


/*
 * maps a single path
 *
 * @param {String} verb
 * @param {String} path
 * @param {Function|Array} action
 * @api public
 */

app.resourceMatch = function(verb, path, action) {
  drawRoute.apply(this, [verb, path, action]);
};

