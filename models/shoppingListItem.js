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
	name: {
		type: String,
		default: '',
		trim: true
	}
});


// /**
//  * Statics
// */
// ShoppingListItemSchema.statics.load = function(id, cb) {
// 	this.findOne({
// 		_id: id
// 	}).exec(cb);
// };

mongoose.model('ShoppingListItem', ShoppingListItemSchema);