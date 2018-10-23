'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ProposalSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		trim: true,
		required: 'Title cannot be blank'
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	imageUrl: {
		type: String,
		default: '',
		trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	solutions: [{
		type: Schema.ObjectId,
		ref: 'Solution',
        required: true
	}],
	goals: [{
		type: Schema.ObjectId,
		ref: 'Solution'
	}],
	votes: {
		up: Number,
		down: Number,
		total: Number,
		currentUser: {
			type: Schema.ObjectId,
			ref: 'Vote'
		}
	},
	likert: {
		type: Boolean,
		default: false
	}
});

mongoose.model('Proposal', ProposalSchema);
