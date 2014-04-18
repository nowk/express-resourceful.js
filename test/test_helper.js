/* jshint node: true, esnext: true */

const request = require('supertest');
const Q = require('q');


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
 */

exports.assertRequest = function(app) {
  return function(method, path, status) {
    var defer = Q.defer();

    request(app)[method](path)
      .expect(status)
      .end(function(err, res) {
        if (err) throw err;
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

  'use strict';

  let params = {};

  for(let key in req.params) {
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

