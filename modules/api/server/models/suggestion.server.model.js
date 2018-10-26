'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var SuggestionSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  type: {
	  type: String,
	  default: '',
  },
  title: {
    type: String,
    trim: true,
    required: 'Title cannot be empty'
  },
  description: {
    type: String,
    default: '',
    trim: true,
    required: 'Summary cannot be empty'
  },
  statements: {
    type: String,
    default: '',
    trim: true
  },
  media: {
    type: String,
    default: '',
    trim: true,
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  parentType: {
	  type: String,
	  required: function() { return this.parent }
  },
  parent: {
    type: Schema.ObjectId,
    refPath: 'parentType'
  }
});

mongoose.model('Suggestion', SuggestionSchema);
