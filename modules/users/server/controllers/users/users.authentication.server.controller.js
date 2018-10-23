'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	config = require(path.resolve('./config/config')),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	nodemailer = require('nodemailer'),
	transporter = nodemailer.createTransport(config.mailer.options),
	Mailchimp = require('mailchimp-api-v3'),
	Recaptcha = require('recaptcha-verify');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
	'/authentication/signin',
	'/authentication/signup'
];

var recaptcha = new Recaptcha({
	secret: config.reCaptcha.secret,
	verbose: true
});

var mailchimp = new Mailchimp(config.mailchimp.api);
const MAILCHIMP_LIST_ID = config.mailchimp.list;

var addToMailingList = function(user) {
	return mailchimp.post(`/lists/${MAILCHIMP_LIST_ID}/members`, {
		email_address: user.email,
		status: 'subscribed'
	})
}

/**
 * Signup
 */
exports.signup = function (req, res) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Init Variables
	var user = new User(req.body);
	var message = null;
	var recaptchaResponse = req.body.recaptchaResponse;

	//ensure captcha code is valid or return with an error
	recaptcha.checkResponse(recaptchaResponse, function (err, response) {
		console.log(response);
		if(err) {
			return res.status(400)
				.send({
					message: errorHandler.getErrorMessage(err)
				});
		}

		if(!response.success) {
			return res.status(400)
				.send({
					message: 'CAPTCHA verification failed'
				});
		} else {
			//user is not a robot, captcha success, continue with sign up

			// Add missing user fields
			user.provider = 'local';
			//set the username to e-mail to satisfy unique indexes
			//we cant just remove username as its the index for the table
			//we'd have to drop the entire table to change the index field
			user.username = user.email;

			addToMailingList(user).then(results => {
				// console.log('Added user to mailchimp');
			}).catch(err => {
				console.log('Error saving to mailchimp: ', err);
			})

			// Then save the user
			// first save generates salt
			return user.save()
				.then(user => {
					//generate a verification code for Email
					User.generateRandomPassphrase()
						.then(pass => {
							user.verificationCode = user.hashVerificationCode(pass);
							user.save().then(() => {
								// sendEmail(user, pass, req)

								// Remove sensitive data before login
								user.password = undefined;
								user.salt = undefined;
								req.login(user, function (err) {
									if(err) {
										res.status(400)
										.send(err);
									} else {
										res.json(user);
									}
								});
							});
						})
				})
				.catch(err => {
					return res.status(400)
						.send({
							message: errorHandler.getErrorMessage(err)
						});
				})
		}
	});
};

var buildMessage = function (user, code, req) {
	var messageString = '';
	var url = req.protocol + '://' + req.get('host') + '/verify/' + code;

	messageString += `<h3> Welcome ${user.firstName} </h3>`;
	messageString += `<p>Thank you for joining the NewVote platform, you are almost ready to start having your say!
	To complete your account setup, just click the URL below or copy and paste it into your browser's address bar</p>`;
	messageString += `<p><a href='${url}'>${url}</a></p>`;

	return messageString;
};

var sendEmail = function (user, pass, req) {
	return transporter.sendMail({
		from: process.env.MAILER_FROM,
		to: user.email,
		subject: 'NewVote UQU Verification',
		html: buildMessage(user, pass, req)
	})
}

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
	passport.authenticate('local', function (err, user, info) {
		if(err || !user) {
			res.status(400)
				.send(info);
		} else {
			User.populate(user, { path: 'country' })
				.then(function (user) {

					// Remove sensitive data before login
					user.password = undefined;
					user.salt = undefined;

					req.login(user, function (err) {
						if(err) {
							res.status(400)
								.send(err);
						} else {
							res.json(user);
						}
					});
				});
		}
	})(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
	req.logout();
	res.redirect('/');
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
	return function (req, res, next) {
		// Set redirection path on session.
		// Do not redirect to a signin or signup page
		if(noReturnUrls.indexOf(req.query.redirect_to) === -1) {
			req.session.redirect_to = req.query.redirect_to;
		}
		// Authenticate
		passport.authenticate(strategy, scope)(req, res, next);
	};
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
	return function (req, res, next) {
		// Pop redirect URL from session
		var sessionRedirectURL = req.session.redirect_to;
		delete req.session.redirect_to;

		passport.authenticate(strategy, function (err, user, redirectURL) {
			if(err) {
				return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
			}
			if(!user) {
				return res.redirect('/authentication/signin');
			}
			req.login(user, function (err) {
				if(err) {
					return res.redirect('/authentication/signin');
				}
				res.locals.oauthLoginSuccess = true;
				return res.redirect(sessionRedirectURL || '/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
	if(!req.user) {
		// Define a search query fields
		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};

		User.findOne(searchQuery, function (err, user) {
			if(err) {
				return done(err);
			} else {
				if(!user) {
					var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

					User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
						user = new User({
							firstName: providerUserProfile.firstName,
							lastName: providerUserProfile.lastName,
							username: availableUsername,
							displayName: providerUserProfile.displayName,
							email: providerUserProfile.email,
							profileImageURL: providerUserProfile.profileImageURL,
							provider: providerUserProfile.provider,
							providerData: providerUserProfile.providerData
						});

						// And save the user
						user.save(function (err) {
							return done(err, user);
						});
					});
				} else {
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if(user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if(!user.additionalProvidersData) {
				user.additionalProvidersData = {};
			}

			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function (err) {
				return done(err, user, '/settings/accounts');
			});
		} else {
			return done(new Error('User is already connected using this provider'), user);
		}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
	var user = req.user;
	var provider = req.query.provider;

	if(!user) {
		return res.status(401)
			.json({
				message: 'User is not authenticated'
			});
	} else if(!provider) {
		return res.status(400)
			.send();
	}

	// Delete the additional provider
	if(user.additionalProvidersData[provider]) {
		delete user.additionalProvidersData[provider];

		// Then tell mongoose that we've updated the additionalProvidersData field
		user.markModified('additionalProvidersData');
	}

	user.save(function (err) {
		if(err) {
			return res.status(400)
				.send({
					message: errorHandler.getErrorMessage(err)
				});
		} else {
			req.login(user, function (err) {
				if(err) {
					return res.status(400)
						.send(err);
				} else {
					return res.json(user);
				}
			});
		}
	});
};
