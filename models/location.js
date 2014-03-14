"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;



/**
 * Tabs Schema
 */
var LocationSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	latitude: {
		type: Number,
		default: '',
		trim: true
	},
	longitude: {
		type: Number,
		default: '',
		trim: true
	}
});


// /**
//  * Statics
// */
LocationSchema.statics.load = function(id, cb) {
	this.findOne({
		_id: id
	}).exec(cb);
};

mongoose.model('Location', LocationSchema);