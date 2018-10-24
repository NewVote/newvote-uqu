'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local')
	.Strategy,
	User = require('mongoose')
	.model('User');

module.exports = function () {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password'
		},
		function (username, password, done) {
			User.findOne({
				email: username.toLowerCase()
			}, function (err, user) {
				if(err) {
					return done(err);
				}
				if(!user) {
					return done(null, false, {
						message: 'Email not found',
						status: 404
					});
				}
				else if(!user.authenticate(password)) {
					return done(null, false, {
						message: 'Invalid email or password',
						status: 401
					});
				}

				return done(null, user);
			});
		}));
};
