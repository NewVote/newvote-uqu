'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Proposal = mongoose.model('Proposal'),
	votes = require('./votes.server.controller'),
	Solution = mongoose.model('Solution'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	_ = require('lodash');

/**
 * Create a proposal
 */
exports.create = function (req, res) {
	var proposal = new Proposal(req.body);
	proposal.user = req.user;
	proposal.save(function (err) {
		if(err) {
			return res.status(400)
				.send({
					message: errorHandler.getErrorMessage(err)
				});
		} else {
			res.json(proposal);
		}
	});
};

/**
 * Show the current proposal
 */
exports.read = function (req, res) {
	res.json(req.proposal);
};

/**
 * Update a proposal
 */
exports.update = function (req, res) {
	var proposal = req.proposal;
	_.extend(proposal, req.body);
	// proposal.title = req.body.title;
	// proposal.content = req.body.content;
	proposal.user = req.user;
	proposal.save(function (err) {
		if(err) {
			return res.status(400)
				.send({
					message: errorHandler.getErrorMessage(err)
				});
		} else {
			res.json(proposal);
		}
	});
};

/**
 * Delete an proposal
 */
exports.delete = function (req, res) {
	var proposal = req.proposal;

	proposal.remove(function (err) {
		if(err) {
			return res.status(400)
				.send({
					message: errorHandler.getErrorMessage(err)
				});
		} else {
			res.json(proposal);
		}
	});
};

/**
 * List of Proposals
 */
exports.list = function (req, res) {
	var solutionId = req.query.solutionId;
	var searchParams = req.query.search;
	var proposalId = req.query.proposalId;
	var issueId = req.query.issueId;
	var getQuery = function () {
		return new Promise(function (resolve, reject) {
			//build thhe query
			if(solutionId) {
				return resolve({ $or: [{ solutions: solutionId }, { solution: solutionId }, { proposals: solutionId }, { proposal: solutionId }] });
			} else if(issueId) {
				//get the solutions for an issue
				//create query to find any proposals with matching solutionId's
				Solution.find({ issues: issueId })
					.then(function (solutions) {
						// console.log('Solution.find query found: ', solutions.length);
						var solutionIds = solutions.map(function (solution) {
							return solution._id;
						});
						return resolve({ $or: [{ solutions: { $in: solutionIds } }, { proposals: { $in: solutionIds } }] });
					});
			} else if(searchParams) {
				return resolve({ title: { $regex: searchParams, $options: 'i' } });
			} else {
				return resolve(null);
			}
		});
	};

	getQuery()
		.then(function (query) {
			// console.log('query from promise is: ', query);
			Proposal.find(query)
				.sort('-created')
				.populate('user', 'displayName')
				.populate('solutions', 'title')
				.exec(function (err, proposals) {
					if(err) {
						return res.status(400)
							.send({
								message: errorHandler.getErrorMessage(err)
							});
					} else {
						updateSchema(proposals);
						votes.attachVotes(proposals, req.user, req.query.regions)
							.then(function (proposals) {
								res.json(proposals);
							})
							.catch(function (err) {
								res.status(500)
									.send({
										message: errorHandler.getErrorMessage(err)
									});
							});
					}
				});
		});
};

/**
 * Proposal middleware
 */
exports.proposalByID = function (req, res, next, id) {

	if(!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400)
			.send({
				message: 'Proposal is invalid'
			});
	}

	Proposal.findById(id)
		.populate('user', 'displayName')
		.populate('solutions')
		.populate('solution')
		.exec(function (err, proposal) {
			if(err) {
				return next(err);
			} else if(!proposal) {
				return res.status(404)
					.send({
						message: 'No proposal with that identifier has been found'
					});
			}
			updateSchema([proposal]);
			votes.attachVotes([proposal], req.user, req.query.regions)
				.then(function (proposalArr) {
					req.proposal = proposalArr[0];
					next();
				})
				.catch(next);
		});
};

function updateSchema(proposals) {
	console.log('schema update called');
	for(var i = 0; i < proposals.length; i++) {
		var proposal = proposals[i];
		console.log('testing: ', proposal.title);
		if(proposal.goals && proposal.goals.length > 0){
			proposal.solutions = proposal.goals;
			// proposal.goal = undefined;
			proposal.goals = undefined;
			delete proposal.goals;

			console.log('updated: ', proposal.title);
			proposal.save()
				.then(() => console.log('saved proposal'));
		}
	}
}
