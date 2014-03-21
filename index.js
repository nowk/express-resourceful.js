/* jshint laxcomma: true, node: true */

var inflect = require('i')();
var express = require('express');
var app = express.application;


/*
 * crud actions
 *
 * [name, verb, path]
 */

var defaultActions = [
  ['index',    'get',    '/'],
  ['new',      'get',    '/new'],
  ['show',     'get',    '/:id'],
  ['create',   'post',   '/'],
  ['edit',     'get',    '/:id/edit'],
  ['update',   'put',    '/:id'],
  ['patch',    'patch',  '/:id'],
  ['destroy',  'del',    '/:id']
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
 * @param {Resourceful|null} resource
 * @param {String} ns
 * @param {Object} actions
 * @param {Server} app
 * @api private
 */

function Resourceful(resource, ns, actions, app) {
  this.parentResource = resource;
  this.actions = actions;
  this.path = generatePath(this.parentResource, ns);
  this.app = app;
}


/*
 * maps available CRUD actions
 *
 * @api private
 */

Resourceful.prototype.mapDefaultActions = function() {
  var self = this;

  defaultActions.forEach(function(conf, i) {
    var name = conf[0];
    var verb = conf[1];
    var path = generatePath(null, self.path, conf[2]);
    var action = self.actions[name];

    if (action) {
      drawRoute.apply(self.app, [verb, path, action]);
    }
  });
};


/*
 * creates nested resources
 *
 * @api public
 */

Resourceful.prototype.resources = resources;


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
 * creates resources
 *
 * @param {String} ns
 * @param {Object} actions
 * @param {Function} nestedResource
 * @return {Resourceful}
 * @api private
 */

function resources() {
  var ns = arguments[0];
  var actions = notEmpty(arguments[1]) ? arguments[1] : null;
  var nestedResource = actions ? arguments[2] : arguments[1];
  var parentResource = (this instanceof Resourceful) ? this : null;
  var app = (this instanceof Resourceful) ? this.app : this;

  var resource = new Resourceful(parentResource, ns, actions, app);

  if (actions) {
    resource.mapDefaultActions();
  }

  if ('function' === typeof nestedResource && nestedResource.length === 1) {
    nestedResource(resource);
  }

  return resource;
}


/*
 * check emptyness of object
 *
 * @param {Object} obj
 * @return {Bool}
 * @api private
 */

function notEmpty(obj) {
  if (!obj || 'object' !== typeof obj) {
    return false;
  }

  return Object.keys(obj).length > 0;
}


/*
 * generates path
 *
 * @param {Resourceful} resource
 * @param {String} ns
 * @param {String} path
 * @return string
 * @api private
 */

function generatePath(resource, ns, path) {
  var pathSchema = [ns, path];

  if (pathSchema === ['/', '/']) {
    return path;
  }

  // nested paths
  if (resource) {
    pathSchema = [resource.path, ns];

    if (notEmpty(resource.actions)) {
      var idname = inflect.singularize(resource.path.split('/').pop());
      pathSchema.splice(1, 0, ':'+idname+'_id');
    }
  }

  return normalizePath(pathSchema.join('/'));
}


/*
 * noramlize path for double / and remove the ending /
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

function normalizePath(path) {
  return path
    .replace(/\/{2,}/g, '/')        // remove double /
    .replace(/([^\/])(\/)$/, '$1'); // remove ending / only if it's not alone
}


/*
 * create resources
 *
 * @api public
 */

app.resources = resources;


/*
 * maps a single path
 *
 * @api public
 */

app.resourceMatch = drawRoute;

