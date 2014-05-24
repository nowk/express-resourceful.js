/* jshint node: true */

var request = require('supertest');
var Q = require('q');

/*
 * standard controller
 */

exports.controller = {
  index: fn,
  new: fn,
  create: fn,
  show: fn,
  edit: fn,
  update: fn,
  patch: fn,
  destroy: fn
};

/*
 * assert request
 *
 * @param {Application} app
 * @return {Promise}
 */

exports.assertRequest = function(app) {
  return function(method, path, status) {
    var defer = Q.defer();
    request(app)[method](path)
      .expect(status)
      .end(function(err, res) {
        if (err) {
          defer.reject(err);
        }
        defer.resolve(res);
      });
    return defer.promise;
  };
};

/*
 * expose fn
 */

exports.fn = fn;

/*
 * middleware acts as action sends params back as body
 */

function fn(req, res, next) {
  var params = {};
  for(var key in req.params) {
    params[key] = req.params[key];
  }
  res.send(params);
}

/*
 * just next
 */

exports.nextMiddleware = function(req, res, next) {
  next();
};

/*
 * mimic failed auth middleware
 */

exports.auth = function(req, res, next) {
  res.send({}, 401);
};

