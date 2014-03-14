"use strict";


/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;



/**
 * Tabs Schema
 */
var ShoppingListItemSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	name: {
		type: String,
		default: '',
		trim: true
	},
	location: {
		type: Schema.ObjectId,
		ref: 'Location'
	}
});


// /**
//  * Statics
// */
ShoppingListItemSchema.statics.load = function(id, cb) {
	this.findOne({
		_id: id
	}).populate({ path: 'location', model: 'override'}).exec(cb);
};

mongoose.model('ShoppingListItem', ShoppingListItemSchema);