# Express Resourceful

Route utility for express.js

# Installation

    npm install express-resourceful.js

# Example

Setup Express Resourceful

    var express = require('express');
    var Resourceful = require('express-resourceful.js');

    var app = express();

---

`#resources` maps an object of CRUD actions.

    app.resources('/posts', {
      index:    function(req, res, next) { ... },
      new:      function(req, res, next) { ... },
      create:   function(req, res, next) { ... },
      show:     function(req, res, next) { ... },
      edit:     function(req, res, next) { ... },
      update:   function(req, res, next) { ... },
      patch:    function(req, res, next) { ... },
      destroy:  function(req, res, next) { ... },
    });

    # GET    '/posts'
    # GET    '/posts/new'
    # POST   '/posts'
    # GET    '/posts/:id'
    # GET    '/posts/:id/edit'
    # PUT    '/posts/:id'
    # PATCH  '/posts/:id'
    # DELETE '/posts/:id'

You may omit actions if you don't need them, those will not be mapped.

---

`#resourceMatch` maps a single route.

    app.resourceMatch(Resourceful.verbs.POST, '/login', function(req, res, next) {
      ...
    });

---

For middleware support pass an array to the action. The actual response should always be last item in the array. Middlewares will be ordered in the order they are defined in the array.

    var auth = express.basicAuth('login', 'password');

    app.resource('/posts', {
      index: [auth, function(req, res, next) { ... }],
      new:   [auth, function(req, res, next) { ... }],
      ...
    })

    app.resourceMatch(Resourceful.verbs.DELETE, '/posts/123', [auth, function(req, res, next) {
      ...
    }]);

# Notes

Inspired by [express-resource](https://github.com/visionmedia/express-resource) & [Rails routing](http://api.rubyonrails.org/classes/ActionDispatch/Routing.html)

# License

MIT
