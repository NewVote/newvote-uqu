'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	config = require(path.resolve('./config/config')),
	Suggestion = mongoose.model('Suggestion'),
	Issue = mongoose.model('Issue'),
	Solution = mongoose.model('Solution'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	nodemailer = require('nodemailer'),
	transporter = nodemailer.createTransport(config.mailer.options),
	_ = require('lodash');

var buildMessage = function (suggestion, req) {
	debugger;
	var messageString = '';
	var url = req.protocol + '://' + req.get('host');
	if(suggestion.type == 'new') {
		messageString += '<h2> This is a new suggestion' + '</h2>';
		messageString += '<h3>Title: ' + suggestion.title + '</h3>';
	}else {
		messageString += '<h2> This is an edit for:' + '</h2>';
		messageString += `<h3>Title: <a href='${url}/${suggestion.parentType.toLowerCase()}s/${suggestion.parent._id}'>` + suggestion.title + '</a></h3>';
	}

	messageString += '<p>User: ' + suggestion.user.firstName + ' ' + suggestion.user.lastName + '(' + suggestion.user.email + ')</p>';
	messageString += '<h3>Summary: </h3>';
	messageString += '<p>' + suggestion.description + '</p>';
	messageString += '<h3>Starting Statements: </h3>';
	messageString += '<p>' + suggestion.statements + '</p>';
	messageString += '<h3>3rd Party Media: </h3>';
	messageString += '<p>' + suggestion.media + '</p>';

	return messageString;
};

/**
 * Create a suggestion
 */
exports.create = function (req, res) {
	var suggestion = new Suggestion(req.body);
	suggestion.user = req.user;
	suggestion.save(function (err) {
		if(err) {
			return res.status(400)
				.send({
					message: errorHandler.getErrorMessage(err)
				});
		} else {
			Suggestion.populate(suggestion, { path: 'user parent' })
				.then(function (suggestion) {
					// console.log(buildMessage(suggestion, req));
					// console.log(process.env);
					transporter.sendMail({
							from: process.env.MAILER_FROM,
							// to: 'dion@newvote.org.au',
							to: process.env.MAILER_TO,
							replyTo: req.user.email,
							subject: 'UQ Votes Suggestion',
							html: buildMessage(suggestion, req)
						})
						.then(function (data) {
							console.log('mailer success: ', data);
						}, function (err) {
							console.log('mailer failed: ', err);
						});
				});
			res.json(suggestion);
		}
	});
};

/**
 * Show the current suggestion
 */
exports.read = function (req, res) {
	res.json(req.suggestion);
};

/**
 * Update a suggestion
 */
exports.update = function (req, res) {
	var suggestion = req.suggestion;
	_.extend(suggestion, req.body);
	// suggestion.title = req.body.title;
	// suggestion.content = req.body.content;

	suggestion.save(function (err) {
		if(err) {
			return res.status(400)
				.send({
					message: errorHandler.getErrorMessage(err)
				});
		} else {
			res.json(suggestion);
		}
	});
};

/**
 * Delete an suggestion
 */
exports.delete = function (req, res) {
	var suggestion = req.suggestion;

	suggestion.remove(function (err) {
		if(err) {
			return res.status(400)
				.send({
					message: errorHandler.getErrorMessage(err)
				});
		} else {
			res.json(suggestion);
		}
	});
};

/**
 * List of Suggestions
 */
exports.list = function (req, res) {
	var issueId = req.query.issueId;
	var solutionId = req.query.solutionId;
	var searchParams = req.query.search;
	var query;
	if(issueId) {
		query = {
			issues: issueId
		};
	} else if(solutionId) {
		query = {
			solutions: solutionId
		};
	} else if(searchParams) {
		query = {
			title: {
				$regex: searchParams,
				$options: 'i'
			}
		};
	} else {
		query = null;
	}

	Suggestion.find(query)
		.sort('-created')
		.populate('user', 'displayName')
		.exec(function (err, suggestions) {
			if(err) {
				return res.status(400)
					.send({
						message: errorHandler.getErrorMessage(err)
					});
			} else {
				res.json(suggestions);
			}
		});
};

/**
 * Suggestion middleware
 */
exports.suggestionByID = function (req, res, next, id) {

	if(!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400)
			.send({
				message: 'Suggestion is invalid'
			});
	}

	Suggestion.findById(id)
		.populate('user', 'displayName')
		.populate('issues')
		.populate('solutions')
		.exec(function (err, suggestion) {
			if(err) {
				return next(err);
			} else if(!suggestion) {
				return res.status(404)
					.send({
						message: 'No suggestion with that identifier has been found'
					});
			}
			req.suggestion = suggestion;
			next();
		});
};
